
import React, { useEffect, useRef, useCallback } from 'react';
import { GameState, Player, Projectile, Enemy, Particle, GameStats, PowerUp, FloatingText, EnemyProjectile, UpgradeId } from '../types';
import { COLORS, CANVAS_WIDTH, CANVAS_HEIGHT, BACKGROUND_STRINGS } from '../constants';
import { sfxBossAppear } from '../utils/audio';
import { t } from '../utils/i18n';
import { FRAME_DURATION, getFrameScale } from '../utils/gameLogic';
import { createInitialGameStats, createInitialPlayer } from '../utils/gameState';
import { renderPausedFrame, renderScene, renderStartFrame } from '../game/renderScene';
import type { BackgroundParticle } from '../game/renderScene';
import { setControlPressed, useGameInput } from '../game/useGameInput';
import { updateEnemy } from '../game/updateEnemy';
import type { EnemySpawnType } from '../game/contentSelection';
import {
  createBoss,
  createEnemy,
  createExplosionParticles,
  createFloatingText,
} from '../game/entityFactory';
import {
  advanceEnemyProjectiles,
  advanceFloatingTexts,
  advanceParticles,
  advancePlayerProjectiles,
} from '../game/advanceEntities';
import { resolveCombat } from '../game/combat';
import { updatePlayerSystem } from '../game/playerSystem';
import { applyUpgrade } from '../game/upgrades';
import { resolveEnemyDefeat } from '../game/progression';
import { activateRefactorUltimate } from '../game/refactorUltimate';
import TouchControls, { TouchControlCode } from './TouchControls';

interface GameEngineProps {
  gameState: GameState;
  setGameState: (state: React.SetStateAction<GameState>) => void;
  onStatsUpdate: (stats: GameStats) => void;
  /** Id of the upgrade the player chose. GameEngine consumes it and calls onUpgradeConsumed. */
  pendingUpgrade: UpgradeId | null;
  onUpgradeConsumed: () => void;
  movementSensitivity: number;
  restartToken: number;
}

