<div align="center">

# 🎮 Microsoft VS Code: The Game

### *An Arcade Shooter Set Inside Your Favorite Code Editor*

<img src="./vscode.png" alt="VS Code" />

**English** | [简体中文](./README.zh-CN.md)

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
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
  - 🐛 **Debug** - Monitor performance metrics and combos
  - 🧩 **Extensions** - Check your installed power-ups

### ⚔️ **Intense Gameplay**
- **9 Unique Enemy Types**: From basic bugs 🪲 to merge conflicts ⚠️ to the terrifying MONOLITH boss
- **Progressive Difficulty**: Waves get harder with smarter enemies and epic boss battles
- **Combo System**: Chain kills for massive score multipliers
- **Power-Ups**:
  - ☕ **Coffee** - Speed boost
  - 🤖 **GitHub Copilot** - Weapon upgrade
  - 🐳 **Docker** - Temporary shield

### 🎨 **Polished Mechanics**
- **Advanced Weapon System**: 
  - Ammo management with auto-reload
  - TypeScript Compiler upgrades
  - Ultimate "Refactor" ability (Press R/Shift)
- **Visual Effects**: 
  - Particle explosions on enemy destruction
  - Floating damage numbers
  - Hit flash feedback
  - Animated combo meter
- **Dynamic Audio Feedback**: Terminal logs show real-time game events

---

## 🎮 Game Mechanics

### Controls
```
WASD       → Move your player
SPACE      → Shoot TypeScript bullets
SHIFT / R  → Refactor Ultimate (when charged)
ESC        → Pause game
```

### Objective
Survive increasingly difficult waves of coding errors and deploy your project! Each wave requires you to:
1. **Defeat enemies** to fill the Release Progress bar
2. **Face boss battles** when the bar is full
3. **Collect power-ups** to enhance your abilities
4. **Maintain combos** for score multipliers

### Enemy Roster

| Enemy | Symbol | HP | Points | Behavior |
|-------|--------|----|----|----------|
| **Bug** | 🪲 | 10 | 100 | Basic enemy, swarms in numbers |
| **Syntax Error** | `};` | 20 | 200 | Tanky but slow |
| **Spaghetti Code** | `goto` | 15 | 150 | Fast and erratic |
| **Memory Leak** | `malloc()` | 40 | 300 | Grows in size over time |
| **404 Error** | `404` | 15 | 250 | Extremely fast |
| **Merge Conflict** | `<<<<` | 35 | 350 | Splits into smaller enemies |
| **Infinite Loop** | `while(1)` | 25 | 400 | Spiral attack patterns |
| **Race Condition** | `async` | 20 | 500 | Teleports randomly |
| **MONOLITH** 👹 | `LegacyWrapper` | 600 | 5000 | Boss: shoots projectiles, blocks deployment |

### Progression System
- **Weapon Levels**: Collect Copilot power-ups to upgrade TypeScript Compiler
- **Ammo System**: 40 bullets max, auto-regenerates slowly, reload time 2.5s
- **Special Meter**: Charges by defeating enemies, unleash "Refactor" to clear the screen
- **Wave System**: Difficulty scales each version release (v1.0, v2.0, v3.0...)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/microsoft-vs-code-game.git
cd microsoft-vs-code-game

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:5173` 🎮

### Build for Production

```bash
# Build optimized version
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

---

## 💻 Development

### Project Structure

```
microsoft-vs-code-game/
├── components/
│   └── GameEngine.tsx      # Core game logic, physics, rendering
├── App.tsx                 # VS Code UI shell, sidebars, overlays
├── types.ts                # TypeScript interfaces for game entities
├── constants.ts            # Game configuration, enemy data, colors
├── index.tsx               # React entry point
├── index.html              # HTML template
└── vscode.png              # VS Code logo asset
```

### Tech Stack

- **React 19.2** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 6.2** - Build tool and dev server
- **HTML5 Canvas** - Game rendering
- **CSS3** - VS Code styling

### Key Components

#### `GameEngine.tsx`
Contains all game logic:
- Game loop (60 FPS)
- Entity management (players, enemies, projectiles, particles)
- Collision detection
- Enemy AI behaviors
- Power-up spawning
- Boss mechanics
- Canvas rendering

#### `App.tsx`
Handles the VS Code interface:
- Activity bar navigation
- Dynamic sidebar views
- Terminal log display
- Start/game-over screens
- Stats tracking and display
- Minimap (planned feature)

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
export const PLAYER_SPEED = 5;           // Movement speed
export const MAX_AMMO = 40;              // Ammo capacity
export const AMMO_REGEN = 0.4;           // Regen per frame
export const SPECIAL_CHARGE_PER_KILL = 5; // Ultimate charge rate
```

### Create New Power-Ups

```typescript
export const POWER_UPS = [
  { 
    type: 'CUSTOM_POWERUP', 
    icon: '🔥', 
    color: '#ff6b6b', 
    chance: 0.05 
  }
]
```

Then implement the effect in `GameEngine.tsx`:

```typescript
case 'CUSTOM_POWERUP':
  // Your custom logic here
  break;
```

---

## 🐛 Known Issues

- [ ] Hitboxes may need fine-tuning for pixel-perfect collision
- [ ] Performance drops on some machines with 200+ entities
- [ ] Mobile touch controls not yet implemented
- [ ] Audio/sound effects planned but not implemented

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
