// Language support — reads/writes a module-level variable so that
// the game loop (canvas, floating texts) picks up changes each frame
// without needing to be in a React dependency array.
import type { UpgradeId } from '../types';

export type Lang = 'en' | 'zh';

const LANG_STORAGE_KEY = 'VSCODE_GAME_LANGUAGE';

function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en';

  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'zh') return saved;
  } catch {
    // Storage can be unavailable in privacy-focused browser contexts.
  }

  return window.navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

function applyDocumentLang(lang: Lang): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }
}

let currentLang: Lang = readInitialLang();
applyDocumentLang(currentLang);

export function setLang(lang: Lang): void {
  currentLang = lang;
  applyDocumentLang(lang);
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // The in-memory language still works when storage is unavailable.
  }
}
export function getLang(): Lang { return currentLang; }

// ─────────────────────────────────────────────────────────────────────────────
// Translation table
// ─────────────────────────────────────────────────────────────────────────────

const STRINGS = {
  en: {
    // ── Canvas floating texts ─────────────────────────────────────────────
    blocked:          'BLOCKED',
    exception:        'EXCEPTION!',
    split:            'SPLIT!',
    gcPause:          'GC PAUSE...',
    gcComplete:       'GC COMPLETE',
    speedUp:          'SPEED++',
    weaponUp:         'WEAPON++',
    shield:           'SHIELD',
    deploySuccess:    'DEPLOYMENT SUCCESS!',
    bossApproaching:  'BOSS APPROACHING',
    refactorComplete: 'REFACTOR COMPLETE',
    compilerUpgraded: 'COMPILER UPGRADED!',
    heapExpanded:     'HEAP EXPANDED!',
    bufferOverflow:   'BUFFER OVERFLOW!',
    fastGcEnabled:    'FAST GC ENABLED!',
    overclocked:      'OVERCLOCKED!',
    comboLabel:       '{n}x COMBO!',
    hpGain:           '+{n} HP',
    dmgLabel:         '-{n}',

    // ── Canvas UI ─────────────────────────────────────────────────────────
    breakpointHit:    'BREAKPOINT HIT',
    pressToContinue:  'Press P to Continue',
    bossBar:          'LEGACY MONOLITH (v{wave}.0)',
    bossBarPhase2:    '⚠ PHASE 2 ─ LEGACY MONOLITH (v{wave}.0) ⚠',
    hpLabel:          'HP',
    gameCanvasLabel:  'VS Code arcade shooter game area',

    // ── Terminal logs ─────────────────────────────────────────────────────
    logInit:          'System initialized.',
    logNewSession:    'New session started.',
    logRefactor:      'EXECUTING GLOBAL REFACTOR...',
    logBoss:          'CRITICAL: Legacy Monolith detected! Expect high latency.',
    logBossKilled:    'SUCCESS: v{wave}.0 Shipped!',
    logComboBreak:    'Combo broken. Optimize loop.',
    logGcPause:       'Warning: Heap full. Triggering Garbage Collection.',

    // ── Start screen ──────────────────────────────────────────────────────
    appTitle:         'VS CODE: THE GAME',
    appVersion:       'Version 3.2.0 (Insiders Edition)',
    bestLabel:        'BEST',
    controlsTitle:    'CONTROLS',
    ctrlMove:         'Move',
    ctrlSens:         'Sensitivity',
    ctrlShoot:        'Shoot',
    ctrlRefactor:     'Refactor (Ult)',
    ctrlPause:        'Pause',
    featuresTitle:    'NEW FEATURES',
    feat1:            'Extensions: View stats in sidebar',
    feat2:            'Minimap: Tactical overview',
    feat3:            'Combos: Chain kills for score',
    feat4:            'Hotfix: Pick up to heal',
    feat5:            'Upgrades: Choose after each Boss',
    startBtn:         'F5 Start Debugging',

    // ── Game Over ─────────────────────────────────────────────────────────
    buildFailed:      'BUILD FAILED',
    exitCode:         'Exit code:',
    errorAt:          'Error: Uncaught Exception at Version {wave}.0',
    finalScore:       'Final Score:',
    highScore:        'High Score:',
    newRecord:        'NEW RECORD!',
    maxCombo:         'Max Combo:',
    bugsFixed:        'Bugs Fixed:',
    restartBtn:       'Rebuild & Restart',

    // ── Wave Upgrade ──────────────────────────────────────────────────────
    waveDeployed:     'v{wave}.0 Deployed Successfully',
    chooseUpgrade:    'CHOOSE AN UPGRADE',
    upgradeSubtitle:  'Select one extension to install before the next wave',
    clickToConfirm:   'Click a card to confirm',

    // Upgrade card titles & descriptions (keyed by UPGRADE_OPTIONS id)
    upg_WEAPON_title:    'Compiler Upgrade',
    upg_WEAPON_desc:     'TypeScript compiler +1 level. More projectiles.',
    upg_MAX_HP_title:    'Heap Expansion',
    upg_MAX_HP_desc:     'Max HP +25 and fully restore current HP.',
    upg_MAX_AMMO_title:  'Buffer Overflow',
    upg_MAX_AMMO_desc:   'Magazine size +10. More shots before GC pause.',
    upg_RELOAD_title:    'Fast GC',
    upg_RELOAD_desc:     'Garbage collection 30% faster. Shorter reload time.',
    upg_OVERCLOCK_title: 'Overclock CPU',
    upg_OVERCLOCK_desc:  'Permanent fire rate boost (100ms → 80ms).',

    // ── Explorer sidebar ──────────────────────────────────────────────────
    runDebugLabel:   'Run & Debug',
    scoreLabel:      'SCORE:',
    bugsLabel:       'BUGS:',
    waveLabel:       'WAVE:',
    releaseProgress: 'RELEASE PROGRESS',
    bossBlockMsg:    '⚠ LEGACY CODEBLOCK BLOCKING DEPLOYMENT',

    // ── Search sidebar ────────────────────────────────────────────────────
    enemyDatabase:   'ENEMY DATABASE',
    unknownEntity:   'Unknown Entity',
    enemyDescBug:      'Common bug. Weak alone, dangerous in a swarm.',
    enemyDescSyntax:   'A stubborn syntax error with extra durability.',
    enemyDescSpaghetti:'Unpredictable spaghetti code that drifts sideways.',
    enemyDescMerge:    'A merge conflict that splits into two bugs on defeat.',
    enemyDescLoop:     'An infinite loop that advances in a spiral pattern.',
    enemyDescRace:     'A race condition that teleports at random intervals.',
    enemyDescMemory:   'A memory leak that grows while it remains alive.',
    enemyDesc404:      'A missing resource moving at very high speed.',
    enemyDescMonolith: 'The legacy-code boss with projectiles and minions.',

    // ── Git sidebar ───────────────────────────────────────────────────────
    commitHistory:    'COMMIT HISTORY',
    initialCommit:    'Initial Commit',
    releaseLabel:     'v{wave}.0 Release',
    refactoredLines:  'Refactored {n} lines',
    workingOn:        'Currently working on v{wave}.0...',

    // ── Debug sidebar ─────────────────────────────────────────────────────
    debugConsole:   'DEBUG CONSOLE',
    hwAccel:        'Hardware Acceleration:',
    hwEnabled:      'ENABLED',
    frameTimeLabel: 'Frame Time:',
    heapUsage:      'Heap Usage:',
    dbgMaxCombo:    'Max Combo:',
    dbgLines:       'Lines Written:',
    dbgHighScore:   'High Score:',

    // ── Extensions sidebar ────────────────────────────────────────────────
    installedExt:       'INSTALLED EXTENSIONS',
    extTsTitle:         'TypeScript Compiler',
    extTsDesc:          'Provides type-safe projectile emission.',
    extGcTitle:         'Garbage Collector',
    extGcHeap:          'Heap:',
    extGcDesc:          'Auto-cleans unused memory blocks.',
    extDockerTitle:     'Docker Container',
    extDockerRunning:   'Running',
    extDockerStopped:   'Stopped',
    extDockerDesc:      'Isolates process from fatal errors.',
    extRefactorTitle:   'Refactor CLI',
    extRefactorCharge:  'Charge:',
    extRefactorDesc:    "Press 'R' to optimize all code instantly.",

    // ── Settings panel ────────────────────────────────────────────────────
    playerSettings:  'PLAYER SETTINGS',
    moveSensLabel:   'Movement Sensitivity',
    sensSlowLabel:   'Slow 0.50x',
    sensDefaultLabel:'Default 1.00x',
    sensFastLabel:   'Fast 2.00x',
    sensDesc:        'Adjusts arrow-key and WASD movement speed in real time while keeping the default 1.00x movement profile.',
    soundLabel:      'Sound Effects',
    soundOnLabel:    '🔊 ON',
    soundMutedLabel: '🔇 MUTED',
    soundDesc:       'WebAudio synthesised SFX. Toggle to silence all in-game sounds.',
    languageLabel:   'Language',
    langEnBtn:       '🌐 English',
    langZhBtn:       '🌐 中文',

    // ── Activity bar tooltips ─────────────────────────────────────────────
    ttExplorer:   'Explorer (Ctrl+Shift+E)',
    ttSearch:     'Enemy Database (Ctrl+Shift+F)',
    ttGit:        'Source Control (Ctrl+Shift+G)',
    ttDebug:      'Run & Debug (Ctrl+Shift+D)',
    ttExtensions: 'Extensions (Ctrl+Shift+X)',
    ttSettings:   'Settings',
    closeSidebar: 'Close sidebar',
    touchMove:    'Touch movement controls',
    touchShoot:   'Hold to shoot',
    touchRefactor:'Run refactor ultimate',

    // ── Terminal tabs ─────────────────────────────────────────────────────
    termProblems: 'Problems',
    termTerminal: 'Terminal',
    termDebug:    'Debug Console',
    termOutput:   'Output',

    // ── Start terminal log lines ──────────────────────────────────────────
    termLog1: '> npm run dev',
    termLog2: '> Build started...',
    termLog3: '> Compiling TypeScript...',
    termLog4: '> Ready on http://localhost:3000',

    // ── Status bar ────────────────────────────────────────────────────────
    statusMute:   'Mute',
    statusUnmute: 'Unmute',
    statusLang:   'Language',
  },

  zh: {
    // ── Canvas floating texts ─────────────────────────────────────────────
    blocked:          '已格挡',
    exception:        '异常！',
    split:            '分裂！',
    gcPause:          'GC 暂停...',
    gcComplete:       'GC 完成',
    speedUp:          '速度提升',
    weaponUp:         '武器升级',
    shield:           '护盾激活',
    deploySuccess:    '部署成功！',
    bossApproaching:  'Boss 来袭！',
    refactorComplete: '重构完成',
    compilerUpgraded: '编译器已升级！',
    heapExpanded:     '堆内存扩容！',
    bufferOverflow:   '缓冲区溢出！',
    fastGcEnabled:    '快速GC已启用！',
    overclocked:      '已超频！',
    comboLabel:       '{n}x 连击！',
    hpGain:           '+{n} 生命',
    dmgLabel:         '-{n}',

    // ── Canvas UI ─────────────────────────────────────────────────────────
    breakpointHit:    '断点命中',
    pressToContinue:  '按 P 继续',
    bossBar:          '遗留代码单体 (v{wave}.0)',
    bossBarPhase2:    '⚠ 第二阶段 ─ 遗留代码单体 (v{wave}.0) ⚠',
    hpLabel:          '生命',
    gameCanvasLabel:  'VS Code 街机射击游戏区域',

    // ── Terminal logs ─────────────────────────────────────────────────────
    logInit:       '系统已初始化。',
    logNewSession: '新会话已开始。',
    logRefactor:   '正在执行全局重构...',
    logBoss:       '严重警告：检测到遗留代码单体！高延迟预警。',
    logBossKilled: '成功：v{wave}.0 已发布！',
    logComboBreak: '连击中断，优化循环。',
    logGcPause:    '警告：堆已满，正在触发垃圾回收。',

    // ── Start screen ──────────────────────────────────────────────────────
    appTitle:      'VS CODE：游戏版',
    appVersion:    '版本 3.2.0（内测版）',
    bestLabel:     '最佳',
    controlsTitle: '操作方式',
    ctrlMove:      '移动',
    ctrlSens:      '灵敏度',
    ctrlShoot:     '射击',
    ctrlRefactor:  '重构大招',
    ctrlPause:     '暂停',
    featuresTitle: '新特性',
    feat1:         '扩展：在侧边栏查看统计数据',
    feat2:         '小地图：战术概览',
    feat3:         '连击：连续击杀得分加成',
    feat4:         '热修复：拾取道具回血',
    feat5:         '升级：击败Boss后选择强化',
    startBtn:      'F5 开始调试',

    // ── Game Over ─────────────────────────────────────────────────────────
    buildFailed:  '构建失败',
    exitCode:     '退出代码：',
    errorAt:      '错误：版本 {wave}.0 发生未捕获异常',
    finalScore:   '最终得分：',
    highScore:    '最高纪录：',
    newRecord:    '新纪录！',
    maxCombo:     '最高连击：',
    bugsFixed:    '已修复 Bug：',
    restartBtn:   '重新构建并重启',

    // ── Wave Upgrade ──────────────────────────────────────────────────────
    waveDeployed:    'v{wave}.0 部署成功',
    chooseUpgrade:   '选择升级项',
    upgradeSubtitle: '在下一波开始前选择一项扩展安装',
    clickToConfirm:  '点击卡片确认选择',

    // Upgrade card titles & descriptions
    upg_WEAPON_title:    '编译器升级',
    upg_WEAPON_desc:     'TypeScript 编译器 +1 级，发射更多弹幕。',
    upg_MAX_HP_title:    '堆内存扩容',
    upg_MAX_HP_desc:     '最大生命值 +25 并立即回满。',
    upg_MAX_AMMO_title:  '缓冲区溢出',
    upg_MAX_AMMO_desc:   '弹匣容量 +10，减少GC暂停次数。',
    upg_RELOAD_title:    '快速 GC',
    upg_RELOAD_desc:     '垃圾回收提速 30%，装弹时间缩短。',
    upg_OVERCLOCK_title: '超频 CPU',
    upg_OVERCLOCK_desc:  '永久提升射速（100ms → 80ms）。',

    // ── Explorer sidebar ──────────────────────────────────────────────────
    runDebugLabel:   '运行和调试',
    scoreLabel:      '得分：',
    bugsLabel:       'Bug：',
    waveLabel:       '波次：',
    releaseProgress: '发布进度',
    bossBlockMsg:    '⚠ 遗留代码阻断了部署',

    // ── Search sidebar ────────────────────────────────────────────────────
    enemyDatabase: '敌人数据库',
    unknownEntity: '未知实体',
    enemyDescBug:       '普通 Bug，单独很弱，成群出现时更危险。',
    enemyDescSyntax:    '比较耐打的语法错误。',
    enemyDescSpaghetti: '横向飘动、轨迹难以预测的面条代码。',
    enemyDescMerge:     '被击败后会分裂成两个 Bug 的合并冲突。',
    enemyDescLoop:      '沿螺旋轨迹前进的死循环。',
    enemyDescRace:      '定期随机瞬移的竞态条件。',
    enemyDescMemory:    '存活越久体积越大的内存泄漏。',
    enemyDesc404:       '高速移动的资源丢失错误。',
    enemyDescMonolith:  '会发射弹幕并召唤小怪的遗留代码 Boss。',

    // ── Git sidebar ───────────────────────────────────────────────────────
    commitHistory:   '提交历史',
    initialCommit:   '初次提交',
    releaseLabel:    'v{wave}.0 正式版',
    refactoredLines: '重构了 {n} 行代码',
    workingOn:       '当前正在开发 v{wave}.0...',

    // ── Debug sidebar ─────────────────────────────────────────────────────
    debugConsole:   '调试控制台',
    hwAccel:        '硬件加速：',
    hwEnabled:      '已启用',
    frameTimeLabel: '帧耗时：',
    heapUsage:      '堆使用：',
    dbgMaxCombo:    '最高连击：',
    dbgLines:       '已写代码行：',
    dbgHighScore:   '最高分：',

    // ── Extensions sidebar ────────────────────────────────────────────────
    installedExt:       '已安装扩展',
    extTsTitle:         'TypeScript 编译器',
    extTsDesc:          '提供类型安全的弹幕发射能力。',
    extGcTitle:         '垃圾回收器',
    extGcHeap:          '堆：',
    extGcDesc:          '自动清理未使用的内存块。',
    extDockerTitle:     'Docker 容器',
    extDockerRunning:   '运行中',
    extDockerStopped:   '已停止',
    extDockerDesc:      '隔离进程，防止致命错误。',
    extRefactorTitle:   'Refactor CLI',
    extRefactorCharge:  '充能：',
    extRefactorDesc:    "按 'R' 立即优化所有代码。",

    // ── Settings panel ────────────────────────────────────────────────────
    playerSettings:   '玩家设置',
    moveSensLabel:    '移动灵敏度',
    sensSlowLabel:    '缓慢 0.50x',
    sensDefaultLabel: '默认 1.00x',
    sensFastLabel:    '快速 2.00x',
    sensDesc:         '实时调整方向键和 WASD 的移动速度，默认值为 1.00x。',
    soundLabel:       '音效',
    soundOnLabel:     '🔊 开启',
    soundMutedLabel:  '🔇 已静音',
    soundDesc:        'WebAudio 合成音效，切换可静音所有游戏音效。',
    languageLabel:    '语言',
    langEnBtn:        '🌐 English',
    langZhBtn:        '🌐 中文',

    // ── Activity bar tooltips ─────────────────────────────────────────────
    ttExplorer:   '资源管理器 (Ctrl+Shift+E)',
    ttSearch:     '敌人数据库 (Ctrl+Shift+F)',
    ttGit:        '源代码管理 (Ctrl+Shift+G)',
    ttDebug:      '运行和调试 (Ctrl+Shift+D)',
    ttExtensions: '扩展 (Ctrl+Shift+X)',
    ttSettings:   '设置',
    closeSidebar: '关闭侧边栏',
    touchMove:    '触控移动',
    touchShoot:   '按住射击',
    touchRefactor:'释放重构大招',

    // ── Terminal tabs ─────────────────────────────────────────────────────
    termProblems: '问题',
    termTerminal: '终端',
    termDebug:    '调试控制台',
    termOutput:   '输出',

    // ── Start terminal log lines ──────────────────────────────────────────
    termLog1: '> npm run dev',
    termLog2: '> 构建开始...',
    termLog3: '> 正在编译 TypeScript...',
    termLog4: '> 已就绪 http://localhost:3000',

    // ── Status bar ────────────────────────────────────────────────────────
    statusMute:   '静音',
    statusUnmute: '取消静音',
    statusLang:   '语言',
  },
} as const;

export type TranslationKey = keyof typeof STRINGS.en;
const zhTranslationCompletenessCheck: Record<TranslationKey, string> = STRINGS.zh;
void zhTranslationCompletenessCheck;

/** Look up a translation string, substituting {placeholder} tokens. */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const map = STRINGS[currentLang] as Record<string, string>;
  const en  = STRINGS.en            as Record<string, string>;
  let str = map[key] ?? en[key] ?? String(key);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

/** Convenience helper for upgrade card translations. */
export function tUpgrade(id: UpgradeId, field: 'title' | 'desc'): string {
  return t(`upg_${id}_${field}` as TranslationKey);
}
