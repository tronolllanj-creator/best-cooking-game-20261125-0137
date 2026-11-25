export function createAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0.35;
  master.connect(ctx.destination);
  let muted = false;

  function unlock() {
    if (ctx.state === 'suspended') ctx.resume();
  }

  function setMuted(m) {
    muted = m;
    master.gain.value = m ? 0 : 0.35;
  }

  // helper: play a tone with given freq, type, duration, gain envelope
  function tone(freq, type, dur, gainEnv) {
    if (muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gainEnv(gain.gain);
    osc.connect(gain).connect(master);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }

  // helper: noise burst
  function noise(dur, filterFn, gainEnv) {
    if (muted) return;
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filterFn(filter);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gainEnv(gain.gain);
    src.connect(filter).connect(gain).connect(master);
    src.start();
    src.stop(ctx.currentTime + dur);
  }

  // chop: short low thock
  function chop() {
    tone(120, 'sine', 0.12, g => {
      g.setValueAtTime(0.6, ctx.currentTime);
      g.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    });
  }

  // sizzle: short filtered noise blip
  function sizzle() {
    noise(0.08, f => { f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 2; }, g => {
      g.setValueAtTime(0.25, ctx.currentTime);
      g.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    });
  }

  // ding: high bell
  function ding() {
    tone(880, 'sine', 0.5, g => {
      g.setValueAtTime(0.4, ctx.currentTime);
      g.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    });
    tone(1320, 'sine', 0.35, g => {
      g.setValueAtTime(0.2, ctx.currentTime + 0.02);
      g.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.37);
    });
  }

  // pop: quick pluck
  function pop() {
    tone(300, 'triangle', 0.07, g => {
      g.setValueAtTime(0.5, ctx.currentTime);
      g.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    });
  }

  // burn: low buzz
  function burn() {
    tone(80, 'sawtooth', 0.4, g => {
      g.setValueAtTime(0.3, ctx.currentTime);
      g.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    });
    tone(160, 'sawtooth', 0.3, g => {
      g.setValueAtTime(0.15, ctx.currentTime + 0.02);
      g.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    });
  }

  // chime: two-tone arrival
  function chime() {
    tone(660, 'sine', 0.25, g => {
      g.setValueAtTime(0.35, ctx.currentTime);
      g.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    });
    tone(990, 'sine', 0.2, g => {
      g.setValueAtTime(0.25, ctx.currentTime + 0.05);
      g.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    });
  }

  // fanfare: shift clear 3-note major chord arpeggio
  function fanfare() {
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((f, i) => {
      tone(f, 'square', 0.25, g => {
        g.setValueAtTime(0.25, ctx.currentTime + i * 0.1);
        g.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.25);
      });
    });
    // final chord
    notes.forEach(f => tone(f, 'sine', 0.6, g => {
      g.setValueAtTime(0.15, ctx.currentTime + 0.3);
      g.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    }));
  }

  // win: ascending arpeggio
  function win() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((f, i) => {
      tone(f, 'sine', 0.3, g => {
        g.setValueAtTime(0.3, ctx.currentTime + i * 0.08);
        g.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
      });
    });
  }

  return { unlock, chop, sizzle, ding, pop, burn, chime, fanfare, win, setMuted, get muted() { return muted; } };
}
