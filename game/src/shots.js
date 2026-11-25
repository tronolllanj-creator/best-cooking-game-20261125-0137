import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN } from './render.js';
import { LEVELS, RECIPES } from './config.js';

export function stageShot(state, shot, rng) {
  // base state for level 0
  const base = (levelIndex = 0) => ({
    levelIndex,
    shiftTime: 0,
    shiftLength: LEVELS[levelIndex].shiftLength,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    missed: 0,
    orders: [],
    chef: { x: 900, y: 300, dir: 0, carrying: null, work: 0, workTarget: null },
    grill: [null, null],
    board: { item: null, progress: 0 }, // render reads board.item
    plates: [
      { items: [], x: 860, y: 300 },
      { items: [], x: 940, y: 300 }
    ],
    readyPlate: null,
    particles: [],
    floats: [],
    events: [],
    shake: 0,
    time: 0
  });

  const makeOrder = (recipeName, timeLeft) => {
    const recipe = RECIPES[recipeName]; // RECIPES is an object keyed by name
    return {
      id: Math.floor(rng.next() * 1000000000), // int() needs two args
      recipe: recipeName,
      items: recipe.items.slice(),
      timeLeft,
      total: LEVELS[state.levelIndex].orderTime
    };
  };

  switch (shot) {
    case 'start': {
      const s = base(0);
      s.screen = SCREEN_TITLE;
      // two orders on board
      s.orders = [
        makeOrder('CLASSIC', 45),
        makeOrder('CHEESE', 30)
      ];
      s.best = 12340;
      return { screen: SCREEN_TITLE, best: s.best, state: s }; // main.js reads staged.state
    }
    case 'play': {
      const s = base(0);
      s.screen = SCREEN_PLAY;
      s.shiftTime = 58; // 92s elapsed of 150
      // chef at assembly carrying plate [bun, patty]
      s.chef.carrying = { kind: 'plate', items: ['bun', 'patty'] };
      // patty cooking on grill slot 0
      s.grill[0] = { item: { kind: 'patty', state: 'raw' }, progress: 0.4 };
      // chopped lettuce on board
      s.board = { item: { kind: 'lettuce', state: 'chopped' }, progress: 2 };
      // three orders
      s.orders = [
        makeOrder('CLASSIC', 40),
        makeOrder('CHEESE', 25),
        makeOrder('CLASSIC', 15)
      ];
      // finished plate at serve window
      s.readyPlate = { items: ['bun', 'patty', 'lettuce'] };
      s.best = 12340;
      return { screen: SCREEN_PLAY, best: s.best, state: s }; // main.js reads staged.state
    }
    case 'rush': {
      const s = base(1); // shift 2
      s.screen = SCREEN_PLAY;
      s.shiftTime = 60;
      s.combo = 3;
      s.bestCombo = 3;
      // four orders (max)
      s.orders = [
        makeOrder('DELUXE', 35),
        makeOrder('COMBO', 28),
        makeOrder('CHEESE', 20),
        makeOrder('CLASSIC', 12)
      ];
      // both grill slots full
      s.grill[0] = { item: { kind: 'patty', state: 'raw' }, progress: 0.6 };
      s.grill[1] = { item: { kind: 'patty', state: 'raw' }, progress: 0.2 };
      // chef carrying fries
      s.chef.carrying = { kind: 'fries', state: 'ready' };
      s.best = 12340;
      return { screen: SCREEN_PLAY, best: s.best, state: s };
    }
    case 'end': {
      const s = base(2); // after shift 3
      s.screen = SCREEN_WIN;
      s.served = 24;
      s.missed = 2;
      s.bestCombo = 5;
      s.score = 24 * 100 + 5 * 24 * 30 + 25 * (1+2+3+4+5) - 2 * 50; // approx
      s.coins = 24 * 10;
      s.best = Math.max(12340, s.score);
      return { screen: SCREEN_WIN, best: s.best, state: s };
    }
    default:
      return { screen: SCREEN_TITLE, best: 0, state }; // main.js reads staged.state
  }
}
