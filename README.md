[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/tronolllanj-creator/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/tronolllanj-creator/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# SIZZLE & SERVE: RUSH HOUR KITCHEN

A fast‑paced, top‑down 2D cooking game built with plain ES modules and Canvas. Run a kitchen through three increasingly frantic shifts: take orders from the board, chop ingredients, grill patties (don’t let them burn!), assemble plates, and serve before the timer runs out.

## How It Plays

### Three Shifts
1. **Lunch Rush** – 150 s, orders every 14 s, 60 s per order. Recipes: CLASSIC, CHEESE.
2. **Dinner Rush** – 150 s, orders every 10 s, 50 s per order. Recipes: CLASSIC, CHEESE, DELUXE.
3. **Midnight Feast** – 180 s, orders every 8 s, 45 s per order. All recipes available.

Each shift ends when the shift timer reaches its length. Clear all three to win.

### Order Board
Up to four tickets appear across the top of the screen. Each shows the recipe icons and a countdown bar (green → amber → red). Orders expire if not served in time.

### Chopping
Walk to the **Chop Board** (center) with a raw ingredient (lettuce or tomato). Hold **Space** (or keep pressing **E**) to chop. After 2 s the ingredient becomes *chopped* and can be placed on a plate.

### Grill & Burn Risk
The **Grill** (two slots) cooks raw patties. A patty progresses from *raw* (0.0) to *cooked* (1.0) in 8 s. If left longer it reaches *burned* (1.5) at 12 s and must be trashed. Visual sizzle and smoke particles indicate progress.

### Plate Assembly
At the **Assembly Counter** (right of grill) you can start a fresh plate (empty hand + **E**), add carried ingredients to the plate with the fewest items (**E**), and pick up a finished plate (**E**). A plate is carried like an ingredient.

### Serving
Carry a completed plate to the **Serve Window** (far right) and press **E**. If the plate’s contents exactly match an open order (same multiset), the order is served: you gain score, coins, and increase your combo. A mismatch rejects the plate (small shake, –10 score, combo reset). Expired orders give –50 score and reset combo.

## Controls
| Action | Key / Input |
|--------|-------------|
| Move | WASD / Arrow keys |
| Interact (pick up, put down, take from station, start/serve plate) | **E** / Mouse click on station |
| Work faster (chop, flip) | Hold **Space** |
| Pause | **P** / **Esc** |
| Confirm / Start / Restart | **Enter** / Click |
| Restart on end screens | **R** |
| Mute | **M** |

## Recipes
- **CLASSIC**: bun + patty + lettuce
- **CHEESE**: bun + patty + cheese
- **DELUXE**: bun + patty + lettuce + tomato
- **COMBO**: bun + patty + cheese + fries
- **THIRSTY**: bun + patty + lettuce + drink

## Scoring
- **Serve order**: 100 + 5 × remaining seconds (rounded)
- **Combo streak**: +25 per combo step (increments on each successful serve)
- **Expired order**: –50
- **Wrong serve**: –10
- **Best score** saved in `localStorage` (survives page reloads)
- Tracked stats: served, missed, best combo, coins

## Run Instructions
1. Clone the repo.
2. Serve the `game/` folder with any static file server (e.g. `npx serve game` or `python -m http.server 8080 -d game`).
3. Open `index.html` in a browser.
4. Press **Enter** or click to start.

No build step, no external dependencies, no network requests. All code is in `game/src/` as ES modules.

Enjoy the rush!