export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const COLORS = {
  bg: '#1e1e1e',
  sidebar: '#252526',
  activityBar: '#333333',
  statusBar: '#007acc',
  text: '#cccccc',
  keyword: '#569cd6',
  string: '#ce9178',
  comment: '#6a9955',
  function: '#dcdcaa',
  number: '#b5cea8',
  error: '#f14c4c',
  warning: '#cca700',
  accent: '#007acc',
  class: '#4EC9B0',
  interface: '#B8D7A3',
  gitAdded: '#81b88b',
  gitModified: '#e2c08d',
  gitDeleted: '#c74e39',
};

export const ENEMY_TYPES = [
  // Basic
  { type: 'BUG', text: '🪲', hp: 10, score: 100, speed: 1.5, color: '#f14c4c', width: 24, desc: '普通Bug，数量众多' },
  { type: 'SYNTAX_ERROR', text: '};', hp: 20, score: 200, speed: 1.0, color: '#dcdcaa', width: 30, desc: '语法错误，比较耐打' },
  { type: 'SPAGHETTI', text: 'goto', hp: 15, score: 150, speed: 2.0, color: '#ce9178', width: 40, desc: '面条代码，移动飘忽' },
  
  // Advanced (New)
  { type: 'MERGE_CONFLICT', text: '<<<<', hp: 35, score: 350, speed: 0.8, color: '#cca700', width: 45, desc: '合并冲突，死后分裂' },
  { type: 'INFINITE_LOOP', text: 'while(1)', hp: 25, score: 400, speed: 1.2, color: '#569cd6', width: 60, desc: '死循环，螺旋攻击' },
  { type: 'RACE_CONDITION', text: 'async', hp: 20, score: 500, speed: 3.0, color: '#C586C0', width: 40, desc: '竞态条件，随机瞬移' },

  // Specials
  { type: 'MEMORY_LEAK', text: 'malloc()', hp: 40, score: 300, speed: 0.8, color: '#B8D7A3', width: 60, desc: '内存泄漏，体积膨胀' }, 
  { type: 'ERROR_404', text: '404', hp: 15, score: 250, speed: 2.5, color: '#808080', width: 35, desc: '资源丢失，速度极快' }, 
  
  // Boss
  { type: 'MONOLITH', text: 'LegacyWrapper', hp: 600, score: 5000, speed: 0.5, color: '#569cd6', width: 160, desc: '遗留代码单体，最终Boss' }, 
] as const;

export const POWER_UPS = [
  { type: 'COFFEE', icon: '☕', color: '#d2691e', chance: 0.05 },
  { type: 'COPILOT', icon: '🤖', color: '#ffffff', chance: 0.03 },
  { type: 'DOCKER', icon: '🐳', color: '#0db7ed', chance: 0.02 },
  { type: 'HOTFIX', icon: '🩹', color: '#81b88b', chance: 0.04 },
] as const;

export const UPGRADE_OPTIONS = [
  { id: 'WEAPON',    title: 'Compiler Upgrade',   desc: 'TypeScript compiler +1 level. More projectiles.',         icon: '⚡' },
  { id: 'MAX_HP',    title: 'Heap Expansion',      desc: 'Max HP +25 and fully restore current HP.',                icon: '❤️' },
  { id: 'MAX_AMMO',  title: 'Buffer Overflow',     desc: 'Magazine size +10. More shots before GC pause.',          icon: '📦' },
  { id: 'RELOAD',    title: 'Fast GC',             desc: 'Garbage collection 30% faster. Shorter reload time.',     icon: '⚙️' },
  { id: 'OVERCLOCK', title: 'Overclock CPU',       desc: 'Permanent fire rate boost (100ms → 80ms).',              icon: '🔥' },
] as const;

export const PLAYER_SPEED = 5;
export const PLAYER_BOOST_SPEED = 9;
export const FIRE_RATE = 150; 
export const PARTICLE_CHARS = ['{', '}', ';', '</>', '&&', '||', '!', 'return', 'void', 'null'];
export const BACKGROUND_STRINGS = ['const', 'let', 'var', 'function', 'import', 'export', 'return', 'if', 'else', 'map', 'filter', 'reduce', '=>', 'async', 'await', 'try', 'catch', 'class', 'extends', 'new', 'this', 'super'];

export const MAX_AMMO = 40;
export const AMMO_REGEN = 0.4;
export const RELOAD_TIME = 150; 

export const SPECIAL_CHARGE_PER_KILL = 5;
export const COMBO_TIMER_MAX = 120; // 2 seconds at 60fps
export const MAX_SPECIAL_CHARGE = 100;