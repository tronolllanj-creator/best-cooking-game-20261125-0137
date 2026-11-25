import { CONFIG, PALETTE, RECIPES, LEVELS } from './config.js';
import { mulberry32 } from './random.js';

export const EVENT_SERVED = 'served';
export const EVENT_EXPIRED = 'expired';
export const EVENT_BURNED = 'burned';
export const EVENT_WRONG = 'wrong';
export const EVENT_SHIFT = 'shift';
export const EVENT_WIN = 'win';
export const EVENT_ORDER = 'order';

const CHEF_SPEED = 200;
const CHEF_SIZE = 16;
const CHOP_TIME = 2.0;
const GRILL_COOK_TIME = 8.0;
const GRILL_BURN_TIME = 12.0;
const MAX_ORDERS = 4;
const PLATE_SLOTS = 2;

// Station rects (same for all levels) from config
const STATIONS = LEVELS[0].stations;

// Solid counters for collision (walls + counters)
const SOLIDS = [
  // top wall
  {x:0, y:0, w:1280, h:8},
  // left wall
  {x:0, y:8, w:8, h:712},
  // right wall
  {x:1272, y:8, w:8, h:712},
  // bottom wall
  {x:0, y:712, w:1280, h:8},
  // order board area (top wall already covered)
  // crates column
  {x:8, y:120, w:160, h:460},
  // centre counters
  {x:380, y:260, w:120, h:120}, // chop board
  {x:600, y:260, w:160, h:120}, // grill
  {x:860, y:260, w:160, h:120}, // assembly
  // right side
  {x:1080, y:100, w:200, h:100}, // serve window
  {x:1080, y:500, w:200, h:100}, // trash
];

function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function chefRect(x, y) {
  return {x: x - CHEF_SIZE/2, y: y - CHEF_SIZE/2, w: CHEF_SIZE, h: CHEF_SIZE};
}

function canMoveTo(x, y) {
  const r = chefRect(x, y);
  for (const s of SOLIDS) {
    if (rectOverlap(r.x, r.y, r.w, r.h, s.x, s.y, s.w, s.h)) return false;
  }
  return true;
}

const STATION_IDS = { orderBoard: null, crateBun: 'crate_bun', crateLettuce: 'crate_lettuce', crateTomato: 'crate_tomato', crateCheese: 'crate_cheese', crateFries: 'crate_fries', cratePatty: 'crate_patty', drink: 'drink', chopBoard: 'chop', grill: 'grill', assembly: 'assembly', serve: 'serve', trash: 'trash' };
function getStationAt(x, y) {
  // nearest station within 70 px: counters are solid, so the chef stands
  // beside them and never inside their rects; return a canonical id.
  let bestName = null, bestD = 70;
  for (const [name, rect] of Object.entries(STATIONS)) {
    const cx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
    const cy = Math.max(rect.y, Math.min(y, rect.y + rect.h));
    const d = Math.hypot(x - cx, y - cy);
    if (d < bestD) { bestD = d; bestName = name; }
  }
  if (!bestName) return null;
  return STATION_IDS[bestName] || bestName;
}

function recipeToItems(recipeName) {
  return RECIPES[recipeName].items.slice();
}

function itemsMatch(a, b) {
  if (a.length !== b.length) return false;
  const ca = {};
  for (const k of a) ca[k] = (ca[k] || 0) + 1;
  for (const k of b) {
    if (!ca[k]) return false;
    ca[k]--;
  }
  return true;
}

function addFloat(state, x, y, text, color) {
  state.floats.push({x, y, text, life: 1.0, color});
}

function addParticle(state, x, y, vx, vy, life, color, type) {
  state.particles.push({x, y, vx, vy, life, maxLife: life, color, type});
}

function spawnOrder(state, rng) {
  if (state.orders.length >= MAX_ORDERS) return;
  const level = LEVELS[state.levelIndex];
  const recipeName = rng.pick(level.recipes);
  const items = recipeToItems(recipeName);
  const id = state.time * 1000 + rng.next();
  state.orders.push({
    id,
    recipe: recipeName,
    items,
    timeLeft: level.orderTime,
    total: level.orderTime
  });
  state.events.push(EVENT_ORDER);
}

