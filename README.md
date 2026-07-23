<div align="center">

# 🎮 Microsoft VS Code: The Game

### *An Arcade Shooter Set Inside Your Favorite Code Editor*

<img src="./vscode.png" alt="VS Code" />

**English** | [简体中文](./README.zh-CN.md)

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)


<a href="http://vscode.emerard.me/">
  <img src="https://img.shields.io/badge/▶️_Play_Now-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white&labelColor=1f1f1f" height="50" />
</a>

<br/>

![Gameplay Demo](./Gameplay.gif)

**[📖 Documentation](#game-mechanics)** • **[🎯 Features](#features)** • **[💻 Development](#development)**

---

*"What if debugging was an actual battle?"*

Transform your coding workflow into an epic arcade shooter! Deploy your project by defeating bugs, syntax errors, and the dreaded legacy code monoliths. Each wave brings new challenges as you refactor your way to version 1.0... and beyond.

</div>

---

## 🎯 Features

### 🕹️ **Authentic VS Code Experience**
- **Pixel-Perfect UI**: Lovingly recreated VS Code interface with activity bar, sidebar, editor tabs, terminal, and status bar
- **Interactive Sidebars**:
  - 📁 **Explorer** - View project stats and release progress
  - 🔍 **Search** - Browse enemy database with detailed info
  - 🌿 **Git** - Track your commit history through waves
  - 🐛 **Debug** - Monitor performance metrics, combos, and high score
  - 🧩 **Extensions** - Check your installed power-ups and upgrades
  - ⚙️ **Settings** - Tune movement sensitivity and toggle sound

### ⚔️ **Intense Gameplay**
- **9 Unique Enemy Types**: From basic bugs 🪲 to merge conflicts ⚠️ to the terrifying MONOLITH boss
- **Boss Phase 2**: Monolith enters a rage state below 50% HP — colour shift, faster tracking shot, and a 3-way shotgun burst
- **Progressive Difficulty**: Waves get harder with smarter enemies and epic boss battles
- **Combo System**: Chain kills for massive score multipliers
- **Local High Score**: Best run is saved to your browser and shown on the start screen and game-over screen
- **Power-Ups**:
  - ☕ **Coffee** - Speed boost
  - 🤖 **GitHub Copilot** - Weapon upgrade
  - 🐳 **Docker** - Temporary shield
  - 🩹 **Hotfix** - Restore 30 HP

### 📦 **Wave Upgrade System**
After defeating each Boss a three-choice upgrade screen appears. Pick one permanent enhancement for the rest of the run:

| Upgrade | Effect |
|---------|--------|
| ⚡ Compiler Upgrade | TypeScript compiler +1 level (more projectiles) |
| ❤️ Heap Expansion | Max HP +25 and full heal |
| 📦 Buffer Overflow | Magazine size +10 |
| ⚙️ Fast GC | Reload time reduced 30% |
| 🔥 Overclock CPU | Permanent fire rate boost |

### 🎨 **Polished Mechanics**
- **Advanced Weapon System**:
  - Ammo management with auto-reload
  - TypeScript Compiler upgrades (up to level 5)
  - Ultimate "Refactor" ability (Press R/Shift)
- **WebAudio Sound Effects**: Synthesised SFX for shooting, hits, explosions, power-ups, heals, Boss appearance, Refactor ultimate, and wave clear — with a mutable toggle in the status bar and Settings panel
- **Visual Effects**:
  - Particle explosions on enemy destruction
  - Floating damage numbers
  - Hit flash feedback
  - Animated combo meter
- **Readable Combat HUD**:
  - Compact player HP/max display integrated into the canvas HUD
  - Boss health bar with Phase 2 warning label
- **Frame-Rate Independent Movement**: Player, enemies, projectiles, and timers scale with real frame time for consistent gameplay across all machines

---

## 🎮 Game Mechanics

### Controls
```
WASD       → Move your player
SPACE      → Shoot TypeScript bullets
SHIFT / R  → Refactor Ultimate (when charged)
ESC / P    → Pause game
```

On touch devices, the game area shows directional, fire, and refactor controls. Activity-bar buttons open a dismissible mobile sidebar.

### Accessibility / Tuning
- Open the **Settings** sidebar from the gear icon in the activity bar
- Adjust **Movement Sensitivity** from `0.5x` to `2.0x`
- Toggle **Sound Effects** on/off — or click the 🔔 icon in the status bar
- Slider focus is automatically released after dragging so keyboard control returns to gameplay

### Objective
Survive increasingly difficult waves of coding errors and deploy your project! Each wave requires you to:
1. **Defeat enemies** to fill the Release Progress bar
2. **Face boss battles** when the bar is full
3. **Choose an upgrade** after defeating the Boss
4. **Collect power-ups** to enhance your abilities
5. **Maintain combos** for score multipliers

### Enemy Roster

| Enemy | Symbol | HP | Points | Behavior |
|-------|--------|----|----|----------|
| **Bug** | 🪲 | 10 | 100 | Basic enemy, swarms in numbers |
| **Syntax Error** | `};` | 20 | 200 | Tanky but slow |
| **Spaghetti Code** | `goto` | 15 | 150 | Fast and erratic |
| **Memory Leak** | `malloc()` | 40 | 300 | Grows in size over time |
| **404 Error** | `404` | 15 | 250 | Extremely fast |
| **Merge Conflict** | `<<<<` | 35 | 350 | Splits into smaller enemies on death |
| **Infinite Loop** | `while(1)` | 25 | 400 | Spiral attack pattern |
| **Race Condition** | `async` | 20 | 500 | Teleports randomly |
| **MONOLITH** 👹 | `LegacyWrapper` | 600 | 5000 | Boss: tracking shots, minion spawns, Phase 2 shotgun burst |

### Progression System
- **Weapon Levels**: Collect Copilot power-ups or choose the Compiler Upgrade to level up (max 5)
- **Ammo System**: 40 bullets max (expandable), auto-regenerates slowly, reload time 2.5s (reducible)
- **Special Meter**: Charges by defeating enemies, unleash "Refactor" to clear the screen
- **Wave System**: Difficulty scales each version release (v1.0, v2.0, v3.0…)
- **High Score**: Persisted locally via `localStorage`, displayed on start and game-over screens

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (20.19+ on the 20.x line, or 22.12+)
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/Dreamer431/microsoft-vs-code.git
cd microsoft-vs-code

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:3000` 🎮

### Build for Production

```bash
# Build optimized version
npm run build

# Run type checking, lint, tests, and the production build
npm run verify

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

---

## 💻 Development

### Project Structure

```
microsoft-vs-code/
├── components/
│   ├── GameEngine.tsx      # Core game loop, entity systems, Canvas rendering
│   └── TouchControls.tsx   # Mobile touch keycaps
├── utils/
│   ├── audio.ts            # WebAudio synthesised SFX engine
│   ├── gameLogic.ts        # Tested timing, damage, and input logic
│   ├── gameState.ts        # Player and stats state factories
│   └── i18n.ts             # EN/ZH strings and language persistence
├── App.tsx                 # VS Code UI shell, sidebars, overlays
├── types.ts                # TypeScript interfaces for game entities
├── constants.ts            # Game configuration, enemy data, upgrade options
├── index.css               # Local Tailwind entry and accessibility styles
├── index.tsx               # React entry point
├── index.html              # HTML template
└── vscode.png              # VS Code logo asset
```

### Tech Stack

- **React 19.2** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 8.1** - Build tool and dev server
- **HTML5 Canvas** - Game rendering
- **Web Audio API** - Procedural sound effects
- **CSS3 / Tailwind 3** - Locally compiled VS Code styling with no runtime CDN
- **Vitest / ESLint** - Pure game-logic tests and static quality gates

### Key Components

#### `GameEngine.tsx`
Contains all game logic:
- Time-scaled game loop for frame-rate independent gameplay
- Entity management (players, enemies, projectiles, particles, power-ups)
- Collision detection
- Enemy AI behaviours (spiral, teleport, grow, split, Boss Phase 2)
- Power-up spawning and pickup handling
- Boss mechanics and phase transitions
- Wave upgrade trigger → `GameState.UPGRADE`
- Canvas rendering and in-canvas HUD

#### `App.tsx`
Handles the VS Code interface:
- Activity bar navigation
- Dynamic sidebar views (Explorer, Search, Git, Debug, Extensions, Settings)
- Wave upgrade overlay (three-choice card UI)
- High score persistence via `localStorage`
- Terminal log display
- Start / game-over screens
- Sound toggle

#### `utils/audio.ts`
Lightweight procedural audio:
- No external files — all sounds synthesised with `OscillatorNode` and white noise
- Global mute toggle
- Functions: `sfxShoot`, `sfxHit`, `sfxExplosion`, `sfxPowerUp`, `sfxHeal`, `sfxBossAppear`, `sfxUltimate`, `sfxPlayerHit`, `sfxWaveClear`

---

## 🎨 Customization

### Modify Enemy Difficulty

Edit `constants.ts`:

```typescript
export const ENEMY_TYPES = [
  {
    type: 'BUG',
    text: '🪲',
    hp: 10,        // Increase for tankier bugs
    score: 100,    // Adjust point values
    speed: 1.5,    // Higher = faster
    color: '#f14c4c',
    width: 24,
    desc: '普通Bug，数量众多'
  },
  // Add your own enemies!
]
```

### Adjust Game Balance

```typescript
// constants.ts
export const PLAYER_SPEED = 5;             // Movement speed
export const MAX_AMMO = 40;                // Ammo capacity
export const AMMO_REGEN = 0.4;             // Regen per frame
export const SPECIAL_CHARGE_PER_KILL = 5;  // Ultimate charge rate
```

### Add New Upgrades

```typescript
// constants.ts
export const UPGRADE_OPTIONS = [
  {
    id: 'MY_UPGRADE',
    icon: '🔥'
  }
]
```

Adding an enemy requires more than its config: extend `EnemyType` in `types.ts`, add EN/ZH strings for its `descKey`, include it in the wave spawn distribution, implement any special AI in `GameEngine.tsx`, and finish with `npm run verify`.

Then complete all four integration points:

1. Add `'MY_UPGRADE'` to the `UpgradeId` union in `types.ts`.
2. Add `upg_MY_UPGRADE_title` and `upg_MY_UPGRADE_desc` to both language maps in `utils/i18n.ts`.
3. Handle the effect in the `pendingUpgrade` `useEffect` switch inside `GameEngine.tsx`:

```typescript
case 'MY_UPGRADE':
  // Your custom logic here
  break;
```

4. Add a test for the effect and run `npm run verify`.

---

## 🐛 Known Issues

- [ ] Hitboxes may need fine-tuning for pixel-perfect collision
- [ ] Performance can drop on some machines with 200+ entities

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

Please ensure:
- Code follows TypeScript best practices
- Game mechanics are balanced and fun
- UI changes respect VS Code's design language

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Microsoft VS Code Team** - For creating the amazing editor that inspired this
- **TypeScript** - For making JavaScript development bearable
- **React & Vite** - For the smooth development experience
- **All the bugs** we've fought in real life - this game is dedicated to you 🪲

---

<div align="center">

### 🎮 Ready to Debug?

**[Start Playing Now!](http://vscode.emerard.me/)**

Made with ❤️ by developers, for developers

*"Ship code, not bugs!"*

---

⭐ **Star this repo** if you enjoy the game! | 🐛 **Report bugs** in Issues | 💬 **Share** with fellow devs

</div>
