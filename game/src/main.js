import { CONFIG, PALETTE, RECIPES, LEVELS } from './config.js';
import { createRng } from './random.js';
import { createWorld, step, EVENT_SERVED, EVENT_EXPIRED, EVENT_BURNED, EVENT_WRONG, EVENT_SHIFT, EVENT_WIN, EVENT_ORDER } from './world.js';
import { createInput } from './input.js';
import { createRenderer, SCREEN_TITLE, SCREEN_PLAY, SCREEN_PAUSED, SCREEN_SHIFT, SCREEN_WIN } from './render.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');

let screen = SCREEN_TITLE;
let best = 0;
let lastTime = 0;
let accum = 0;
const FIXED_DT = 1 / 60;
let running = false;
let shotMode = false;

function announce(msg) {
  if (statusEl) statusEl.textContent = msg;
}

function loadBest() {
  try { best = parseInt(localStorage.getItem('sizzle_best') || '0', 10); } catch { best = 0; }
}

function saveBest(score) {
  if (score > best) {
    best = score;
    try { localStorage.setItem('sizzle_best', String(best)); } catch {}
  }
}

function setScreen(next) {
  screen = next;
  const names = { [SCREEN_TITLE]: 'Title', [SCREEN_PLAY]: 'Play', [SCREEN_PAUSED]: 'Paused', [SCREEN_SHIFT]: 'Shift Clear', [SCREEN_WIN]: 'Victory' };
  announce(names[next] || 'Game');
}

function parseParams() {
  const p = new URLSearchParams(location.search);
  const seed = p.get('seed');
  const shot = p.get('shot');
  return { seed: seed ? parseInt(seed, 10) : Date.now() & 0xffffffff, shot };
}

async function init() {
  loadBest();
  const { seed, shot } = parseParams();
  const rng = createRng(seed);
  const audio = createAudio();
  const input = createInput(canvas);
  const renderer = createRenderer(canvas);
  let state = createWorld(rng, 0);
  state.audio = audio;

  window.addEventListener('error', e => { window.__shotError = e.message; }); // before the shot branch, so shot errors are caught

  if (shot) {
    shotMode = true;
    const staged = stageShot(state, shot, rng);
    state = staged.state;
    screen = staged.screen;
    best = staged.best;
    renderer.draw(state, screen, best);
    renderer.draw(state, screen, best);
    window.__shotReady = true;
    return;
  }

  canvas.addEventListener('click', () => audio.unlock()); // error listener moved above the shot branch
  document.addEventListener('keydown', () => audio.unlock());

  function loop(ts) {
    if (!lastTime) lastTime = ts;
    const frameMs = ts - lastTime;
    lastTime = ts;
    accum += frameMs / 1000;

    input.update();

    if (screen === SCREEN_PLAY) {
      while (accum >= FIXED_DT) {
        state = step(state, input, FIXED_DT);
        accum -= FIXED_DT;

        if (state.events.length) {
          for (const ev of state.events) {
            if (ev === EVENT_SERVED) audio.ding();
            else if (ev === EVENT_EXPIRED) audio.burn();
            else if (ev === EVENT_BURNED) audio.burn();
            else if (ev === EVENT_WRONG) audio.burn();
            else if (ev === EVENT_SHIFT) audio.fanfare();
            else if (ev === EVENT_WIN) audio.win();
            else if (ev === EVENT_ORDER) audio.chime();
            else if (ev === 'pop') audio.pop();
            else if (ev === 'sizzle') audio.sizzle();
          } // events are plain strings from world.js
          state.events = [];
        }

        if (input.actions.pause) { setScreen(SCREEN_PAUSED); input.actions.pause = false; }
        if (state.shiftTime >= state.shiftLength) {
          if (state.levelIndex < LEVELS.length - 1) {
            setScreen(SCREEN_SHIFT);
            saveBest(state.score);
          } else {
            setScreen(SCREEN_WIN);
            saveBest(state.score);
          }
        }
      }
    } else if (screen === SCREEN_TITLE) {
      if (input.actions.confirm) { setScreen(SCREEN_PLAY); state = createWorld(rng, 0); state.audio = audio; }
    } else if (screen === SCREEN_PAUSED) {
      if (input.actions.pause) { setScreen(SCREEN_PLAY); input.actions.pause = false; }
      if (input.actions.restart) { state = createWorld(rng, 0); state.audio = audio; setScreen(SCREEN_PLAY); }
    } else if (screen === SCREEN_SHIFT) {
      if (input.actions.confirm) {
        const nextIdx = state.levelIndex + 1;
        if (nextIdx < LEVELS.length) {
          const keep = { score: state.score, coins: state.coins, bestCombo: state.bestCombo, served: state.served, missed: state.missed };
          state = createWorld(rng, nextIdx);
          state.audio = audio;
          Object.assign(state, keep);
          setScreen(SCREEN_PLAY);
        }
      }
    } else if (screen === SCREEN_WIN) {
      if (input.actions.restart || input.actions.confirm) {
        state = createWorld(rng, 0);
        state.audio = audio;
        setScreen(SCREEN_TITLE);
      }
    }

    if (input.actions.mute) { audio.setMuted(!audio.muted); input.actions.mute = false; }

    renderer.draw(state, screen, best);
    if (!shotMode) requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

init();
