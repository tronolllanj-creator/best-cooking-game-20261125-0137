export const SCREEN_TITLE = 0;
export const SCREEN_PLAY = 1;
export const SCREEN_PAUSED = 2;
export const SCREEN_SHIFT = 3;
export const SCREEN_WIN = 4;

const PALETTE = {
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
  timerLow: '#e05a4e', // countdown red in the last stretch
  text: '#efe6d0',
  muted: '#9a8f7a',
  panel: '#12100d',
  grill: '#2b2b30',
  grillHot: '#e07840',
  star: '#ffd94d'
};

const LOGICAL_W = 1280;
const LOGICAL_H = 720;
const TILE = 40;

function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  function resize() {
    scale = Math.min(window.innerWidth / LOGICAL_W, window.innerHeight / LOGICAL_H);
    offsetX = (window.innerWidth - LOGICAL_W * scale) * 0.5;
    offsetY = (window.innerHeight - LOGICAL_H * scale) * 0.5;
    canvas.width = LOGICAL_W * scale;
    canvas.height = LOGICAL_H * scale;
  }
  window.addEventListener('resize', resize);
  resize();

  // --- drawing primitives ---
  function clear() {
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
  }

  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function strokeRect(x, y, w, h, color, lineWidth = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, w, h);
  }

  function circle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function text(str, x, y, size, color, align = 'left', baseline = 'top') {
    ctx.font = `${size}px monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(str, x, y);
  }

  function drawImageCentered(img, x, y, w, h) {
    ctx.drawImage(img, x - w/2, y - h/2, w, h);
  }

  // --- station positions (from config) ---
  const STATIONS = {
    orderBoard: { x: 0, y: 8, w: LOGICAL_W, h: 88 },
    bunCrate: { x: 24, y: 140, w: 80, h: 80 },
    lettuceCrate: { x: 24, y: 240, w: 80, h: 80 },
    tomatoCrate: { x: 24, y: 340, w: 80, h: 80 },
    cheeseCrate: { x: 24, y: 440, w: 80, h: 80 },
    friesCrate: { x: 24, y: 540, w: 80, h: 80 },
    pattyCrate: { x: 140, y: 140, w: 80, h: 80 }, // raw patties
    drinkMachine: { x: 140, y: 540, w: 80, h: 80 },
    chopBoard: { x: 420, y: 300, w: 120, h: 80 },
    grill: { x: 640, y: 300, w: 160, h: 80 },
    assembly: { x: 900, y: 300, w: 160, h: 80 },
    serveWindow: { x: 1120, y: 140, w: 80, h: 80 },
    trash: { x: 1120, y: 540, w: 80, h: 80 }
  };

  // --- floor tiles ---
  function drawFloor() {
    for (let y = 0; y < LOGICAL_H; y += TILE) {
      for (let x = 0; x < LOGICAL_W; x += TILE) {
        const alt = ((x + y) / TILE) % 2 === 0;
        rect(x, y, TILE, TILE, alt ? PALETTE.floorAlt : PALETTE.floor);
      }
    }
  }

  // --- walls and counters ---
  function drawWallsAndCounters() {
    // top wall
    rect(0, 0, LOGICAL_W, 8, PALETTE.wall);
    rect(0, 8, LOGICAL_W, 88, PALETTE.board);
    strokeRect(0, 8, LOGICAL_W, 88, PALETTE.boardEdge, 4);
    // left column crates
    ['bunCrate','lettuceCrate','tomatoCrate','cheeseCrate','friesCrate','pattyCrate'].forEach(k => { // patty crate drawn too
      const s = STATIONS[k];
      rect(s.x, s.y, s.w, s.h, PALETTE.counter);
      rect(s.x+4, s.y+4, s.w-8, s.h-8, PALETTE.counterTop);
    });
    // drink machine
    {
      const s = STATIONS.drinkMachine;
      rect(s.x, s.y, s.w, s.h, PALETTE.counter);
      rect(s.x+4, s.y+4, s.w-8, s.h-8, PALETTE.counterTop);
      // machine body
      rect(s.x+10, s.y+10, 60, 60, '#333');
      rect(s.x+20, s.y+15, 40, 10, '#555');
      rect(s.x+25, s.y+30, 30, 30, PALETTE.drink);
    }
    // centre stations
    ['chopBoard','grill','assembly'].forEach(k => {
      const s = STATIONS[k];
      rect(s.x, s.y, s.w, s.h, PALETTE.counter);
      rect(s.x+4, s.y+4, s.w-8, s.h-8, PALETTE.counterTop);
    });
    // right stations
    ['serveWindow','trash'].forEach(k => {
      const s = STATIONS[k];
      rect(s.x, s.y, s.w, s.h, PALETTE.counter);
      rect(s.x+4, s.y+4, s.w-8, s.h-8, PALETTE.counterTop);
    });
    // trash icon
    {
      const s = STATIONS.trash;
      ctx.fillStyle = '#444';
      ctx.beginPath();
      ctx.moveTo(s.x+20, s.y+20);
      ctx.lineTo(s.x+60, s.y+20);
      ctx.lineTo(s.x+55, s.y+60);
      ctx.lineTo(s.x+25, s.y+60);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#666';
      ctx.fillRect(s.x+30, s.y+30, 20, 20);
    }
  }

  // --- ingredient piles on crates ---
  function drawIngredientPiles() {
    const piles = [
      {kind:'bun', x: STATIONS.bunCrate.x+40, y: STATIONS.bunCrate.y+40, color: PALETTE.bun, count: 5},
      {kind:'lettuce', x: STATIONS.lettuceCrate.x+40, y: STATIONS.lettuceCrate.y+40, color: PALETTE.lettuce, count: 5},
      {kind:'tomato', x: STATIONS.tomatoCrate.x+40, y: STATIONS.tomatoCrate.y+40, color: PALETTE.tomato, count: 5},
      {kind:'cheese', x: STATIONS.cheeseCrate.x+40, y: STATIONS.cheeseCrate.y+40, color: PALETTE.cheese, count: 5},
      {kind:'fries', x: STATIONS.friesCrate.x+40, y: STATIONS.friesCrate.y+40, color: PALETTE.fries, count: 5},
      {kind:'patty', x: STATIONS.pattyCrate.x+40, y: STATIONS.pattyCrate.y+40, color: PALETTE.pattyRaw, count: 5},
    ]; // end of piles
    piles.forEach(p => {
      for (let i = 0; i < Math.min(p.count, 4); i++) {
        const ox = (i%2)*8 - 4;
        const oy = Math.floor(i/2)*8 - 4;
        circle(p.x+ox, p.y+oy, 6, p.color);
      }
    });
  }

  // --- order board ---
  function drawOrderBoard(state) {
    const s = STATIONS.orderBoard;
    const orders = state.orders;
    const maxVisible = 4;
    const ticketW = 200;
    const ticketH = 70;
    const startX = 120;
    const startY = 20;
    const gap = 20;

    orders.slice(0, maxVisible).forEach((order, i) => {
      const x = startX + i * (ticketW + gap);
      const y = startY;
      // ticket background
      rect(x, y, ticketW, ticketH, PALETTE.panel);
      strokeRect(x, y, ticketW, ticketH, PALETTE.boardEdge, 2);
      // recipe name
      text(order.recipe, x+10, y+8, 14, PALETTE.text);
      // items as small icons
      const itemSize = 16;
      order.items.forEach((item, j) => {
        const ix = x + 10 + j * (itemSize+4);
        const iy = y + 30;
        drawItemIcon(item, ix, iy, itemSize);
      });
      // timer bar
      const barW = ticketW - 20;
      const barH = 8;
      const bx = x + 10;
      const by = y + ticketH - 18;
      const ratio = Math.max(0, order.timeLeft / order.total);
      let barColor = PALETTE.timerOk;
      if (ratio < 0.3) barColor = PALETTE.timerLow;
      else if (ratio < 0.6) barColor = PALETTE.timerMid;
      rect(bx, by, barW, barH, '#222');
      rect(bx, by, barW * ratio, barH, barColor);
    });
  }

  function drawItemIcon(kind, x, y, size) {
    const colors = {
      bun: PALETTE.bun,
      patty: PALETTE.pattyCooked,
      lettuce: PALETTE.lettuce,
      tomato: PALETTE.tomato,
      cheese: PALETTE.cheese,
      fries: PALETTE.fries,
      drink: PALETTE.drink
    };
    const c = colors[kind] || PALETTE.text;
    ctx.fillStyle = c;
    switch(kind) {
      case 'bun':
        ctx.beginPath();
        ctx.ellipse(x+size/2, y+size/2, size/2, size/3, 0, 0, Math.PI*2);
        ctx.fill();
        break;
      case 'patty':
        ctx.fillRect(x, y+size/3, size, size/3);
        break;
      case 'lettuce':
        ctx.beginPath();
        ctx.moveTo(x+size/2, y);
        ctx.lineTo(x+size, y+size);
        ctx.lineTo(x, y+size);
        ctx.closePath();
        ctx.fill();
        break;
      case 'tomato':
        ctx.beginPath();
        ctx.arc(x+size/2, y+size/2, size/2, 0, Math.PI*2);
        ctx.fill();
        break;
      case 'cheese':
        ctx.fillRect(x, y, size, size);
        break;
      case 'fries':
        for(let i=0;i<3;i++) ctx.fillRect(x+i*size/3, y, size/4, size);
        break;
      case 'drink':
        ctx.fillRect(x+size/4, y, size/2, size);
        ctx.fillRect(x, y+size/4, size, size/2);
        break;
    }
  }

  // --- grill ---
  function drawGrill(state) {
    const s = STATIONS.grill;
    // grill surface
    rect(s.x+4, s.y+4, s.w-8, s.h-8, PALETTE.grill);
    // slots
    const slotW = 60;
    const slotH = 50;
    const startX = s.x + 20;
    const startY = s.y + 15;
    state.grill.forEach((slot, i) => {
      const x = startX + i * 80;
      const y = startY;
      // slot background
      rect(x, y, slotW, slotH, PALETTE.grillHot);
      if (slot && slot.item) {
        const prog = slot.progress;
        let color = PALETTE.pattyRaw;
        if (prog >= 1.0 && prog < 1.5) color = PALETTE.pattyCooked;
        else if (prog >= 1.5) color = PALETTE.pattyBurned;
        // patty
        circle(x+slotW/2, y+slotH/2, 18, color);
        // progress bar
        if (prog < 1.5) {
          rect(x, y-6, slotW, 4, '#222');
          rect(x, y-6, slotW * Math.min(1, prog), 4, PALETTE.timerOk);
        }
        // smoke particles for cooking
        if (prog > 0 && prog < 1.5) {
          for (let p = 0; p < 3; p++) {
            const sx = x + 10 + Math.random()*40;
            const sy = y - 5 - Math.random()*10;
            ctx.fillStyle = 'rgba(200,200,200,0.3)';
            ctx.beginPath();
            ctx.arc(sx, sy, 2+Math.random()*2, 0, Math.PI*2);
            ctx.fill();
          }
        }
      }
    });
  }

  // --- chop board ---
  function drawChopBoard(state) {
    const s = STATIONS.chopBoard;
    // board surface
    rect(s.x+4, s.y+4, s.w-8, s.h-8, '#4a3a2a');
    if (state.board && state.board.item) {
      const item = state.board.item;
      const prog = state.board.progress;
      const x = s.x + s.w/2;
      const y = s.y + s.h/2;
      // ingredient
      let color = PALETTE.lettuce;
      if (item === 'tomato') color = PALETTE.tomato;
      circle(x, y, 20, color);
      // chopping indicator
      if (prog < 2.0) {
        rect(x-30, y-35, 60, 6, '#222');
        rect(x-30, y-35, 60 * (prog/2.0), 6, PALETTE.timerOk);
        // knife
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x-20 + 40*(prog/2.0), y-45);
        ctx.lineTo(x-20 + 40*(prog/2.0), y-30);
        ctx.stroke();
      } else {
        // chopped pieces
        for (let i=0;i<4;i++) {
          circle(x-15+i*10, y, 8, color);
        }
      }
    }
  }

  // --- assembly counter ---
  function drawAssembly(state) {
    const s = STATIONS.assembly;
    rect(s.x+4, s.y+4, s.w-8, s.h-8, PALETTE.counterTop);
    // plate slots
    const slotW = 60;
    const slotH = 60;
    const startX = s.x + 20;
    const startY = s.y + 10;
    state.plates.forEach((plate, i) => {
      const x = startX + i * 80;
      const y = startY;
      if (plate && plate.items.length > 0) {
        // plate base
        circle(x+slotW/2, y+slotH/2, 25, PALETTE.plate);
        // stack items
        plate.items.forEach((item, j) => {
          drawItemIcon(item, x+slotW/2-10, y+slotH/2 - 20 + j*8, 20);
        });
      } else {
        // empty plate outline
        ctx.strokeStyle = PALETTE.muted;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x+slotW/2, y+slotH/2, 25, 0, Math.PI*2);
        ctx.stroke();
      }
    });
  }

  // --- serve window ---
  function drawServeWindow(state) {
    const s = STATIONS.serveWindow;
    rect(s.x+4, s.y+4, s.w-8, s.h-8, PALETTE.counterTop);
    // window frame
    strokeRect(s.x+10, s.y+10, s.w-20, s.h-20, PALETTE.wallTop, 4);
    // ready plate indicator
    if (state.readyPlate) {
      const x = s.x + s.w/2;
      const y = s.y + s.h/2;
      circle(x, y, 25, PALETTE.plate);
      state.readyPlate.items.forEach((item, j) => {
        drawItemIcon(item, x-10, y-20+j*8, 20);
      });
      // sparkle
      ctx.fillStyle = PALETTE.star;
      for(let i=0;i<4;i++){
        const ang = (state.time*5 + i*90) * Math.PI/180;
        circle(x + Math.cos(ang)*30, y + Math.sin(ang)*30, 3, PALETTE.star);
      }
    }
  }

  // --- chef ---
  function drawChef(state) {
    const c = state.chef;
    const x = c.x;
    const y = c.y;
    // body
    ctx.fillStyle = PALETTE.chef;
    ctx.beginPath();
    ctx.ellipse(x, y+10, 16, 20, 0, 0, Math.PI*2);
    ctx.fill();
    // head
    ctx.fillStyle = '#ffdbac';
    circle(x, y-10, 12, '#ffdbac');
    // hat
    ctx.fillStyle = PALETTE.chef;
    ctx.beginPath();
    ctx.moveTo(x-12, y-10);
    ctx.lineTo(x+12, y-10);
    ctx.lineTo(x+8, y-28);
    ctx.lineTo(x-8, y-28);
    ctx.closePath();
    ctx.fill();
    // direction indicator
    ctx.fillStyle = PALETTE.chefDark;
    let dx=0, dy=0;
    if(c.dir===0) dy=-1; // up
    else if(c.dir===1) dx=1; // right
    else if(c.dir===2) dy=1; // down
    else dx=-1; // left
    circle(x+dx*8, y-10+dy*8, 2, PALETTE.chefDark);
    // carried item
    if (c.carrying) {
      const item = c.carrying;
      const cx = x + dx*20;
      const cy = y + dy*20;
      if (item.kind === 'plate') {
        circle(cx, cy, 18, PALETTE.plate);
        item.items.forEach((it, j) => drawItemIcon(it, cx-8, cy-15+j*6, 16));
      } else {
        drawItemIcon(item.kind, cx-8, cy-8, 16);
      }
    }
    // work animation (space held)
    if (c.work > 0) {
      ctx.strokeStyle = PALETTE.text;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y-20, 10 + c.work*5, 0, Math.PI*2);
      ctx.stroke();
    }
  }

  // --- particles ---
  function drawParticles(state) {
    state.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  // --- floating score text ---
  function drawFloats(state) {
    state.floats.forEach(f => {
      ctx.globalAlpha = f.life;
      ctx.fillStyle = f.color;
      text(f.text, f.x, f.y, 20, f.color, 'center', 'middle');
      ctx.globalAlpha = 1;
    });
  }

  // --- HUD ---
  function drawHUD(state, best) {
    // top-left: score, best, coins
    text(`SCORE: ${state.score}`, 20, 10, 20, PALETTE.text);
    text(`BEST: ${best}`, 20, 35, 18, PALETTE.star);
    text(`COINS: ${state.coins}`, 20, 60, 18, PALETTE.cheese);
    // top-center: shift name and timer
    const level = state.levelIndex;
    const shiftNames = ['LUNCH RUSH', 'DINNER RUSH', 'MIDNIGHT FEAST'];
    const shiftName = shiftNames[level] || 'SHIFT';
    const shiftRatio = 1 - state.shiftTime / state.shiftLength;
    const barW = 400;
    const barH = 16;
    const bx = (LOGICAL_W - barW)/2;
    const by = 10;
    text(shiftName, LOGICAL_W/2, 10, 20, PALETTE.text, 'center');
    rect(bx, by+25, barW, barH, '#222');
    rect(bx, by+25, barW * shiftRatio, barH, PALETTE.timerOk);
    strokeRect(bx, by+25, barW, barH, PALETTE.boardEdge, 2);
    // top-right: combo
    if (state.combo > 1) {
      text(`COMBO x${state.combo}`, LOGICAL_W - 20, 10, 20, PALETTE.star, 'right');
    }
    // bottom-left: carrying indicator
    if (state.chef.carrying) {
      const item = state.chef.carrying;
      let label = item.kind;
      if (item.kind === 'plate') label = 'PLATE (' + item.items.join(',') + ')';
      text(`CARRYING: ${label}`, 20, LOGICAL_H - 60, 18, PALETTE.text);
    } else {
      text('CARRYING: (empty)', 20, LOGICAL_H - 60, 18, PALETTE.muted);
    }
    // bottom-center: context prompt
    // We'll compute a simple context string based on chef position and state
    const prompt = getContextPrompt(state);
    text(prompt, LOGICAL_W/2, LOGICAL_H - 30, 18, PALETTE.text, 'center');
  }

  function getContextPrompt(state) {
    const c = state.chef;
    const stations = STATIONS;
    // simple proximity checks
    function near(station, dist=30) {
      return Math.abs(c.x - (station.x + station.w/2)) < station.w/2 + dist &&
             Math.abs(c.y - (station.y + station.h/2)) < station.h/2 + dist;
    }
    if (near(stations.bunCrate)) return 'E TAKE BUN';
    if (near(stations.lettuceCrate)) return 'E TAKE LETTUCE';
    if (near(stations.tomatoCrate)) return 'E TAKE TOMATO';
    if (near(stations.cheeseCrate)) return 'E TAKE CHEESE';
    if (near(stations.friesCrate)) return 'E TAKE FRIES';
    if (near(stations.drinkMachine)) return 'E TAKE DRINK';
    if (near(stations.chopBoard)) {
      if (c.carrying && (c.carrying.kind==='lettuce' || c.carrying.kind==='tomato') && c.carrying.state==='raw')
        return 'E CHOP (HOLD SPACE)';
      if (c.carrying && c.carrying.kind==='plate') return 'E PLACE ON PLATE';
      if (!c.carrying && state.board && state.board.item && state.board.progress>=1) return 'E TAKE CHOPPED'; // chopped at 1.0
    }
    if (near(stations.grill)) {
      if (c.carrying && c.carrying.kind==='patty' && c.carrying.state==='raw') return 'E PLACE PATTY';
      if (!c.carrying) {
        const ready = state.grill.find(s => s && s.item && s.progress>=1 && s.progress<1.5);
        if (ready) return 'E TAKE COOKED PATTY';
        const burned = state.grill.find(s => s && s.item && s.progress>=1.5);
        if (burned) return 'E TRASH BURNED';
      }
    }
    if (near(stations.assembly)) {
      if (!c.carrying) return 'E START PLATE';
      if (c.carrying.kind !== 'plate') return 'E ADD TO PLATE';
      if (c.carrying.kind === 'plate') return 'E PICK UP PLATE';
    }
    if (near(stations.serveWindow)) {
      if (c.carrying && c.carrying.kind==='plate') return 'E SERVE';
    }
    if (near(stations.trash)) {
      if (c.carrying && c.carrying.kind==='patty' && c.carrying.state==='burned') return 'E TRASH BURNED';
      if (c.carrying && c.carrying.kind==='plate') return 'E TRASH PLATE';
    }
    return 'WASD MOVE  E INTERACT  SPACE WORK  P PAUSE';
  }

  // --- screens ---
  function drawTitleScreen() {
    // semi-transparent overlay
    ctx.fillStyle = 'rgba(18,16,13,0.9)';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    text('SIZZLE & SERVE', LOGICAL_W/2, 150, 60, PALETTE.star, 'center');
    text('RUSH HOUR KITCHEN', LOGICAL_W/2, 220, 30, PALETTE.text, 'center');
    text('PRESS ENTER TO START', LOGICAL_W/2, 350, 24, PALETTE.muted, 'center');
    text('WASD/ARROWS MOVE  E INTERACT  SPACE WORK', LOGICAL_W/2, 420, 18, PALETTE.muted, 'center');
    text('P/ESC PAUSE  M MUTE  R RESTART', LOGICAL_W/2, 450, 18, PALETTE.muted, 'center');
  }

  function drawPausedScreen() {
    ctx.fillStyle = 'rgba(18,16,13,0.85)';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    text('PAUSED', LOGICAL_W/2, 300, 50, PALETTE.text, 'center');
    text('PRESS P OR ESC TO RESUME', LOGICAL_W/2, 380, 20, PALETTE.muted, 'center');
  }

  function drawShiftScreen(state) {
    ctx.fillStyle = 'rgba(18,16,13,0.9)';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    const shiftNames = ['LUNCH RUSH', 'DINNER RUSH', 'MIDNIGHT FEAST'];
    text('SHIFT CLEAR!', LOGICAL_W/2, 150, 50, PALETTE.star, 'center');
    text(shiftNames[state.levelIndex] || 'SHIFT', LOGICAL_W/2, 220, 30, PALETTE.text, 'center');
    text(`SCORE: ${state.score}`, LOGICAL_W/2, 280, 24, PALETTE.text, 'center');
    text(`SERVED: ${state.served}  MISSED: ${state.missed}`, LOGICAL_W/2, 320, 20, PALETTE.muted, 'center');
    text(`BEST COMBO: x${state.bestCombo}`, LOGICAL_W/2, 350, 20, PALETTE.star, 'center');
    text(`COINS: ${state.coins}`, LOGICAL_W/2, 380, 20, PALETTE.cheese, 'center');
    if (state.levelIndex < 2) {
      text('PRESS ENTER FOR NEXT SHIFT', LOGICAL_W/2, 480, 24, PALETTE.muted, 'center');
    } else {
      text('PRESS ENTER FOR VICTORY', LOGICAL_W/2, 480, 24, PALETTE.muted, 'center');
    }
  }

  function drawWinScreen(state) {
    ctx.fillStyle = 'rgba(18,16,13,0.95)';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    text('VICTORY!', LOGICAL_W/2, 120, 60, PALETTE.star, 'center');
    text('ALL SHIFTS COMPLETE', LOGICAL_W/2, 190, 30, PALETTE.text, 'center');
    text(`FINAL SCORE: ${state.score}`, LOGICAL_W/2, 260, 36, PALETTE.star, 'center');
    text(`ORDERS SERVED: ${state.served}`, LOGICAL_W/2, 310, 22, PALETTE.text, 'center');
    text(`ORDERS MISSED: ${state.missed}`, LOGICAL_W/2, 340, 22, PALETTE.muted, 'center');
    text(`BEST COMBO: x${state.bestCombo}`, LOGICAL_W/2, 370, 22, PALETTE.star, 'center');
    text(`TOTAL COINS: ${state.coins}`, LOGICAL_W/2, 400, 22, PALETTE.cheese, 'center');
    text('PRESS R TO RESTART', LOGICAL_W/2, 500, 24, PALETTE.muted, 'center');
  }

  // --- main draw ---
  function draw(state, screen, best) {
    clear();
    // apply screen shake
    if (state.shake > 0) {
      const wob = Math.sin(state.time * 40) * state.shake; // deterministic wobble, no Math.random
      ctx.translate(wob, -wob);
    }

    drawFloor();
    drawWallsAndCounters();
    drawIngredientPiles();
    drawOrderBoard(state);
    drawGrill(state);
    drawChopBoard(state);
    drawAssembly(state);
    drawServeWindow(state);
    drawChef(state);
    drawParticles(state);
    drawFloats(state);
    drawHUD(state, best);

    // screen overlays
    switch(screen) {
      case SCREEN_TITLE: drawTitleScreen(); break;
      case SCREEN_PAUSED: drawPausedScreen(); break;
      case SCREEN_SHIFT: drawShiftScreen(state); break;
      case SCREEN_WIN: drawWinScreen(state); break;
    }

    // reset shake transform
    if (state.shake > 0) {
      ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    }
  }

  return { draw };
}

export { createRenderer };
