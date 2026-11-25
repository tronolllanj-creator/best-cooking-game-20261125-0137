// random.js - seeded PRNG (mulberry32); deterministic input for the whole sim.
// No Math.random or Date anywhere: the world advances off this generator only.

// Integer-safe 32-bit mix of the seed so weak seeds (0, 1) still spread out.
function mulberry32(seed) {
  let a = seed >>> 0;
  const out = function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  out.seed = a;
  return out;
}

// Object wrapper exposing the building blocks every world module asks for:
//   next()  float in [0,1)
//   range(min,max)  float in [min,max)
//   int(min,max)   integer in [min,max)
//   pick(arr)      pseudo-random element of a non-empty array
function createRng(seed) {
  const r = mulberry32(seed);
  return {
    next: r,
    range: (min, max) => min + (max - min) * r(),
    int: (min, max) => ((min + (max - min) * r()) | 0),
    pick: (arr) => arr[(r() * arr.length) | 0]
  };
}

export { mulberry32, createRng };
