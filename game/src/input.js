export function createInput(canvas) {
  const keys = new Set();
  const mouse = { x: 0, y: 0 };
  const clickQueue = [];
  const actions = {
    interact: false,
    work: false,
    confirm: false,
    restart: false,
    pause: false,
    mute: false
  };

  function mapKey(code) {
    switch (code) {
      case 'KeyW': return 'w';
      case 'KeyA': return 'a';
      case 'KeyS': return 's';
      case 'KeyD': return 'd';
      case 'ArrowUp': return 'ArrowUp';
      case 'ArrowDown': return 'ArrowDown';
      case 'ArrowLeft': return 'ArrowLeft';
      case 'ArrowRight': return 'ArrowRight';
      default: return null;
    }
  }

  function onKeyDown(e) {
    const k = mapKey(e.code);
    if (k) { keys.add(k); e.preventDefault(); }
    switch (e.code) {
      case 'KeyE': actions.interact = true; break;
      case 'Space': actions.work = true; break;
      case 'Enter': actions.confirm = true; break;
      case 'KeyR': actions.restart = true; break;
      case 'KeyP':
      case 'Escape': actions.pause = true; break;
      case 'KeyM': actions.mute = true; break;
    }
  }

  function onKeyUp(e) {
    const k = mapKey(e.code);
    if (k) { keys.delete(k); }
    if (e.code === 'Space') { actions.work = false; }
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    mouse.x = (e.clientX - rect.left) * scaleX;
    mouse.y = (e.clientY - rect.top) * scaleY;
  }

  function onMouseDown(e) {
    if (e.button !== 0) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    clickQueue.push({ x, y });
    actions.interact = true;
  }

  function onContextMenu(e) { e.preventDefault(); }

  canvas.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('contextmenu', onContextMenu);

  function update() {
    // no-op: world.js consumes interact and clickQueue
  }

  return { keys, mouse, clickQueue, actions, update };
}
