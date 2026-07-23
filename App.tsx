
import React, { useState, useEffect, useRef } from 'react';
import GameEngine from './components/GameEngine';
import { GameState, GameStats, SidebarView, UpgradeId, UpgradeOption } from './types';
import { ENEMY_TYPES, COMBO_TIMER_MAX } from './constants';
import { resumeAudio, setMuted, isMuted } from './utils/audio';
import { getLang, setLang, t, tUpgrade, Lang } from './utils/i18n';
import { createInitialGameStats } from './utils/gameState';
import vscodeLogo from './vscode.png';

const HIGH_SCORE_KEY = 'VSCODE_GAME_HIGHSCORE';

type EditorDocument = 'GAME' | 'ENEMIES' | 'METADATA';
type BottomPanel = 'PROBLEMS' | 'TERMINAL' | 'DEBUG' | 'OUTPUT';

const EDITOR_DOCUMENTS: Record<EditorDocument, { label: string; icon: string; color: string }> = {
  GAME: { label: 'game_loop.ts', icon: 'TS', color: '#cca700' },
  ENEMIES: { label: 'enemies.json', icon: 'JSON', color: '#e06c75' },
  METADATA: { label: 'metadata.json', icon: 'JSON', color: '#e06c75' },
};

const readHighScore = (): number => {
  try {
    return Number(window.localStorage.getItem(HIGH_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
};

const writeHighScore = (score: number): void => {
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // The current session remains playable when persistent storage is blocked.
  }
};

interface IconProps {
    active: boolean;
    onClick: () => void;
    title: string;
}

const SidebarIcon = ({ active, onClick, children, title }: IconProps & { children: React.ReactNode }) => (
    <div className="relative group w-full flex justify-center mb-4">
        <button
            type="button"
            aria-label={title}
            title={title}
            className={`cursor-pointer p-2 transition-colors ${active ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={onClick}
        >
            {children}
        </button>
        {active && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-white"></div>}
        <div className="absolute left-12 top-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-[#454545] shadow-lg transition-opacity delay-75">
            {title}
        </div>
    </div>
);

const VscLogo = ({ className }: { className?: string }) => (
    <img
        src={vscodeLogo}
        className={className}
        alt="VS Code"
        style={{ objectFit: 'contain' }}
    />
);

const FilesIcon      = () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const SearchIcon     = () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const GitIcon        = () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>;
const BugIcon        = () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ExtensionsIcon = () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;

const SettingsIcon = ({ active, onClick, title }: { active: boolean; onClick: () => void; title: string }) => (
    <div className="relative group w-full flex justify-center mt-auto mb-4">
        <button
            type="button"
            aria-label={title}
            title={title}
            className={`cursor-pointer p-2 transition-colors ${active ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={onClick}
        >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
        {active && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-white"></div>}
        <div className="absolute left-12 top-1 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-[#454545] shadow-lg">
            {title}
        </div>
    </div>
);

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [sidebarView, setSidebarView] = useState<SidebarView>('EXPLORER');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [movementSensitivity, setMovementSensitivity] = useState(1);
  const [restartToken, setRestartToken] = useState(0);
  const [stats, setStats] = useState<GameStats>(() => createInitialGameStats());
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [activeDocument, setActiveDocument] = useState<EditorDocument | null>('GAME');
  const [openDocuments, setOpenDocuments] = useState<EditorDocument[]>(['GAME', 'ENEMIES']);
  const [activeBottomPanel, setActiveBottomPanel] = useState<BottomPanel>('TERMINAL');
  const [workbenchNotice, setWorkbenchNotice] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // High score
  const [highScore, setHighScore] = useState<number>(readHighScore);
  const [newRecord, setNewRecord] = useState(false);

  // Wave upgrade: id of the option the player chose; consumed by GameEngine
  const [pendingUpgrade, setPendingUpgrade] = useState<UpgradeId | null>(null);

  // Sound toggle
  const [soundMuted, setSoundMuted] = useState(isMuted);

  // Language: storing in state triggers re-render; module-level variable drives t()
  const [lang, setLangState] = useState<Lang>(() => getLang());

  const handleLangChange = (l: Lang) => {
    setLang(l);
    setLangState(l);
  };

  // Persist high score when game ends
  useEffect(() => {
    if (gameState === GameState.GAME_OVER) {
      setHighScore(previous => {
        const isRecord = stats.score > previous;
        setNewRecord(isRecord);
        if (isRecord) writeHighScore(stats.score);
        return isRecord ? stats.score : previous;
      });
    }
  }, [gameState, stats.score]);

  useEffect(() => {
    if (stats.lastLog) {
        setTerminalLogs(prev => {
            if (prev[prev.length - 1] === stats.lastLog) return prev;
            return [...prev.slice(-5), stats.lastLog];
        });
    }
  }, [stats.lastLog]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  const formatNumber = (num: number) => num.toLocaleString();
  const formatSensitivity = (value: number) => `${value.toFixed(2)}x`;

  const startFreshRun = () => {
    resumeAudio();
    setMobileSidebarOpen(false);
    setRestartToken(prev => prev + 1);
    setGameState(GameState.PLAYING);
    setTerminalLogs([t('termLog1'), t('termLog2'), t('termLog3'), t('termLog4')]);
  };

  const handleSoundToggle = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    setMuted(next);
  };

  const handleSelectUpgrade = (id: UpgradeId) => {
    setPendingUpgrade(id);
  };

  const handleUpgradeConsumed = () => {
    setPendingUpgrade(null);
  };

  const handleSidebarSelect = (view: SidebarView) => {
    setSidebarVisible(true);
    setSidebarMenuOpen(false);
    setMobileSidebarOpen(previous => sidebarView === view ? !previous : true);
    setSidebarView(view);
  };

  const openDocument = (document: EditorDocument) => {
    if (document !== 'GAME' && gameState === GameState.PLAYING) {
      setGameState(GameState.PAUSED);
      setWorkbenchNotice(t('noticeGamePaused'));
    } else {
      setWorkbenchNotice(t('noticeDocumentOpened', { name: EDITOR_DOCUMENTS[document].label }));
    }
    setOpenDocuments(previous => previous.includes(document) ? previous : [...previous, document]);
    setActiveDocument(document);
    setMobileSidebarOpen(false);
  };

  const closeDocument = (document: EditorDocument) => {
    setOpenDocuments(previous => {
      const next = previous.filter(item => item !== document);
      if (activeDocument === document) {
        const previousIndex = previous.indexOf(document);
        setActiveDocument(next[Math.min(previousIndex, next.length - 1)] ?? null);
      }
      return next;
    });
    setWorkbenchNotice(t('noticeDocumentClosed', { name: EDITOR_DOCUMENTS[document].label }));
  };

  const openBottomPanel = (panel: BottomPanel) => {
    setActiveBottomPanel(panel);
    const panelNames: Record<BottomPanel, string> = {
      PROBLEMS: t('termProblems'),
      TERMINAL: t('termTerminal'),
      DEBUG: t('termDebug'),
      OUTPUT: t('termOutput'),
    };
    setWorkbenchNotice(t('noticePanelOpened', { name: panelNames[panel] }));
  };

  const showCurrentPanelInfo = () => {
    const panelInfo: Record<SidebarView, string> = {
      EXPLORER: t('panelInfoExplorer'),
      SEARCH: t('panelInfoSearch'),
      GIT: t('panelInfoGit'),
      DEBUG: t('panelInfoDebug'),
      EXTENSIONS: t('panelInfoExtensions'),
      SETTINGS: t('panelInfoSettings'),
    };
    setWorkbenchNotice(panelInfo[sidebarView]);
    setSidebarMenuOpen(false);
  };

  // ── Sidebar renderers ────────────────────────────────────────────────────

  const renderExplorer = () => (
    <>
      <div className="px-2">
          <button
            type="button"
            className="flex w-full items-center bg-[#37373d] px-2 py-1 text-left text-xs font-bold text-white hover:bg-[#404047]"
            aria-expanded={explorerOpen}
            onClick={() => setExplorerOpen(previous => !previous)}
          >
             <span className="mr-2" aria-hidden="true">{explorerOpen ? '▼' : '▶'}</span> VSCODE-GAME
          </button>
          {explorerOpen && (
            <div className="mt-1 pl-4 text-sm font-mono text-[#569cd6]">
              <button
                type="button"
                className="flex w-full items-center py-1 text-left hover:bg-[#2a2d2e]"
                onClick={() => openDocument('GAME')}
              >
                <span className="mr-2 text-[#cca700]">TS</span> GameEngine.tsx
              </button>
              <button
                type="button"
                className="flex w-full items-center py-1 text-left hover:bg-[#2a2d2e]"
                onClick={() => openDocument('ENEMIES')}
              >
                <span className="mr-2 text-[#cca700]">TS</span> Enemies.ts
              </button>
              <button
                type="button"
                className="flex w-full items-center py-1 text-left hover:bg-[#2a2d2e]"
                onClick={() => openDocument('METADATA')}
              >
                <span className="mr-2 text-[#e06c75]">JSON</span> metadata.json
              </button>
            </div>
          )}

          <div className="px-4 py-2 mt-6 text-xs font-bold uppercase tracking-wider text-gray-500">{t('runDebugLabel')}</div>
          <div className="pl-4 mt-2 text-xs font-mono space-y-2">
             <div className="flex justify-between mb-1"><span>{t('scoreLabel')}</span> <span className="text-[#ce9178]">{formatNumber(stats.score)}</span></div>
             <div className="flex justify-between mb-1"><span>{t('bugsLabel')}</span> <span className="text-[#f14c4c]">{stats.bugsFixed}</span></div>
             <div className="flex justify-between mb-1"><span>{t('waveLabel')}</span> <span className="text-[#dcdcaa]">v{stats.wave}.0</span></div>

             {/* COMBO METER */}
             {stats.combo > 1 && (
                 <div className="mt-4 border border-[#dcdcaa] bg-[#dcdcaa]/10 p-2 rounded animate-pulse">
                    <div className="text-[#dcdcaa] font-bold text-center text-lg">{stats.combo}x COMBO</div>
                    <div className="w-full bg-[#3c3c3c] h-1 mt-1">
                        {/* BUG FIX #4: use COMBO_TIMER_MAX constant instead of hardcoded 120 */}
                        <div className="bg-[#dcdcaa] h-full transition-all duration-75" style={{ width: `${(stats.comboTimer / COMBO_TIMER_MAX) * 100}%` }} />
                    </div>
                 </div>
             )}

             {/* RELEASE PROGRESS BAR */}
             <div className="mt-4">
                 <div className="flex justify-between text-xs mb-1">
                     <span>{t('releaseProgress')}</span>
                     <span>{stats.bossActive ? t('blocked') : `${Math.round((stats.levelProgress / stats.levelTarget) * 100)}%`}</span>
                 </div>
                 <div className="w-full bg-[#3c3c3c] h-2 rounded-full overflow-hidden">
                     <div
                        className={`h-full ${stats.bossActive ? 'bg-red-500 animate-pulse' : 'bg-[#4ec9b0]'}`}
                        style={{ width: stats.bossActive ? '100%' : `${Math.min(100, (stats.levelProgress / stats.levelTarget) * 100)}%` }}
                     />
                 </div>
                 {stats.bossActive && <div className="text-red-400 text-[10px] mt-1 font-bold">{t('bossBlockMsg')}</div>}
             </div>
          </div>
      </div>
    </>
  );

  const renderSearch = () => (
    <div className="px-4 py-2">
        <div className="text-xs font-bold uppercase text-gray-500 mb-4">{t('enemyDatabase')}</div>
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin">
            {ENEMY_TYPES.map((e) => (
                <div key={e.type} className="border border-[#3c3c3c] p-2 rounded hover:bg-[#2a2d2e]">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm" style={{color: e.color}}>{e.type}</span>
                        <span className="text-lg font-mono">{e.text}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-1">HP: {e.hp} | PTS: {e.score}</div>
                    <div className="text-[10px] text-gray-500">{t(e.descKey)}</div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderGit = () => (
      <div className="px-4 py-2">
          <div className="text-xs font-bold uppercase text-gray-500 mb-4">{t('commitHistory')}</div>
          <div className="space-y-2">
              <div className="flex items-center text-xs">
                  <span className="text-[#dcdcaa] mr-2">●</span>
                  <span className="text-gray-300">{t('initialCommit')}</span>
              </div>
              {Array.from({length: stats.wave - 1}).map((_, i) => (
                  <div key={i} className="flex items-start text-xs border-l border-gray-600 ml-1 pl-3 py-2">
                      <div>
                        <div className="text-white mb-1">{t('releaseLabel', { wave: i + 1 })}</div>
                        <div className="text-gray-500">{t('refactoredLines', { n: 100 + i * 50 })}</div>
                      </div>
                  </div>
              ))}
              <div className="flex items-start text-xs border-l border-dashed border-gray-500 ml-1 pl-3 py-2">
                  <div className="text-[#cca700]">{t('workingOn', { wave: stats.wave })}</div>
              </div>
          </div>
      </div>
  );

  const renderDebug = () => (
      <div className="px-4 py-2">
          <div className="text-xs font-bold uppercase text-gray-500 mb-4">{t('debugConsole')}</div>
          <div className="font-mono text-xs space-y-2 text-green-400">
              <div>{t('hwAccel')} <span className="text-white">{t('hwEnabled')}</span></div>
              <div>{t('frameTimeLabel')} <span className="text-white">{(1000/stats.fps).toFixed(2)}ms</span></div>
              <div>{t('heapUsage')} <span className="text-white">{Math.min(99, 50 + stats.wave * 3 + stats.bugsFixed % 20)} MB</span></div>
              <div className="h-px bg-gray-700 my-2"></div>
              <div>{t('dbgMaxCombo')} <span className="text-[#cca700]">{stats.maxCombo}</span></div>
              <div>{t('dbgLines')} <span className="text-[#ce9178]">{stats.linesOfCode}</span></div>
              <div>{t('dbgHighScore')} <span className="text-[#4ec9b0]">{formatNumber(highScore)}</span></div>
          </div>
      </div>
  );

  const renderExtensions = () => (
      <div className="px-4 py-2">
          <div className="text-xs font-bold uppercase text-gray-500 mb-4">{t('installedExt')}</div>
          <div className="space-y-3">
             <div className="flex items-start p-2 bg-[#333] rounded hover:bg-[#3c3c3c]">
                <div className="w-8 h-8 bg-[#007acc] flex items-center justify-center text-white rounded mr-3 mt-1">TS</div>
                <div>
                   <div className="text-sm font-bold text-white">{t('extTsTitle')}</div>
                   <div className="text-xs text-gray-400">v{stats.weaponLevel}.0.0</div>
                   <div className="text-[10px] text-gray-500 mt-1">{t('extTsDesc')}</div>
                </div>
             </div>

             <div className="flex items-start p-2 bg-[#333] rounded hover:bg-[#3c3c3c]">
                <div className="w-8 h-8 bg-[#e06c75] flex items-center justify-center text-white rounded mr-3 mt-1">GC</div>
                <div>
                   <div className="text-sm font-bold text-white">{t('extGcTitle')}</div>
                   <div className="text-xs text-gray-400">{t('extGcHeap')} {Math.round(stats.ammo)}/{stats.maxAmmo}</div>
                   <div className="text-[10px] text-gray-500 mt-1">{t('extGcDesc')}</div>
                </div>
             </div>

             <div className="flex items-start p-2 bg-[#333] rounded hover:bg-[#3c3c3c]">
                <div className="w-8 h-8 bg-[#0db7ed] flex items-center justify-center text-white rounded mr-3 mt-1">
                   <span className="text-lg">🐳</span>
                </div>
                <div>
                   <div className="text-sm font-bold text-white">{t('extDockerTitle')}</div>
                   <div className="text-xs text-gray-400">{stats.shieldActive ? t('extDockerRunning') : t('extDockerStopped')}</div>
                   <div className="text-[10px] text-gray-500 mt-1">{t('extDockerDesc')}</div>
                </div>
             </div>

             <div className="flex items-start p-2 bg-[#333] rounded hover:bg-[#3c3c3c]">
                <div className="w-8 h-8 bg-[#C586C0] flex items-center justify-center text-white rounded mr-3 mt-1">R</div>
                <div>
                   <div className="text-sm font-bold text-white">{t('extRefactorTitle')}</div>
                   <div className="text-xs text-gray-400">{t('extRefactorCharge')} {stats.specialCharge}%</div>
                   <div className="text-[10px] text-gray-500 mt-1">{t('extRefactorDesc')}</div>
                </div>
             </div>
          </div>
      </div>
  );

  const renderSettings = () => (
      <div className="px-4 py-2 space-y-4">
          <div className="text-xs font-bold uppercase text-gray-500 mb-4">{t('playerSettings')}</div>

          {/* Movement sensitivity */}
          <div className="border border-[#3c3c3c] bg-[#2a2d2e] rounded p-3 space-y-3">
              <div className="flex items-center justify-between text-sm">
                  <span className="text-white font-bold">{t('moveSensLabel')}</span>
                  <span className="text-[#4ec9b0] font-mono">{formatSensitivity(movementSensitivity)}</span>
              </div>
              <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={movementSensitivity}
                  onChange={(e) => setMovementSensitivity(Number(e.target.value))}
                  onKeyDown={(e) => {
                      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
                          e.preventDefault();
                      }
                  }}
                  onMouseUp={(e) => e.currentTarget.blur()}
                  onTouchEnd={(e) => e.currentTarget.blur()}
                  className="w-full accent-[#007acc] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>{t('sensSlowLabel')}</span>
                  <span>{t('sensDefaultLabel')}</span>
                  <span>{t('sensFastLabel')}</span>
              </div>
              <div className="text-xs text-gray-400 leading-relaxed">
                  {t('sensDesc')}
              </div>
          </div>

          {/* Sound toggle */}
          <div className="border border-[#3c3c3c] bg-[#2a2d2e] rounded p-3">
              <div className="flex items-center justify-between text-sm">
                  <span className="text-white font-bold">{t('soundLabel')}</span>
                  <button
                      onClick={handleSoundToggle}
                      className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                        soundMuted
                          ? 'bg-[#3c3c3c] text-gray-400 hover:bg-[#555] hover:text-white'
                          : 'bg-[#007acc] text-white hover:bg-[#1177bb]'
                      }`}
                  >
                      {soundMuted ? t('soundMutedLabel') : t('soundOnLabel')}
                  </button>
              </div>
              <div className="text-xs text-gray-400 mt-2 leading-relaxed">
                  {t('soundDesc')}
              </div>
          </div>

          {/* Language toggle */}
          <div className="border border-[#3c3c3c] bg-[#2a2d2e] rounded p-3">
              <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white font-bold">{t('languageLabel')}</span>
              </div>
              <div className="flex gap-2">
                  <button
                      onClick={() => handleLangChange('en')}
                      className={`flex-1 px-2 py-1 rounded text-xs font-mono font-bold transition-colors ${
                        lang === 'en'
                          ? 'bg-[#007acc] text-white'
                          : 'bg-[#3c3c3c] text-gray-400 hover:bg-[#555] hover:text-white'
                      }`}
                  >
                      {t('langEnBtn')}
                  </button>
                  <button
                      onClick={() => handleLangChange('zh')}
                      className={`flex-1 px-2 py-1 rounded text-xs font-mono font-bold transition-colors ${
                        lang === 'zh'
                          ? 'bg-[#007acc] text-white'
                          : 'bg-[#3c3c3c] text-gray-400 hover:bg-[#555] hover:text-white'
                      }`}
                  >
                      {t('langZhBtn')}
                  </button>
              </div>
          </div>
      </div>
  );

  const renderSidebarContent = () => (
    <>
      {sidebarView === 'EXPLORER'   && renderExplorer()}
      {sidebarView === 'SEARCH'     && renderSearch()}
      {sidebarView === 'GIT'        && renderGit()}
      {sidebarView === 'DEBUG'      && renderDebug()}
      {sidebarView === 'EXTENSIONS' && renderExtensions()}
      {sidebarView === 'SETTINGS'   && renderSettings()}
    </>
  );

  const renderEditorDocument = () => {
    if (activeDocument === 'ENEMIES') {
      return (
        <div className="h-full overflow-y-auto bg-[#1e1e1e] px-5 py-6 text-sm md:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 border-l-2 border-[#e06c75] pl-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[#e06c75]">{t('enemyFileEyebrow')}</div>
              <h2 className="mt-1 text-xl font-semibold text-white">{t('enemyFileTitle')}</h2>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-400">{t('enemyFileDesc')}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {ENEMY_TYPES.map((enemy, index) => (
                <article key={enemy.type} className="border border-[#3c3c3c] bg-[#252526] p-3">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <span className="mr-2 select-none text-gray-600">{String(index + 1).padStart(2, '0')}</span>
                      <span className="font-bold" style={{ color: enemy.color }}>{enemy.type}</span>
                    </div>
                    <span className="text-lg text-white">{enemy.text}</span>
                  </div>
                  <div className="mb-2 font-mono text-[11px] text-[#9cdcfe]">
                    HP <span className="text-[#b5cea8]">{enemy.hp}</span>
                    <span className="mx-2 text-gray-600">·</span>
                    PTS <span className="text-[#b5cea8]">{enemy.score}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">{t(enemy.descKey)}</p>
                </article>
              ))}
            </div>
            <button
              type="button"
              className="mt-6 bg-[#0e639c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1177bb]"
              onClick={() => openDocument('GAME')}
            >
              {t('returnToGame')}
            </button>
          </div>
        </div>
      );
    }

    if (activeDocument === 'METADATA') {
      const metadataRows = [
        [t('metadataVersion'), '3.2.0'],
        [t('metadataMode'), t('metadataModeValue')],
        [t('metadataWave'), `v${stats.wave}.0`],
        [t('metadataScore'), formatNumber(stats.score)],
        [t('metadataHighScore'), formatNumber(highScore)],
      ];
      return (
        <div className="h-full overflow-y-auto bg-[#1e1e1e] px-5 py-6 text-sm md:px-10">
          <div className="mx-auto max-w-3xl border border-[#3c3c3c] bg-[#252526]">
            <div className="border-b border-[#3c3c3c] px-5 py-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[#ce9178]">{t('metadataEyebrow')}</div>
              <h2 className="mt-1 text-xl font-semibold text-white">{t('metadataTitle')}</h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">{t('metadataDesc')}</p>
            </div>
            <dl className="divide-y divide-[#333333]">
              {metadataRows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[minmax(8rem,0.45fr)_1fr] gap-4 px-5 py-3">
                  <dt className="text-[#9cdcfe]">"{label}"</dt>
                  <dd className="break-words text-[#ce9178]">"{value}"</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-2 border-t border-[#3c3c3c] px-5 py-4">
              <button
                type="button"
                className="bg-[#0e639c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1177bb]"
                onClick={() => openDocument('GAME')}
              >
                {t('returnToGame')}
              </button>
              <button
                type="button"
                className="border border-[#5a5a5a] px-4 py-2 text-xs font-semibold text-gray-200 hover:border-[#9cdcfe] hover:text-white"
                onClick={() => handleSidebarSelect('SETTINGS')}
              >
                {t('openSettings')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeDocument === null) {
      return (
        <div className="flex h-full flex-col items-center justify-center bg-[#1e1e1e] p-6 text-center">
          <VscLogo className="mb-5 h-16 w-16 opacity-30" />
          <h2 className="text-lg font-semibold text-gray-300">{t('emptyEditorTitle')}</h2>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-gray-500">{t('emptyEditorDesc')}</p>
          <button
            type="button"
            className="mt-5 border border-[#5a5a5a] px-4 py-2 text-xs text-gray-200 hover:border-[#9cdcfe] hover:text-white"
            onClick={() => handleSidebarSelect('EXPLORER')}
          >
            {t('openExplorer')}
          </button>
        </div>
      );
    }

    return null;
  };

  const renderBottomPanelContent = () => {
    const problemCount = Math.max(0, 10 - stats.bugsFixed);

    if (activeBottomPanel === 'PROBLEMS') {
      return problemCount === 0 ? (
        <div className="flex h-full items-center px-4 text-[#4ec9b0]">✓ {t('problemsClear')}</div>
      ) : (
        <div className="space-y-1 p-2">
          <div className="flex items-start gap-2 border-b border-[#2d2d2d] px-2 py-1">
            <span className="text-[#cca700]">⚠</span>
            <div>
              <div className="text-gray-200">{t('problemsRemaining', { n: problemCount })}</div>
              <div className="text-[10px] text-gray-500">game_loop.ts · {t('problemsHint')}</div>
            </div>
          </div>
        </div>
      );
    }

    if (activeBottomPanel === 'DEBUG') {
      return (
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 p-3 sm:grid-cols-4">
          <div><span className="text-gray-500">FPS</span><div className="text-[#4ec9b0]">{stats.fps}</div></div>
          <div><span className="text-gray-500">{t('dbgMaxCombo')}</span><div className="text-[#dcdcaa]">{stats.maxCombo}x</div></div>
          <div><span className="text-gray-500">{t('extGcHeap')}</span><div className="text-[#9cdcfe]">{Math.round(stats.ammo)}/{stats.maxAmmo}</div></div>
          <div><span className="text-gray-500">{t('extRefactorCharge')}</span><div className="text-[#c586c0]">{stats.specialCharge}%</div></div>
        </div>
      );
    }

    if (activeBottomPanel === 'OUTPUT') {
      return (
        <div className="space-y-1 p-2">
          <div><span className="text-[#4ec9b0]">[game]</span> {t('outputRuntimeReady')}</div>
          <div><span className="text-[#569cd6]">[wave]</span> {t('outputWave', { wave: stats.wave })}</div>
          <div><span className="text-[#dcdcaa]">[stats]</span> {t('outputStats', { score: formatNumber(stats.score), bugs: stats.bugsFixed })}</div>
          <div><span className="text-[#c586c0]">[input]</span> {t('outputInput')}</div>
        </div>
      );
    }

    return (
      <>
        {terminalLogs.length === 0 && (
          <div className="mb-1 text-gray-500">{t('terminalIdle')}</div>
        )}
        {terminalLogs.map((log, i) => (
          <div key={`${log}-${i}`} className="mb-0.5">
            <span className="mr-2 text-green-500">➜</span>
            <span className="opacity-80">{log}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
        <div className="mt-1 animate-pulse text-[#007acc]">▍</div>
      </>
    );
  };

  return (
    <div className="relative flex h-screen w-screen select-none overflow-hidden font-mono text-[#cccccc]">
      {/* Activity Bar (Left) */}
      <div className="z-[80] flex w-12 shrink-0 flex-col items-center border-r border-[#252526] bg-[#333333] py-2 md:z-10 md:w-14">
        <VscLogo className="mb-6 mt-2 h-9 w-9 md:h-10 md:w-10" />
        <SidebarIcon active={sidebarView === 'EXPLORER'} onClick={() => handleSidebarSelect('EXPLORER')} title={t('ttExplorer')}>
            <FilesIcon />
        </SidebarIcon>
        <SidebarIcon active={sidebarView === 'SEARCH'} onClick={() => handleSidebarSelect('SEARCH')} title={t('ttSearch')}>
            <SearchIcon />
        </SidebarIcon>
        <SidebarIcon active={sidebarView === 'GIT'} onClick={() => handleSidebarSelect('GIT')} title={t('ttGit')}>
            <GitIcon />
        </SidebarIcon>
        <SidebarIcon active={sidebarView === 'DEBUG'} onClick={() => handleSidebarSelect('DEBUG')} title={t('ttDebug')}>
            <BugIcon />
        </SidebarIcon>
        <SidebarIcon active={sidebarView === 'EXTENSIONS'} onClick={() => handleSidebarSelect('EXTENSIONS')} title={t('ttExtensions')}>
            <ExtensionsIcon />
        </SidebarIcon>
        <SettingsIcon active={sidebarView === 'SETTINGS'} onClick={() => handleSidebarSelect('SETTINGS')} title={t('ttSettings')} />
      </div>

      {/* Sidebar */}
      {sidebarVisible && (
      <div className="relative hidden w-64 shrink-0 flex-col border-r border-[#1e1e1e] bg-[#252526] md:flex">
        <div className="flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            <span>{sidebarView}</span>
            <button
              type="button"
              className="px-1 text-lg leading-3 hover:text-white"
              aria-label={t('sidebarActions')}
              aria-expanded={sidebarMenuOpen}
              onClick={() => setSidebarMenuOpen(previous => !previous)}
            >
              ...
            </button>
        </div>
        {sidebarMenuOpen && (
          <div className="absolute right-2 top-9 z-40 min-w-44 border border-[#454545] bg-[#252526] py-1 text-xs font-normal normal-case tracking-normal text-gray-200 shadow-xl">
            <button
              type="button"
              className="block w-full px-3 py-2 text-left hover:bg-[#094771]"
              onClick={showCurrentPanelInfo}
            >
              {t('describePanel')}
            </button>
            <button
              type="button"
              className="block w-full px-3 py-2 text-left hover:bg-[#094771]"
              onClick={() => {
                setSidebarVisible(false);
                setSidebarMenuOpen(false);
                setWorkbenchNotice(t('noticeSidebarHidden'));
              }}
            >
              {t('closeSidebar')}
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#424242]">
            {renderSidebarContent()}
        </div>
      </div>
      )}

      {/* Small-screen sidebar drawer */}
      {mobileSidebarOpen && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-[60] bg-black/50 md:hidden"
            aria-label={t('closeSidebar')}
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="absolute bottom-6 left-12 top-0 z-[70] flex w-[min(18rem,calc(100vw-3rem))] flex-col border-r border-[#454545] bg-[#252526] shadow-2xl md:hidden">
            <div className="flex items-center justify-between border-b border-[#3c3c3c] px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">
              <span>{sidebarView}</span>
              <button
                type="button"
                className="px-2 py-1 text-lg leading-none text-gray-400 hover:text-white"
                aria-label={t('closeSidebar')}
                onClick={() => setMobileSidebarOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {renderSidebarContent()}
            </div>
          </aside>
        </>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e] relative min-w-0">
        {/* Tabs */}
        <div className="h-9 bg-[#252526] flex items-center overflow-x-auto border-b border-[#1e1e1e] shrink-0">
          {openDocuments.map(document => {
            const details = EDITOR_DOCUMENTS[document];
            const active = activeDocument === document;
            return (
              <div
                key={document}
                className={`group flex h-full min-w-fit items-center border-r border-[#1e1e1e] text-sm ${
                  active ? 'border-t border-t-[#007acc] bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#2a2d2e]'
                }`}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className="flex h-full items-center py-0 pl-4 pr-2"
                  onClick={() => openDocument(document)}
                >
                  <span className="mr-2" style={{ color: details.color }}>{details.icon}</span>
                  {details.label}
                </button>
                <button
                  type="button"
                  className="mr-2 px-1 text-gray-500 opacity-60 hover:bg-[#3c3c3c] hover:text-white group-hover:opacity-100"
                  aria-label={t('closeDocument', { name: details.label })}
                  onClick={() => closeDocument(document)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {/* Breadcrumbs */}
        <div className="h-6 flex items-center px-4 text-xs text-gray-500 bg-[#1e1e1e] border-b border-[#1e1e1e] shrink-0">
          {activeDocument === 'GAME' && <>src &gt; components &gt; game &gt; <span className="ml-1 flex items-center text-[#dcdcaa]"><span className="mr-1 text-purple-400">def</span> render()</span></>}
          {activeDocument === 'ENEMIES' && <>src &gt; data &gt; <span className="ml-1 text-[#e06c75]">enemies.json</span></>}
          {activeDocument === 'METADATA' && <>project &gt; <span className="ml-1 text-[#e06c75]">metadata.json</span></>}
          {activeDocument === null && <span>{t('noOpenEditors')}</span>}
        </div>

        {/* Game Canvas Container */}
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[#1e1e1e]">
          <div className={`absolute inset-0 items-center justify-center ${activeDocument === 'GAME' ? 'flex' : 'hidden'}`}>
            <GameEngine
              gameState={gameState}
              setGameState={setGameState}
              onStatsUpdate={setStats}
              pendingUpgrade={pendingUpgrade}
              onUpgradeConsumed={handleUpgradeConsumed}
              movementSensitivity={movementSensitivity}
              restartToken={restartToken}
            />

            {/* Start Screen Overlay */}
            {gameState === GameState.START && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-[#1e1e1e]/95 p-4">
                 <div className="mb-3 transform transition-transform duration-500 hover:scale-110 md:mb-8">
                    <VscLogo className="h-16 w-16 md:h-24 md:w-24" />
                 </div>
                 <h1 className="mb-2 text-center font-sans text-2xl font-bold tracking-tight text-[#007acc] md:text-4xl">{t('appTitle')}</h1>
                 <p className="text-[#ce9178] mb-2 font-mono text-sm">{t('appVersion')}</p>

                 {/* Language toggle on start screen */}
                 <div className="flex gap-2 mb-4">
                   <button
                     onClick={() => handleLangChange('en')}
                     className={`px-3 py-1 rounded text-xs font-mono transition-colors ${lang === 'en' ? 'bg-[#007acc] text-white' : 'bg-[#3c3c3c] text-gray-400 hover:text-white'}`}
                   >{t('langEnBtn')}</button>
                   <button
                     onClick={() => handleLangChange('zh')}
                     className={`px-3 py-1 rounded text-xs font-mono transition-colors ${lang === 'zh' ? 'bg-[#007acc] text-white' : 'bg-[#3c3c3c] text-gray-400 hover:text-white'}`}
                   >{t('langZhBtn')}</button>
                 </div>

                 {/* High score display */}
                 {highScore > 0 && (
                   <div className="mb-6 font-mono text-sm text-center">
                     <span className="text-gray-500">{t('bestLabel')}: </span>
                     <span className="text-[#4ec9b0] font-bold">{formatNumber(highScore)}</span>
                   </div>
                 )}

                 <div className="mb-5 grid max-w-2xl grid-cols-1 gap-3 text-sm text-gray-400 sm:grid-cols-2 sm:gap-12 md:mb-8">
                    <div className="border-b border-gray-600 pb-3 text-left sm:border-b-0 sm:border-r sm:pr-8 sm:text-right">
                        <h3 className="font-bold text-white mb-2 text-lg">{t('controlsTitle')}</h3>
                        <p className="mb-1"><span className="text-[#569cd6]">WASD</span> : {t('ctrlMove')}</p>
                        <p className="mb-1"><span className="text-[#4ec9b0]">{t('ctrlSens')}</span> : {formatSensitivity(movementSensitivity)}</p>
                        <p className="mb-1"><span className="text-[#569cd6]">SPACE</span> : {t('ctrlShoot')}</p>
                        <p className="mb-1"><span className="text-[#4ec9b0]">SHIFT / R</span> : {t('ctrlRefactor')}</p>
                        <p className="mb-1"><span className="text-gray-500">ESC</span> : {t('ctrlPause')}</p>
                    </div>
                    <div className="sm:pl-4">
                        <h3 className="font-bold text-white mb-2 text-lg">{t('featuresTitle')}</h3>
                        <p className="mb-1">🧩 <span className="text-[#dcdcaa]">{t('feat1')}</span></p>
                        <p className="mb-1">🗺️ <span className="text-[#ce9178]">{t('feat2')}</span></p>
                        <p className="mb-1">⚡ <span className="text-[#007acc]">{t('feat3')}</span></p>
                        <p className="mb-1">🩹 <span className="text-[#81b88b]">{t('feat4')}</span></p>
                        <p className="mb-1">📦 <span className="text-[#C586C0]">{t('feat5')}</span></p>
                    </div>
                 </div>

                 <button
                   onClick={startFreshRun}
                   className="px-8 py-3 bg-[#0e639c] hover:bg-[#1177bb] text-white font-semibold rounded-sm shadow-lg transition-colors"
                 >
                   {t('startBtn')}
                 </button>
              </div>
            )}

            {/* Game Over Overlay */}
            {gameState === GameState.GAME_OVER && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-[#750e0e]/95 p-4 animate-in fade-in duration-300">
                 <h1 className="mb-2 text-center text-4xl font-bold text-white md:text-6xl">{t('buildFailed')}</h1>
                 <p className="text-red-200 mb-8 font-mono text-xl">
                    <span className="text-gray-400">{t('exitCode')}</span> 1
                 </p>

                 <div className="mb-5 w-full max-w-2xl rounded-md border border-red-500 bg-[#1e1e1e] p-4 font-mono text-xs shadow-2xl md:mb-8 md:w-3/4 md:p-6">
                    <p className="text-red-400 mb-2">{t('errorAt', { wave: stats.wave })}</p>
                    <p className="text-gray-400 pl-4">at Player.collision (GameEngine.tsx:404)</p>
                    <p className="text-gray-400 pl-4">at Entity.die (Entity.ts:23)</p>
                    <div className="mt-4 border-t border-gray-700 pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-right text-gray-400">{t('finalScore')}</div>
                            <div className="text-[#ce9178] font-bold">{formatNumber(stats.score)}</div>

                            <div className="text-right text-gray-400">{t('highScore')}</div>
                            <div className={`font-bold ${newRecord ? 'text-[#4ec9b0]' : 'text-gray-300'}`}>
                              {formatNumber(highScore)}
                              {newRecord && <span className="ml-2 text-[10px] bg-[#4ec9b0]/20 border border-[#4ec9b0] px-1 py-0.5 rounded animate-pulse">{t('newRecord')}</span>}
                            </div>

                            <div className="text-right text-gray-400">{t('maxCombo')}</div>
                            <div className="text-[#dcdcaa] font-bold">{stats.maxCombo}x</div>

                            <div className="text-right text-gray-400">{t('bugsFixed')}</div>
                            <div className="text-[#b5cea8] font-bold">{stats.bugsFixed}</div>
                        </div>
                    </div>
                 </div>

                 <button
                   onClick={startFreshRun}
                   className="px-6 py-3 bg-[#28a745] hover:bg-[#2fb950] text-white font-semibold rounded-sm shadow-lg"
                 >
                   {t('restartBtn')}
                 </button>
              </div>
            )}

            {/* Wave Upgrade Overlay */}
            {gameState === GameState.UPGRADE && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-black/80 p-4">
                 <div className="text-center mb-6">
                   <div className="text-[#4ec9b0] text-xs font-mono mb-1 uppercase tracking-widest">{t('waveDeployed', { wave: stats.wave - 1 })}</div>
                   <h2 className="text-3xl font-bold text-white mb-1">{t('chooseUpgrade')}</h2>
                   <p className="text-gray-400 text-sm font-mono">{t('upgradeSubtitle')}</p>
                 </div>

                 <div className="flex w-full max-w-3xl flex-col gap-3 px-2 sm:flex-row sm:gap-4 sm:px-6">
                   {stats.pendingUpgrades.map((opt: UpgradeOption) => (
                     <button
                       key={opt.id}
                       onClick={() => handleSelectUpgrade(opt.id)}
                       className="flex-1 border border-[#3c3c3c] bg-[#252526] hover:bg-[#2a2d2e] hover:border-[#007acc] rounded p-4 text-left transition-all group"
                     >
                       <div className="text-3xl mb-3">{opt.icon}</div>
                       <div className="text-[#007acc] font-bold text-sm mb-1 group-hover:text-white transition-colors">{tUpgrade(opt.id, 'title')}</div>
                       <div className="text-gray-400 text-xs leading-relaxed">{tUpgrade(opt.id, 'desc')}</div>
                     </button>
                   ))}
                 </div>

                 <p className="mt-6 text-gray-600 text-xs font-mono">{t('clickToConfirm')}</p>
               </div>
             )}
          </div>
          {activeDocument !== 'GAME' && renderEditorDocument()}
        </div>

        {/* Terminal / Bottom Panel */}
        <div className="hidden h-40 shrink-0 flex-col border-t border-[#414141] bg-[#1e1e1e] md:flex">
          <div className="flex text-xs px-4 py-2 border-b border-[#414141] bg-[#1e1e1e]">
            {([
              ['PROBLEMS', t('termProblems')],
              ['TERMINAL', t('termTerminal')],
              ['DEBUG', t('termDebug')],
              ['OUTPUT', t('termOutput')],
            ] as const).map(([panel, label]) => (
              <button
                type="button"
                key={panel}
                className={`mr-6 -mb-2 pb-2 text-[10px] uppercase tracking-wide hover:text-white ${
                  activeBottomPanel === panel ? 'border-b border-[#007acc] text-[#007acc]' : 'text-gray-400'
                }`}
                onClick={() => openBottomPanel(panel)}
              >
                {label}
                {panel === 'PROBLEMS' && (
                  <span className="ml-1 rounded-full bg-[#252526] px-2 py-0.5 text-[10px]">{Math.max(0, 10 - stats.bugsFixed)}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex-1 p-2 font-mono text-xs overflow-y-auto text-gray-300 scrollbar-thin scrollbar-thumb-gray-700">
             {renderBottomPanelContent()}
          </div>
        </div>
      </div>

      {workbenchNotice && (
        <div
          className="absolute bottom-9 right-3 z-[90] w-[min(22rem,calc(100vw-4rem))] border border-[#007acc] bg-[#252526] p-3 text-xs text-gray-200 shadow-2xl"
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-1 font-semibold text-[#9cdcfe]">{t('noticeTitle')}</div>
              <p className="leading-relaxed text-gray-300">{workbenchNotice}</p>
            </div>
            <button
              type="button"
              className="px-1 text-lg leading-none text-gray-500 hover:text-white"
              aria-label={t('dismissNotice')}
              onClick={() => setWorkbenchNotice(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#007acc] text-white flex items-center text-xs px-3 justify-between z-50 cursor-default">
        <div className="flex items-center gap-4">
          <button type="button" className="flex items-center rounded px-1 hover:bg-white/20" title={t('statusErrors')} onClick={() => openBottomPanel('PROBLEMS')}><span className="mr-1">⊗</span> 0</button>
          <button type="button" className="flex items-center rounded px-1 hover:bg-white/20" title={t('statusWarnings')} onClick={() => openBottomPanel('PROBLEMS')}><span className="mr-1">⚠</span> {Math.max(0, 10 - stats.bugsFixed)}</button>
          <button type="button" className="flex items-center rounded px-1 hover:bg-white/20" title={t('statusBranch')} onClick={() => handleSidebarSelect('GIT')}>main*</button>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="hidden rounded px-1 hover:bg-white/20 sm:inline"
            title={t('statusPosition')}
            onClick={() => setWorkbenchNotice(t('noticePosition', { lines: stats.linesOfCode, bugs: stats.bugsFixed }))}
          >
            Ln {stats.linesOfCode}, Col {stats.bugsFixed}
          </button>
          <button type="button" className="hidden rounded px-1 hover:bg-white/20 lg:inline" title={t('statusMovement')} onClick={() => handleSidebarSelect('SETTINGS')}>Move {formatSensitivity(movementSensitivity)}</button>
          <button type="button" className="hidden rounded px-1 hover:bg-white/20 lg:inline" title={t('statusHeap')} onClick={() => handleSidebarSelect('DEBUG')}>Heap: {Math.min(99, 50 + stats.wave * 3 + stats.bugsFixed % 20)}MB</button>
          <button
            type="button"
            className="hidden rounded px-1 hover:bg-white/20 sm:inline"
            title={t('statusEncoding')}
            onClick={() => setWorkbenchNotice(t('noticeEncoding'))}
          >
            UTF-8
          </button>
          <button type="button" className="rounded px-1 hover:bg-white/20" title={t('statusFps')} onClick={() => openBottomPanel('DEBUG')}>{stats.fps} FPS</button>
          <button
            type="button"
            className="flex items-center px-1 hover:bg-white/20"
            onClick={() => handleSidebarSelect('SETTINGS')}
            title={t('statusLang')}
          >
             🌐 {lang.toUpperCase()}
          </button>
          <button
            type="button"
            className="flex items-center px-1 hover:bg-white/20"
            onClick={handleSoundToggle}
            title={soundMuted ? t('statusUnmute') : t('statusMute')}
          >
             <span className="mr-1" aria-hidden="true">{soundMuted ? '🔇' : '🔔'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
