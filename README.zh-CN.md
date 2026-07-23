<div align="center">

# 🎮 微软大战代码: 游戏版

### *在你最爱的代码编辑器中开启街机射击之旅*

<img src="./vscode.png" alt="VS Code" />

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)


<a href="http://vscode.emerard.me/">
  <img src="https://img.shields.io/badge/▶️_立即游玩-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white&labelColor=1f1f1f" height="50" />
</a>

<br/>

![游戏演示](./Gameplay.gif)

**[📖 文档](#游戏机制)** • **[🎯 特性](#特性)** • **[💻 开发](#开发)**

---

**[English](./README.md)** | 简体中文

---

*"如果调试是一场真正的战斗会怎样？"*

将你的编程工作流程转变为史诗级街机射击游戏！通过击败 Bug、语法错误和可怕的遗留代码巨石来部署你的项目。每一波都会带来新的挑战，重构你的代码直到 1.0 版本……以及更远！

</div>

---

## 🎯 特性

### 🕹️ **原汁原味的 VS Code 体验**
- **像素级完美 UI**：精心还原的 VS Code 界面，包含活动栏、侧边栏、编辑器标签、终端和状态栏
- **交互式侧边栏**：
  - 📁 **资源管理器** - 查看项目统计和发布进度
  - 🔍 **搜索** - 浏览敌人数据库及详细信息
  - 🌿 **源代码管理** - 追踪你在各个波次中的提交历史
  - 🐛 **调试** - 监控性能指标、连击数和本地最高分
  - 🧩 **扩展** - 查看已安装的道具和升级情况
  - ⚙️ **设置** - 调整移动灵敏度，开关音效

### ⚔️ **激烈的游戏玩法**
- **9 种独特敌人类型**：从基础 Bug 🪲 到合并冲突 ⚠️ 再到恐怖的 MONOLITH 终极 Boss
- **Boss 第二阶段**：MONOLITH 血量低于 50% 时进入狂暴状态——颜色变化、追踪弹加速，并额外发射 3 路散弹
- **渐进式难度**：波次越来越难，敌人更智能，还有史诗般的 Boss 战
- **连击系统**：连续击杀获得巨大的分数倍率
- **本地最高分**：最佳成绩通过浏览器 `localStorage` 保存，开始界面和游戏结束界面均可查看
- **能力增强道具**：
  - ☕ **咖啡** - 速度提升
  - 🤖 **GitHub Copilot** - 武器升级
  - 🐳 **Docker** - 临时护盾
  - 🩹 **热修复（Hotfix）** - 恢复 30 点生命值

### 📦 **波次间升级系统**
每次击败 Boss 后，出现三选一升级界面。选择一项永久强化效果延续本局游戏：

| 升级项 | 效果 |
|--------|------|
| ⚡ 编译器升级 | TypeScript 编译器 +1 级（更多弹幕） |
| ❤️ 堆扩容 | 最大生命值 +25 并立即回满 |
| 📦 缓冲区溢出 | 弹匣容量 +10 |
| ⚙️ 快速 GC | 装弹时间缩短 30% |
| 🔥 超频 CPU | 永久提升射速 |

### 🎨 **精致的游戏机制**
- **高级武器系统**：
  - 弹药管理和自动装填
  - TypeScript 编译器升级（最高 5 级）
  - 终极技能"重构"（按 R/Shift）
- **WebAudio 音效**：纯振荡器合成的 SFX，涵盖射击、命中、爆炸、拾取、回血、Boss 登场、大招释放、波次通关——可在状态栏和设置面板随时静音
- **视觉效果**：
  - 敌人被摧毁时的粒子爆炸
  - 浮动伤害数字
  - 受击闪烁反馈
  - 连击计量器动画
- **更清晰的战斗 HUD**：
  - 画布内紧凑的当前/最大生命值显示
  - Boss 血条带有第二阶段 `⚠ PHASE 2` 警告标签
- **帧率无关的移动与节奏**：玩家、敌人、弹幕和计时器均按真实帧时间缩放，在不同性能设备上有一致的游玩体验

---

## 🎮 游戏机制

### 操作方式
```
WASD       → 移动玩家
空格键      → 发射 TypeScript 子弹
SHIFT / R  → 重构大招（充能后）
ESC / P    → 暂停游戏
```

在触屏设备上，游戏区域底部会显示四向移动、射击和重构大招按钮；活动栏会打开可关闭的移动端侧边栏。

### 调整与设置
- 点击活动栏底部的齿轮图标打开 **设置**
- 可将 **移动灵敏度** 调整在 `0.5x` 到 `2.0x` 之间
- 可开关 **音效** —— 或点击状态栏的 🔔 图标快速静音
- 拖动滑杆后会自动失焦，键盘控制会立即回到游戏

### 游戏目标
在越来越困难的编码错误波次中生存下来并部署你的项目！每个波次你需要：
1. **击败敌人** 填充发布进度条
2. **进度条满后** 面对 Boss 战
3. **击败 Boss 后** 选择一项波次升级
4. **收集道具** 增强你的能力
5. **保持连击** 获得分数倍数

### 敌人名册

| 敌人 | 符号 | 生命值 | 分数 | 行为特点 |
|-------|--------|----|----|----------|
| **Bug** | 🪲 | 10 | 100 | 基础敌人，数量众多 |
| **语法错误** | `};` | 20 | 200 | 笨重但耐打 |
| **面条代码** | `goto` | 15 | 150 | 快速且移动飘忽 |
| **内存泄漏** | `malloc()` | 40 | 300 | 体积会随时间膨胀 |
| **404 错误** | `404` | 15 | 250 | 速度极快 |
| **合并冲突** | `<<<<` | 35 | 350 | 死后会分裂成小敌人 |
| **死循环** | `while(1)` | 25 | 400 | 螺旋攻击模式 |
| **竞态条件** | `async` | 20 | 500 | 随机瞬移 |
| **MONOLITH** 👹 | `LegacyWrapper` | 600 | 5000 | Boss：追踪弹、召唤小怪、第二阶段散弹 |

### 进度系统
- **武器等级**：收集 Copilot 道具或选择编译器升级，最高 5 级
- **弹药系统**：最大 40 发（可扩容），缓慢自动回复，装填时间可通过升级缩短
- **特殊技能条**：击败敌人充能，释放"重构"清空屏幕
- **波次系统**：每个版本发布难度递增（v1.0, v2.0, v3.0…）
- **本地最高分**：通过 `localStorage` 持久化，在开始和游戏结束界面展示，超越时显示「NEW RECORD!」

---

## 🚀 快速开始

### 环境要求
- **Node.js**（20.19+ 的 20.x 版本，或 22.12+）
- **npm** 或 **yarn**

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/Dreamer431/microsoft-vs-code.git
cd microsoft-vs-code

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

游戏将在 `http://localhost:3000` 打开 🎮

### 生产环境构建

```bash
# 构建优化版本
npm run build

# 运行类型检查、Lint、测试和生产构建
npm run verify

# 预览生产构建
npm run preview

# 部署到 GitHub Pages
npm run deploy
```

---

## 💻 开发

### 项目结构

```
microsoft-vs-code/
├── components/
│   ├── GameEngine.tsx      # 帧循环与运行时调度
│   └── TouchControls.tsx   # 移动端触控键帽
├── game/
│   ├── advanceEntities.ts  # 弹丸与短生命周期实体推进
│   ├── canvasViewport.ts   # 响应式高分屏 Canvas 尺寸
│   ├── combat.ts           # 碰撞效果与伤害结算
│   ├── collision.ts        # 通用碰撞检测
│   ├── contentSelection.ts # 敌人、升级与道具选择
│   ├── entityFactory.ts    # 敌人、弹丸与特效实体构造
│   ├── minimap.ts          # 全高世界位置遥测
│   ├── playerSystem.ts     # 移动、计时、换弹与射击
│   ├── progression.ts      # 分数、连击、波次与击败奖励
│   ├── refactorUltimate.ts # 重构终极技能
│   ├── renderScene.ts      # Canvas 场景渲染
│   ├── updateEnemy.ts      # 敌人与 Boss 行为更新
│   ├── upgrades.ts         # 波次升级效果
│   └── useGameInput.ts     # 键盘输入生命周期
├── utils/
│   ├── audio.ts            # WebAudio 合成音效引擎
│   ├── gameLogic.ts        # 可测试的时间、伤害、输入纯逻辑
│   ├── gameState.ts        # 玩家与统计初始状态工厂
│   └── i18n.ts             # 中英文翻译和语言持久化
├── App.tsx                 # VS Code UI 外壳、侧边栏、覆盖层
├── types.ts                # 游戏实体的 TypeScript 接口
├── constants.ts            # 游戏配置、敌人数据、升级选项
├── index.css               # 本地 Tailwind 入口与全局可访问性样式
├── index.tsx               # React 入口点
├── index.html              # HTML 模板
└── vscode.png              # VS Code logo 资源
```

### 技术栈

- **React 19.2** - UI 框架
- **TypeScript 5.8** - 类型安全
- **Vite 8.1** - 构建工具和开发服务器
- **HTML5 Canvas** - 游戏渲染
- **Web Audio API** - 程序化音效
- **CSS3 / Tailwind 3** - 本地编译的 VS Code 样式，不依赖运行时 CDN
- **Vitest / ESLint** - 游戏纯逻辑测试和静态质量门禁

### 核心组件

#### `GameEngine.tsx`
负责协调游戏运行时：
- 按真实时间推进的游戏循环，减少帧率差异带来的速度变化
- 可变实体状态与 `requestAnimationFrame` 生命周期
- 敌人生成、战斗、成长与升级流程协调
- 将输入、碰撞、敌人行为和绘制委托给独立模块
- 波次升级触发 → `GameState.UPGRADE`

#### `game/` 模块
- `useGameInput.ts`：负责键盘监听、清理与暂停切换
- `entityFactory.ts`：创建敌人、Boss、弹丸、道具与特效实体
- `advanceEntities.ts`：推进弹丸、粒子与浮动文字
- `canvasViewport.ts`：让 Canvas 文字在不同像素密度下保持清晰
- `minimap.ts`：将完整可玩区域投影到预留的右侧遥测轨道
- `combat.ts`：结算接触伤害、弹丸伤害、道具拾取与实体清理
- `playerSystem.ts`：负责移动、状态计时、弹药、换弹与射击
- `progression.ts`：负责击败奖励、连击、Boss 通关与升级选项
- `refactorUltimate.ts`：负责终极技能的激活与伤害
- `upgrades.ts`：应用波次升级与永久局内增益
- `updateEnemy.ts`：负责敌人移动、特殊行为与 Boss 阶段
- `collision.ts`：提供通用碰撞检测
- `contentSelection.ts`：负责带权随机内容选择
- `renderScene.ts`：负责 Canvas 绘制与视觉特效

#### `App.tsx`
处理 VS Code 界面：
- 活动栏导航
- 动态侧边栏视图（资源管理器、搜索、Git、调试、扩展、设置）
- 波次升级遮罩（三选一卡片 UI）
- 通过 `localStorage` 持久化最高分
- 终端日志显示
- 开始 / 游戏结束画面
- 音效开关

#### `utils/audio.ts`
轻量级程序化音效：
- 无外部音频文件——所有音效通过 `OscillatorNode` 和白噪声合成
- 全局静音开关
- 函数：`sfxShoot`、`sfxHit`、`sfxExplosion`、`sfxPowerUp`、`sfxHeal`、`sfxBossAppear`、`sfxUltimate`、`sfxPlayerHit`、`sfxWaveClear`

---

## 🎨 自定义

### 修改敌人难度

编辑 `constants.ts`：

```typescript
export const ENEMY_TYPES = [
  {
    type: 'BUG',
    text: '🪲',
    hp: 10,        // 增加数值让 Bug 更耐打
    score: 100,    // 调整分数值
    speed: 1.5,    // 越高越快
    color: '#f14c4c',
    width: 24,
    desc: '普通Bug，数量众多'
  },
  // 添加你自己的敌人！
]
```

### 调整游戏平衡

```typescript
// constants.ts
export const PLAYER_SPEED = 5;             // 移动速度
export const MAX_AMMO = 40;                // 弹药容量
export const AMMO_REGEN = 0.4;             // 每帧恢复量
export const SPECIAL_CHARGE_PER_KILL = 5;  // 大招充能速率
```

### 添加新升级项

```typescript
// constants.ts
export const UPGRADE_OPTIONS = [
  {
    id: 'MY_UPGRADE',
    icon: '🔥'
  }
]
```

新增敌人不只需要添加配置：还要同步扩展 `types.ts` 中的 `EnemyType`，为 `descKey` 添加中英文翻译，将类型加入 `game/contentSelection.ts` 的波次生成分布，并在 `game/updateEnemy.ts` 实现特殊行为。最后运行 `npm run verify`。

然后完成以下步骤：

1. 在 `types.ts` 的 `UpgradeId` 联合类型中加入 `'MY_UPGRADE'`。
2. 在 `utils/i18n.ts` 的中英文表中分别加入 `upg_MY_UPGRADE_title` 和 `upg_MY_UPGRADE_desc`。
3. 在 `game/upgrades.ts` 的 `applyUpgrade` switch 中实现效果：

```typescript
case 'MY_UPGRADE':
  // 你的自定义逻辑
  break;
```

4. 为升级效果补测试，并运行 `npm run verify`。

---

## 🐛 已知问题

- [ ] 碰撞箱可能需要微调以实现像素级完美碰撞
- [ ] 某些机器上超过 200 个实体时性能下降

---

## 🤝 贡献

欢迎贡献！参与方式：

1. **Fork** 这个仓库
2. **创建** 特性分支（`git checkout -b feature/AmazingFeature`）
3. **提交** 你的更改（`git commit -m 'Add some AmazingFeature'`）
4. **推送** 到分支（`git push origin feature/AmazingFeature`）
5. **开启** Pull Request

请确保：
- 代码遵循 TypeScript 最佳实践
- 游戏机制平衡且有趣
- UI 更改尊重 VS Code 的设计语言

---

## 📜 许可证

本项目采用 **MIT 许可证** - 详见 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

- **Microsoft VS Code 团队** - 创造了启发本项目的优秀编辑器
- **TypeScript** - 让 JavaScript 开发变得可以忍受
- **React & Vite** - 提供流畅的开发体验
- **所有我们在现实生活中遇到的 Bug** - 这个游戏献给你们 🪲

---

<div align="center">

### 🎮 准备好调试了吗？

**[现在开始游玩！](http://vscode.emerard.me/)**

由开发者制作，献给开发者 ❤️

*"交付代码，而不是 Bug！"*

---

⭐ **如果你喜欢这个游戏，请给仓库加星！** | 🐛 **在 Issues 中报告 Bug** | 💬 **与开发者同行分享**

</div>
