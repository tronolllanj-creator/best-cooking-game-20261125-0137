export const CONFIG = {
  W: 1280,
  H: 720,
  CHEF_SPEED: 200,
  GRILL_COOK: 8,
  GRILL_BURN: 12,
  CHOP_TIME: 2.0,
  MAX_ORDERS: 4,
  MAX_PLATES: 2,
  SERVE_BASE: 100,
  SERVE_TIME_MULT: 5,
  SERVE_WRONG: 10,
  EXPIRE_PENALTY: 50,
  COMBO_BONUS: 25,
  MASTER: 0.35,
  RES_VERSION: 'sizzle-serve-v1'
};

export const PALETTE = {
  floor: '#3a2c22',
  floorAlt: '#33271e',
  wall: '#5d4632',
  wallTop: '#7d6244',
  counter: '#8a6a45',
  counterTop: '#a5825a',
  board: '#1e2a22',
  boardEdge: '#3c5a44',
  chef: '#ffd94d',
  chefDark: '#8a6d1f',
  pattyRaw: '#c96a5a',
  pattyCooked: '#7a4a28',
  pattyBurned: '#241a12',
  bun: '#e8b96a',
  lettuce: '#59d867',
  tomato: '#e05a4e',
  cheese: '#f0c040',
  fries: '#f5d76e',
  drink: '#6ab8e0',
  plate: '#e8e4da',
  timerOk: '#59d867',
  timerMid: '#f0a040',
  timerLow: '#e05a4e',
  text: '#efe6d0',
  muted: '#9a8f7a',
  panel: '#12100d',
  grill: '#2b2b30',
  grillHot: '#e07840',
  star: '#ffd94d'
};

export const RECIPES = {
  CLASSIC: { name: 'CLASSIC', value: 60, items: ['bun', 'patty', 'lettuce'] },
  CHEESE: { name: 'CHEESE', value: 65, items: ['bun', 'patty', 'cheese'] },
  DELUXE: { name: 'DELUXE', value: 85, items: ['bun', 'patty', 'lettuce', 'tomato'] },
  COMBO: { name: 'COMBO', value: 80, items: ['bun', 'patty', 'cheese', 'fries'] },
  THIRSTY: { name: 'THIRSTY', value: 70, items: ['bun', 'patty', 'lettuce', 'drink'] }
};

const STATIONS = {
  orderBoard: { name: 'orderBoard', x: 120, y: 8, w: 1040, h: 88 },
  crateBun: { name: 'crateBun', x: 24, y: 140, w: 96, h: 96, item: 'bun' },
  cratePatty: { name: 'cratePatty', x: 140, y: 140, w: 96, h: 96, item: 'patty' }, // raw patties for the grill
  crateLettuce: { name: 'crateLettuce', x: 24, y: 240, w: 96, h: 96, item: 'lettuce' },
  crateTomato: { name: 'crateTomato', x: 24, y: 340, w: 96, h: 96, item: 'tomato' },
  crateCheese: { name: 'crateCheese', x: 24, y: 440, w: 96, h: 96, item: 'cheese' },
  crateFries: { name: 'crateFries', x: 24, y: 540, w: 96, h: 96, item: 'fries' },
  drink: { name: 'drink', x: 140, y: 540, w: 160, h: 96, item: 'drink' },
  chopBoard: { name: 'chopBoard', x: 420, y: 300, w: 180, h: 160 },
  grill: { name: 'grill', x: 640, y: 300, w: 220, h: 180, slots: 2 },
  assembly: { name: 'assembly', x: 900, y: 300, w: 200, h: 180, slots: 2 },
  serve: { name: 'serve', x: 1120, y: 140, w: 140, h: 120 },
  trash: { name: 'trash', x: 1120, y: 540, w: 140, h: 96 }
};

export const LEVELS = [
  {
    levelIndex: 0,
    name: 'LUNCH RUSH',
    shiftLength: 150,
    spawnInterval: 14, // lunch rush breathes: a new ticket every 14 s,
    orderTime: 60,
    recipes: ['CLASSIC', 'CHEESE'],
    grillSlots: 2,
    stations: STATIONS
  },
  {
    levelIndex: 1,
    name: 'DINNER RUSH',
    shiftLength: 150,
    spawnInterval: 10,
    orderTime: 50,
    recipes: ['CLASSIC', 'CHEESE', 'DELUXE'],
    grillSlots: 2,
    stations: STATIONS
  },
  {
    levelIndex: 2,
    name: 'MIDNIGHT FEAST',
    shiftLength: 180,
    spawnInterval: 8,
    orderTime: 45,
    recipes: ['CLASSIC', 'CHEESE', 'DELUXE', 'COMBO', 'THIRSTY'],
    grillSlots: 2,
    stations: STATIONS
  }
];
