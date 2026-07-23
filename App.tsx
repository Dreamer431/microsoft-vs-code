
import React, { useState, useEffect, useRef } from 'react';
import GameEngine from './components/GameEngine';
import { GameState, GameStats, SidebarView, UpgradeId, UpgradeOption } from './types';
import { ENEMY_TYPES, COMBO_TIMER_MAX } from './constants';
import { resumeAudio, setMuted, isMuted } from './utils/audio';
import { getLang, setLang, t, tUpgrade, Lang } from './utils/i18n';
import { createInitialGameStats } from './utils/gameState';
import vscodeLogo from './vscode.png';

const HIGH_SCORE_KEY = 'VSCODE_GAME_HIGHSCORE';

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
  const [movementSensitivity, setMovementSensitivity] = useState(1);
  const [restartToken, setRestartToken] = useState(0);
  const [stats, setStats] = useState<GameStats>(() => createInitialGameStats());
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
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
    setMobileSidebarOpen(previous => sidebarView === view ? !previous : true);
    setSidebarView(view);
  };

  // ── Sidebar renderers ────────────────────────────────────────────────────

  const renderExplorer = () => (
    <>
      <div className="px-2">
          <div className="flex items-center px-2 py-1 bg-[#37373d] text-white text-xs font-bold cursor-pointer">
             <span className="mr-2">▼</span> VSCODE-GAME
          </div>
          <div className="pl-4 mt-1 text-sm font-mono text-[#569cd6]">
            <div className="py-1 flex items-center hover:bg-[#2a2d2e] cursor-pointer"><span className="text-[#cca700] mr-2">TS</span> GameEngine.tsx</div>
            <div className="py-1 flex items-center hover:bg-[#2a2d2e] cursor-pointer"><span className="text-[#cca700] mr-2">TS</span> Enemies.ts</div>
            <div className="py-1 flex items-center hover:bg-[#2a2d2e] cursor-pointer"><span className="text-[#e06c75] mr-2">JSON</span> metadata.json</div>
          </div>

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
      <div className="w-64 bg-[#252526] flex flex-col border-r border-[#1e1e1e] hidden md:flex shrink-0">
        <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 flex justify-between items-center">
            <span>{sidebarView}</span>
            <span className="text-lg leading-3 cursor-pointer hover:text-white">...</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#424242]">
            {renderSidebarContent()}
        </div>
      </div>

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
          <div className="px-4 h-full bg-[#1e1e1e] flex items-center text-sm border-t border-[#007acc] text-white min-w-fit pr-8 relative group">
            <span className="text-[#cca700] mr-2">TS</span> game_loop.ts <span className="ml-3 text-gray-400 hover:text-white cursor-pointer opacity-0 group-hover:opacity-100">×</span>
          </div>
          <div className="px-4 h-full bg-[#2d2d2d] flex items-center text-sm text-gray-400 min-w-fit pr-8 border-r border-[#1e1e1e] hover:bg-[#2a2d2e] cursor-pointer">
            <span className="text-[#e06c75] mr-2">JSON</span> enemies.json
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="h-6 flex items-center px-4 text-xs text-gray-500 bg-[#1e1e1e] border-b border-[#1e1e1e] shrink-0">
          src &gt; components &gt; game &gt; <span className="ml-1 text-[#dcdcaa] flex items-center"><span className="text-purple-400 mr-1">def</span> render()</span>
        </div>

        {/* Game Canvas Container */}
        <div className="flex-1 relative flex justify-center items-center bg-[#1e1e1e] overflow-hidden min-h-0">
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

        {/* Terminal / Bottom Panel */}
        <div className="hidden h-40 shrink-0 flex-col border-t border-[#414141] bg-[#1e1e1e] md:flex">
          <div className="flex text-xs px-4 py-2 border-b border-[#414141] bg-[#1e1e1e]">
            <span className="mr-6 cursor-pointer hover:text-white uppercase text-[10px] tracking-wide">{t('termProblems')} <span className="bg-[#252526] rounded-full px-2 py-0.5 text-[10px] ml-1">{Math.max(0, 10 - stats.bugsFixed)}</span></span>
            <span className="mr-6 cursor-pointer hover:text-white text-[#007acc] border-b border-[#007acc] pb-2 -mb-2 uppercase text-[10px] tracking-wide">{t('termTerminal')}</span>
            <span className="mr-6 cursor-pointer hover:text-white uppercase text-[10px] tracking-wide">{t('termDebug')}</span>
            <span className="mr-6 cursor-pointer hover:text-white uppercase text-[10px] tracking-wide">{t('termOutput')}</span>
          </div>
          <div className="flex-1 p-2 font-mono text-xs overflow-y-auto text-gray-300 scrollbar-thin scrollbar-thumb-gray-700">
             {terminalLogs.map((log, i) => (
                 <div key={i} className="mb-0.5">
                     <span className="text-green-500 mr-2">➜</span>
                     <span className="opacity-80">{log}</span>
                 </div>
             ))}
             <div ref={logsEndRef} />
             <div className="mt-1 animate-pulse text-[#007acc]">▍</div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#007acc] text-white flex items-center text-xs px-3 justify-between z-50 cursor-default">
        <div className="flex items-center gap-4">
          <span className="flex items-center hover:bg-white/20 px-1 rounded"><span className="mr-1">⊗</span> 0</span>
          <span className="flex items-center hover:bg-white/20 px-1 rounded"><span className="mr-1">⚠</span> 0</span>
          <span className="hover:bg-white/20 px-1 rounded flex items-center"><span className="mr-1 text-[10px]"></span> main*</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden rounded px-1 hover:bg-white/20 sm:inline">Ln {stats.linesOfCode}, Col {stats.bugsFixed}</span>
          <span className="hidden rounded px-1 hover:bg-white/20 lg:inline">Move {formatSensitivity(movementSensitivity)}</span>
          <span className="hidden rounded px-1 hover:bg-white/20 lg:inline">Heap: 100MB</span>
          <span className="hidden rounded px-1 hover:bg-white/20 sm:inline">UTF-8</span>
          <span className="hover:bg-white/20 px-1 rounded">{stats.fps} FPS</span>
          <span
            className="flex items-center hover:bg-white/20 px-1 cursor-pointer"
            onClick={() => handleSidebarSelect('SETTINGS')}
            title={t('statusLang')}
          >
             <span>🌐 {lang.toUpperCase()}</span>
          </span>
          <span
            className="flex items-center hover:bg-white/20 px-1 cursor-pointer"
            onClick={handleSoundToggle}
            title={soundMuted ? t('statusUnmute') : t('statusMute')}
          >
             <span className="mr-1">{soundMuted ? '🔇' : '🔔'}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