const GameEngine: React.FC<GameEngineProps> = ({
  gameState,
  setGameState,
  onStatsUpdate,
  pendingUpgrade,
  onUpgradeConsumed,
  movementSensitivity,
  restartToken
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Player state ──────────────────────────────────────────────────────────
  const playerRef = useRef<Player>(createInitialPlayer());

  // Permanent per-run modifiers from wave upgrades
  const overclockRef = useRef(false);   // OVERCLOCK: fire rate 150→80ms
  const fastGcRef = useRef(false);       // RELOAD: 30% shorter reload

  // ── Entity arrays ─────────────────────────────────────────────────────────
  const projectilesRef = useRef<Projectile[]>([]);
  const enemyProjectilesRef = useRef<EnemyProjectile[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const bgParticlesRef = useRef<BackgroundParticle[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const shakeRef = useRef<number>(0);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const statsRef = useRef<GameStats>(createInitialGameStats(t('logInit')));

  const lastFireTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const frameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastStatsSyncTimeRef = useRef<number>(0);
  const lastRestartTokenRef = useRef<number>(restartToken);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const syncStatsToUI = useCallback(() => {
    const player = playerRef.current;
    onStatsUpdate({
      ...statsRef.current,
      weaponLevel: player.weaponLevel,
      ammo: player.ammo,
      maxAmmo: player.maxAmmo,
      specialCharge: player.specialCharge,
      shieldActive: player.shield > 0
    });
  }, [onStatsUpdate]);

  const triggerGameOver = useCallback(() => {
    syncStatsToUI();
    setGameState(GameState.GAME_OVER);
  }, [syncStatsToUI, setGameState]);

  const createExplosion = (x: number, y: number, color: string, count: number) => {
    particlesRef.current.push(...createExplosionParticles(x, y, color, count));
  };

  const addFloatingText = (x: number, y: number, text: string, color: string, vy = -1) => {
    floatingTextsRef.current.push(createFloatingText(x, y, text, color, vy));
  };

  // ── Apply upgrade (called when pendingUpgrade prop fires) ─────────────────
  useEffect(() => {
    if (!pendingUpgrade) return;
    const modifiers = applyUpgrade(
      pendingUpgrade,
      playerRef.current,
      {
        fastGc: fastGcRef.current,
        overclock: overclockRef.current,
      },
      addFloatingText,
    );
    fastGcRef.current = modifiers.fastGc;
    overclockRef.current = modifiers.overclock;

    statsRef.current.pendingUpgrades = [];
    syncStatsToUI();
    onUpgradeConsumed();
    setGameState(GameState.PLAYING);
  }, [pendingUpgrade]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Spawn helpers ─────────────────────────────────────────────────────────
  const spawnEnemy = (type: EnemySpawnType, x?: number, y?: number, scaleHP = 1) => {
      enemiesRef.current.push(createEnemy(type, statsRef.current.wave, {
        x,
        y,
        hpScale: scaleHP,
      }));
  };

  const spawnBoss = () => {
      enemiesRef.current.push(createBoss(statsRef.current.wave));
      statsRef.current.bossActive = true;
      statsRef.current.lastLog = t('logBoss');
      addFloatingText(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, t('bossApproaching'), COLORS.error);
      shakeRef.current = 20;
      sfxBossAppear();
  };

  const handleEnemyDefeat = (enemy: Enemy) => {
      const result = resolveEnemyDefeat(enemy, {
        player: playerRef.current,
        stats: statsRef.current,
        spawnEnemy,
        createExplosion,
        addFloatingText,
      });
      if (!result.defeated) return;

      if (result.clearEnemyProjectiles) {
          enemyProjectilesRef.current = [];
      }
      if (result.droppedPowerUp) {
          powerUpsRef.current.push(result.droppedPowerUp);
      }
      if (result.shake > 0) {
          shakeRef.current = result.shake;
      }
      if (result.upgradeChoices.length > 0) {
          statsRef.current.pendingUpgrades = result.upgradeChoices;
          syncStatsToUI();
          setGameState(GameState.UPGRADE);
      }
  };

  const triggerRefactorUltimate = () => {
      const result = activateRefactorUltimate({
          player: playerRef.current,
          stats: statsRef.current,
          enemies: enemiesRef.current,
          createExplosion,
          addFloatingText,
          onActivate: () => {
              shakeRef.current = 30;
              enemyProjectilesRef.current = [];
          },
          handleEnemyDefeat,
      });
      if (!result.activated) return;
      if (result.particle) particlesRef.current.push(result.particle);
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    overclockRef.current = false;
    fastGcRef.current = false;

    playerRef.current = createInitialPlayer();
    projectilesRef.current = [];
    enemyProjectilesRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    powerUpsRef.current = [];
    floatingTextsRef.current = [];
    shakeRef.current = 0;
    keysRef.current.clear();
    statsRef.current = createInitialGameStats(t('logNewSession'));
    lastFireTimeRef.current = 0;
    lastSpawnTimeRef.current = performance.now();
    lastTimeRef.current = performance.now();
    lastStatsSyncTimeRef.current = 0;
    syncStatsToUI();
  }, [syncStatsToUI]);

  // ── Input setup ───────────────────────────────────────────────────────────
  useGameInput(keysRef, setGameState);

  useEffect(() => {
    bgParticlesRef.current = Array.from({ length: 20 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      text: BACKGROUND_STRINGS[Math.floor(Math.random() * BACKGROUND_STRINGS.length)],
      opacity: Math.random() * 0.1 + 0.02,
      speed: Math.random() * 1 + 0.5,
    }));
  }, []);

  // ── Game Loop ─────────────────────────────────────────────────────────────
  const gameLoop = useCallback((timestamp: number) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // ─ Paused / Upgrade: freeze logic, dim frame, keep rAF alive ─
    if (gameState === GameState.PAUSED || gameState === GameState.UPGRADE) {
        // BUG FIX #5: Keep lastTimeRef in sync so the first active frame
        // doesn't inherit a large deltaTime spike from the idle period.
        lastTimeRef.current = timestamp;

        renderPausedFrame(ctx, gameState === GameState.PAUSED);
        frameIdRef.current = requestAnimationFrame(gameLoop);
        return;
    }

    if (gameState !== GameState.PLAYING) {
        if (gameState === GameState.START) {
          renderStartFrame(ctx, bgParticlesRef.current);
          frameIdRef.current = requestAnimationFrame(gameLoop);
        }
        return;
    }

    // ─ Active frame ─
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    const frameScale = getFrameScale(deltaTime);
    statsRef.current.fps = Math.round(1000 / (deltaTime || FRAME_DURATION));

    const player = playerRef.current;

    // 1. Background
    bgParticlesRef.current.forEach(p => {
        p.y += (p.speed + (player.speedBuff > 0 ? 4 : 0)) * frameScale;
        if (p.y > CANVAS_HEIGHT) {
            p.y = -20;
            p.x = Math.random() * CANVAS_WIDTH;
            p.text = BACKGROUND_STRINGS[Math.floor(Math.random() * BACKGROUND_STRINGS.length)];
        }
    });

    // 2-4. Player movement, timers, reload, ultimate, and shooting
    const playerResult = updatePlayerSystem({
      player,
      stats: statsRef.current,
      keys: keysRef.current,
      frameScale,
      timestamp,
      lastFireTime: lastFireTimeRef.current,
      movementSensitivity,
      fastGc: fastGcRef.current,
      overclock: overclockRef.current,
      addFloatingText,
      triggerUltimate: triggerRefactorUltimate,
    });
    lastFireTimeRef.current = playerResult.lastFireTime;
    projectilesRef.current.push(...playerResult.projectiles);

    // 5. Boss / Enemy spawning
    if (!statsRef.current.bossActive && statsRef.current.levelProgress >= statsRef.current.levelTarget) {
        spawnBoss();
    }

    const spawnRate = Math.max(300, 1200 - statsRef.current.wave * 100);
    if (timestamp - lastSpawnTimeRef.current > spawnRate && !statsRef.current.bossActive) {
        spawnEnemy('RANDOM');
        lastSpawnTimeRef.current = timestamp;
    }

    // 6. Move projectiles
    projectilesRef.current = advancePlayerProjectiles(projectilesRef.current, frameScale);
    enemyProjectilesRef.current = advanceEnemyProjectiles(enemyProjectilesRef.current, frameScale);

    // 7. Move enemies & AI
    enemiesRef.current.forEach(enemy => {
      updateEnemy(enemy, {
        player,
        frameScale,
        enemyProjectiles: enemyProjectilesRef.current,
        spawnEnemy,
        createExplosion,
      });
    });

    const combatResult = resolveCombat({
      frameScale,
      player,
      stats: statsRef.current,
      enemies: enemiesRef.current,
      projectiles: projectilesRef.current,
      enemyProjectiles: enemyProjectilesRef.current,
      powerUps: powerUpsRef.current,
      addFloatingText,
      createExplosion,
      handleEnemyDefeat,
      triggerGameOver,
    });
    enemiesRef.current = combatResult.enemies;
    projectilesRef.current = combatResult.projectiles;
    powerUpsRef.current = combatResult.powerUps;
    if (combatResult.shake > 0) shakeRef.current = combatResult.shake;

    particlesRef.current = advanceParticles(particlesRef.current, frameScale);
    floatingTextsRef.current = advanceFloatingTexts(floatingTextsRef.current, frameScale);

    // Throttled stats sync
    if (timestamp - lastStatsSyncTimeRef.current >= 100) {
        lastStatsSyncTimeRef.current = timestamp;
        syncStatsToUI();
    }

    // ── RENDER ──────────────────────────────────────────────────────────────
    shakeRef.current = renderScene({
      ctx,
      timestamp,
      frameScale,
      player,
      stats: statsRef.current,
      backgroundParticles: bgParticlesRef.current,
      enemyProjectiles: enemyProjectilesRef.current,
      enemies: enemiesRef.current,
      projectiles: projectilesRef.current,
      powerUps: powerUpsRef.current,
      particles: particlesRef.current,
      floatingTexts: floatingTextsRef.current,
      shake: shakeRef.current,
    });

    frameIdRef.current = requestAnimationFrame(gameLoop);
  // Engine helpers mutate refs only. Adding their render-local identities here would
  // restart the animation loop every time the throttled stats UI re-renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, movementSensitivity, onStatsUpdate, setGameState, syncStatsToUI, triggerGameOver]);

  useEffect(() => {
    const shouldReset = gameState === GameState.START || restartToken !== lastRestartTokenRef.current;
    if (shouldReset) {
      resetGame();
      lastRestartTokenRef.current = restartToken;
    }
    frameIdRef.current = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(frameIdRef.current);
  }, [gameState, gameLoop, resetGame, restartToken]);

  const handleTouchControl = useCallback((code: TouchControlCode, pressed: boolean) => {
    setControlPressed(keysRef, code, pressed);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        role="img"
        aria-label={t('gameCanvasLabel')}
        className="cursor-none border border-[#333] shadow-2xl shadow-black"
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      />
      {gameState === GameState.PLAYING && (
        <TouchControls onControlChange={handleTouchControl} />
      )}
    </>
  );
};

export default GameEngine;