function tryInteract(state, input, rng) {
  const {chef} = state;
  const station = getStationAt(chef.x, chef.y);
  if (!station) return;

  // CRATES: patty, lettuce and tomato leave the crate raw (grill/chop next)
  if (station.startsWith('crate_')) {
    const kind = station.split('_')[1];
    if (!chef.carrying) {
      chef.carrying = {kind, state: (kind === 'patty' || kind === 'lettuce' || kind === 'tomato') ? 'raw' : 'ready'};
      state.events.push('pop');
      addParticle(state, chef.x, chef.y, 0, -20, 0.5, PALETTE.star, 'pop');
    }
    return;
  }

  // DRINK MACHINE
  if (station === 'drink') {
    if (!chef.carrying) {
      chef.carrying = {kind: 'drink', state: 'ready'};
      state.events.push('pop');
    }
    return;
  }

  // CHOP BOARD
  if (station === 'chop') {
    if (chef.carrying && (chef.carrying.kind === 'lettuce' || chef.carrying.kind === 'tomato') && chef.carrying.state === 'raw') {
      if (!state.board.item) {
        state.board.item = chef.carrying;
        state.board.progress = 0;
        chef.carrying = null;
        state.events.push('pop');
      }
    } else if (!chef.carrying && state.board.item && state.board.progress >= 1.0) {
      const item = state.board.item;
      item.state = 'chopped';
      chef.carrying = item;
      state.board.item = null;
      state.events.push('pop');
    }
    return;
  }

  // GRILL
  if (station === 'grill') {
    const level = LEVELS[state.levelIndex];
    const slots = level.grillSlots;
    // find first empty slot
    let emptyIdx = -1;
    for (let i = 0; i < slots; i++) {
      if (!state.grill[i]) { emptyIdx = i; break; }
    }
    if (chef.carrying && chef.carrying.kind === 'patty' && chef.carrying.state === 'raw') {
      if (emptyIdx >= 0) {
        state.grill[emptyIdx] = {item: chef.carrying, progress: 0};
        chef.carrying = null;
        state.events.push('sizzle');
        addParticle(state, chef.x, chef.y, 0, -30, 0.8, PALETTE.grillHot, 'smoke');
      }
    } else if (!chef.carrying) {
      // try to take cooked patty
      for (let i = 0; i < slots; i++) {
        const slot = state.grill[i];
        if (slot && slot.progress >= 1.0 && slot.progress < 1.5) {
          chef.carrying = slot.item;
          chef.carrying.state = 'cooked';
          state.grill[i] = null;
          state.events.push('pop');
          break;
        }
      }
    }
    return;
  }

  // ASSEMBLY
  if (station === 'assembly') {
    // find free plate slot
    let freeSlot = -1;
    for (let i = 0; i < PLATE_SLOTS; i++) {
      if (!state.plates[i]) { freeSlot = i; break; }
    }
    if (chef.carrying) {
      if (chef.carrying.kind === 'plate') {
        // put the plate back down on a free slot
        if (freeSlot >= 0) {
          state.plates[freeSlot] = {items: chef.carrying.items, x: STATIONS.assembly.x + 20 + freeSlot * 70, y: STATIONS.assembly.y + 40};
          chef.carrying = null;
          state.events.push('pop');
        }
      } else {
        // add ingredient to plate with fewest items
        let targetIdx = -1;
        let minItems = 99;
        for (let i = 0; i < PLATE_SLOTS; i++) {
          const p = state.plates[i];
          if (p && !p.items.includes(chef.carrying.kind) && p.items.length < minItems) {
            minItems = p.items.length;
            targetIdx = i;
          }
        }
        if (targetIdx >= 0) {
          state.plates[targetIdx].items.push(chef.carrying.kind);
          chef.carrying = null;
          state.events.push('pop');
        } else if (freeSlot >= 0) {
          // start new plate with this ingredient
          const plateX = STATIONS.assembly.x + 20 + freeSlot * 70;
          const plateY = STATIONS.assembly.y + 40;
          state.plates[freeSlot] = {items: [chef.carrying.kind], x: plateX, y: plateY};
          chef.carrying = null;
          state.events.push('pop');
        }
      }
    } else {
      // empty hand: pick up the fullest plate on the counter, else start a new one
      let pickIdx = -1, mostItems = 0;
      for (let i = 0; i < PLATE_SLOTS; i++) {
        const p = state.plates[i];
        if (p && p.items.length > mostItems) { mostItems = p.items.length; pickIdx = i; }
      }
      if (pickIdx >= 0) {
        chef.carrying = {kind: 'plate', items: state.plates[pickIdx].items};
        state.plates[pickIdx] = null;
        state.events.push('pop');
      } else if (freeSlot >= 0) {
        const plateX = STATIONS.assembly.x + 20 + freeSlot * 70;
        const plateY = STATIONS.assembly.y + 40;
        state.plates[freeSlot] = {items: [], x: plateX, y: plateY};
        state.events.push('pop');
      }
    }
    return;
  }

  // SERVE WINDOW
  if (station === 'serve') {
    if (chef.carrying && chef.carrying.kind === 'plate') {
      // find matching order
      let matchIdx = -1;
      for (let i = 0; i < state.orders.length; i++) {
        if (itemsMatch(state.orders[i].items, chef.carrying.items)) {
          matchIdx = i;
          break;
        }
      }
      if (matchIdx >= 0) {
        const order = state.orders[matchIdx];
        const timeBonus = Math.round(5 * order.timeLeft);
        const gained = 100 + timeBonus;
        state.score += gained;
        state.coins += RECIPES[order.recipe].value || 10;
        state.combo += 1;
        if (state.combo > state.bestCombo) state.bestCombo = state.combo;
        state.score += 25 * state.combo;
        state.served += 1;
        state.orders.splice(matchIdx, 1);
        chef.carrying = null;
        state.events.push(EVENT_SERVED);
        addFloat(state, chef.x, chef.y - 20, '+' + gained, PALETTE.timerOk);
        addParticle(state, chef.x, chef.y, 0, -40, 1.0, PALETTE.star, 'sparkle');
      } else {
        // wrong serve
        state.score -= 10;
        state.combo = 0 // streak resets on expiry or a wrong serve;
        state.shake = 0.3;
        state.events.push(EVENT_WRONG);
        addFloat(state, chef.x, chef.y - 20, '-10', PALETTE.timerLow);
      }
    }
    return;
  }

  // TRASH
  if (station === 'trash') {
    if (chef.carrying) {
      chef.carrying = null;
      state.events.push('pop');
    }
    return;
  }
}

export function createWorld(rng, levelIndex) {
  const level = LEVELS[levelIndex];
  return {
    levelIndex,
    _rng: rng, // seeded generator, stored so step() can spawn orders
    shiftTime: 0,
    shiftLength: level.shiftLength,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    missed: 0,
    orders: [],
    chef: {x: 640, y: 500, dir: 0, carrying: null, work: false, workTarget: null},
    grill: new Array(level.grillSlots).fill(null),
    board: {item: null, progress: 0},
    plates: new Array(PLATE_SLOTS).fill(null),
    readyPlate: null,
    particles: [],
    floats: [],
    events: [],
    shake: 0,
    time: 0
  };
}

export function step(state, input, dt) {
  state.time += dt;
  state.shake = Math.max(0, state.shake - dt * 2);

  // --- INPUT ---
  const {chef} = state;
  let dx = 0, dy = 0;
  if (input.keys.has('w') || input.keys.has('ArrowUp')) dy -= 1;
  if (input.keys.has('s') || input.keys.has('ArrowDown')) dy += 1;
  if (input.keys.has('a') || input.keys.has('ArrowLeft')) dx -= 1;
  if (input.keys.has('d') || input.keys.has('ArrowRight')) dx += 1;
  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx /= len; dy /= len;
    chef.dir = Math.atan2(dy, dx);
    const nx = chef.x + dx * CHEF_SPEED * dt;
    const ny = chef.y + dy * CHEF_SPEED * dt;
    if (canMoveTo(nx, chef.y)) chef.x = nx;
    if (canMoveTo(chef.x, ny)) chef.y = ny;
  }

  // Work action (Space) - speeds up chop board and grill
  chef.work = input.actions.work;

  // Interact (E or click)
  if (input.actions.interact) {
    tryInteract(state, input, null);
    input.actions.interact = false; // one press, one interaction
  }
  // Mouse click on station
  for (const click of input.clickQueue) {
    const station = getStationAt(click.x, click.y);
    if (station) {
      // simulate chef at that station for interaction
      const oldX = chef.x, oldY = chef.y;
      chef.x = click.x; chef.y = click.y;
      tryInteract(state, input, null);
      chef.x = oldX; chef.y = oldY;
    }
  }
  input.clickQueue.length = 0; // clicks are consumed once

  // --- STATION UPDATES ---
  // Chop board
  if (state.board.item) {
    const speed = chef.work && getStationAt(chef.x, chef.y) === 'chop' ? 2.0 : 1.0;
    state.board.progress += dt / CHOP_TIME * speed;
    if (state.board.progress >= 1.0) {
      state.board.progress = 1.0;
      // add chop particles
      if (state._rng.next() < 0.1) addParticle(state, STATIONS.chopBoard.x + 60, STATIONS.chopBoard.y + 60, (state._rng.next()-0.5)*50, (state._rng.next()-0.5)*50, 0.5, PALETTE.text, 'chop'); // seeded rng only
    }
  }

  // Grill
  const level = LEVELS[state.levelIndex];
  for (let i = 0; i < level.grillSlots; i++) {
    const slot = state.grill[i];
    if (slot) {
      const speed = chef.work && getStationAt(chef.x, chef.y) === 'grill' ? 2.0 : 1.0;
      slot.progress += dt / GRILL_COOK_TIME * speed;
      // smoke particles
      if (slot.progress < 1.0 && state._rng.next() < 0.05) { // seeded
        addParticle(state, STATIONS.grill.x + 40 + i*80, STATIONS.grill.y + 60, (state._rng.next()-0.5)*20, -30 - state._rng.next()*20, 0.8, PALETTE.grillHot, 'smoke'); // seeded
      }
      if (slot.progress >= 1.5) {
        // burned
        state.grill[i] = null;
        state.events.push(EVENT_BURNED);
        addParticle(state, STATIONS.grill.x + 40 + i*80, STATIONS.grill.y + 60, 0, -40, 1.0, PALETTE.pattyBurned, 'burn');
      }
    }
  }

  // --- ORDER SPAWNING ---
  state.spawnTimer = (state.spawnTimer || 0) + dt;
  if (state.spawnTimer >= level.spawnInterval) {
    state.spawnTimer = 0;
    spawnOrder(state, state._rng); // rng stored on the state by createWorld
  }
  // rng lives on state._rng (stored by createWorld).

  // --- ORDER TIMERS ---
  for (let i = state.orders.length - 1; i >= 0; i--) {
    const order = state.orders[i];
    order.timeLeft -= dt;
    if (order.timeLeft <= 0) {
      state.orders.splice(i, 1);
      state.score -= 50;
      state.combo = 0;
      state.missed += 1;
      state.events.push(EVENT_EXPIRED);
      addFloat(state, 1180, 100 + i * 80, '-50', PALETTE.timerLow);
    }
  }

  // --- PARTICLES & FLOATS ---
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
  for (let i = state.floats.length - 1; i >= 0; i--) {
    const f = state.floats[i];
    f.y -= 30 * dt;
    f.life -= dt;
    if (f.life <= 0) state.floats.splice(i, 1);
  }

  // --- SHIFT TIMER ---
  state.shiftTime += dt;
  if (state.shiftTime >= state.shiftLength) {
    state.events.push(EVENT_SHIFT);
    if (state.levelIndex === 2) {
      state.events.push(EVENT_WIN);
    }
  }

  // Clear events that are not persistent? The render/audio will consume them. We'll leave them for one frame.
  // But we need to clear them after they are read. The spec doesn't specify. We'll keep them and let the consumer clear? Better to clear at end of step.
  // However, the events array is part of state shape. We'll clear it at the start of next step? Let's clear at end of step after processing.
  // But the render step happens after step? The main loop: step then render. So we should keep events for render to read, then clear at start of next step.
  // We'll clear at the beginning of step.
  // Actually, we'll clear at the start of step (but we already added events above). Let's move the clear to the very top.
}

// We need to adjust: clear events at start of step.
// Let's rewrite step with that in mind.

// But we already wrote the function. We'll replace the exported step with a corrected version.
// Since we cannot have two exports, we'll just rewrite the whole module in the final output.
// Let's produce the final corrected code now.

// We'll also need to store rng in state. The spec says state shape exactly, but we can add _rng as internal.
// We'll do that in createWorld.

// Also, the spawnTimer should be in state. We'll add _spawnTimer.

// Let's write the final version.