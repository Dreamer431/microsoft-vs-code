
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Player, Projectile, Enemy, Particle, GameStats, PowerUp, FloatingText, EnemyType, EnemyProjectile, UpgradeOption } from '../types';
import { COLORS, CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SPEED, PLAYER_BOOST_SPEED, ENEMY_TYPES, POWER_UPS, PARTICLE_CHARS, MAX_AMMO, AMMO_REGEN, RELOAD_TIME, BACKGROUND_STRINGS, SPECIAL_CHARGE_PER_KILL, COMBO_TIMER_MAX, MAX_SPECIAL_CHARGE, UPGRADE_OPTIONS } from '../constants';
import { sfxShoot, sfxHit, sfxExplosion, sfxPowerUp, sfxHeal, sfxBossAppear, sfxUltimate, sfxPlayerHit, sfxWaveClear } from '../utils/audio';
import { t } from '../utils/i18n';

interface GameEngineProps {
  gameState: GameState;
  setGameState: (state: React.SetStateAction<GameState>) => void;
  onStatsUpdate: (stats: GameStats) => void;
  /** Id of the upgrade the player chose. GameEngine consumes it and calls onUpgradeConsumed. */
  pendingUpgrade: string | null;
  onUpgradeConsumed: () => void;
  movementSensitivity: number;
  restartToken: number;
}

interface BackgroundParticle {
    x: number;
    y: number;
    text: string;
    opacity: number;
    speed: number;
}

const shouldIgnoreKeyboardEvent = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return (
    target.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    tagName === 'BUTTON'
  );
};

const FRAME_DURATION = 1000 / 60;
const MAX_FRAME_SCALE = 2.5;

const getFrameScale = (deltaTime: number) => {
  if (!Number.isFinite(deltaTime) || deltaTime <= 0) return 1;
  return Math.min(MAX_FRAME_SCALE, deltaTime / FRAME_DURATION);
};

const crossedFrameInterval = (previousAge: number, currentAge: number, interval: number) =>
  Math.floor(previousAge / interval) !== Math.floor(currentAge / interval);

// Pick N distinct upgrade options at random from the pool
const pickUpgradeChoices = (count = 3): UpgradeOption[] => {
  const pool = [...UPGRADE_OPTIONS] as UpgradeOption[];
  const result: UpgradeOption[] = [];
  while (result.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
};

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
  const [mounted, setMounted] = useState(false);

  // ── Player state ──────────────────────────────────────────────────────────
  const playerRef = useRef<Player>({
    id: 'player',
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 60,
    width: 40,
    height: 40,
    vx: 0,
    vy: 0,
    color: COLORS.accent,
    hp: 100,
    maxHp: 100,
    invulnerable: 0,
    weaponLevel: 1,
    speedBuff: 0,
    shield: 0,
    ammo: MAX_AMMO,
    maxAmmo: MAX_AMMO,
    isReloading: false,
    reloadTimer: 0,
    specialCharge: 0
  });

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
  const statsRef = useRef<GameStats>({
      score: 0,
      bugsFixed: 0,
      linesOfCode: 0,
      wave: 1,
      fps: 60,
      lastLog: t('logInit'),
      levelProgress: 0,
      levelTarget: 15,
      bossActive: false,
      combo: 0,
      comboTimer: 0,
      maxCombo: 0,
      weaponLevel: 1,
      ammo: MAX_AMMO,
      maxAmmo: MAX_AMMO,
      specialCharge: 0,
      shieldActive: false,
      pendingUpgrades: []
  });

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
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      particlesRef.current.push({
        id: Math.random().toString(),
        x, y,
        width: 10, height: 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1.0, maxLife: 1.0, alpha: 1,
        char: PARTICLE_CHARS[Math.floor(Math.random() * PARTICLE_CHARS.length)]
      });
    }
  };

  const addFloatingText = (x: number, y: number, text: string, color: string, vy = -1) => {
    floatingTextsRef.current.push({ id: Math.random().toString(), x, y, text, color, life: 60, vy });
  };

  // ── Apply upgrade (called when pendingUpgrade prop fires) ─────────────────
  useEffect(() => {
    if (!pendingUpgrade) return;
    const player = playerRef.current;

    switch (pendingUpgrade) {
      case 'WEAPON':
        player.weaponLevel = Math.min(5, player.weaponLevel + 1);
        addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, t('compilerUpgraded'), COLORS.class);
        break;
      case 'MAX_HP':
        player.maxHp += 25;
        player.hp = player.maxHp;
        addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, t('heapExpanded'), COLORS.gitAdded);
        break;
      case 'MAX_AMMO':
        player.maxAmmo += 10;
        player.ammo = player.maxAmmo;
        addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, t('bufferOverflow'), COLORS.keyword);
        break;
      case 'RELOAD':
        fastGcRef.current = true;
        addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, t('fastGcEnabled'), COLORS.function);
        break;
      case 'OVERCLOCK':
        overclockRef.current = true;
        addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, t('overclocked'), COLORS.warning);
        break;
    }

    statsRef.current.pendingUpgrades = [];
    syncStatsToUI();
    onUpgradeConsumed();
    setGameState(GameState.PLAYING);
  }, [pendingUpgrade]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Spawn helpers ─────────────────────────────────────────────────────────
  const spawnEnemy = (type: EnemyType | 'RANDOM', x?: number, y?: number, scaleHP = 1) => {
      let enemyDef: typeof ENEMY_TYPES[number] = ENEMY_TYPES[0];

      if (type === 'RANDOM') {
        const r = Math.random();
        const wave = statsRef.current.wave;
        if (wave === 1) {
             if (r > 0.8) enemyDef = ENEMY_TYPES[1];
        } else if (wave === 2) {
             if (r > 0.9) enemyDef = ENEMY_TYPES[1];
             else if (r > 0.6) enemyDef = ENEMY_TYPES[2];
        } else if (wave >= 3) {
             if (r > 0.92) enemyDef = ENEMY_TYPES[5];
             else if (r > 0.84) enemyDef = ENEMY_TYPES[4];
             else if (r > 0.74) enemyDef = ENEMY_TYPES[3];
             else if (r > 0.60) enemyDef = ENEMY_TYPES[6];
             else if (r > 0.45) enemyDef = ENEMY_TYPES[7];
             else if (r > 0.30) enemyDef = ENEMY_TYPES[2];
        }
      } else {
          const found = ENEMY_TYPES.find(e => e.type === type);
          if (found) enemyDef = found;
      }

      const waveScaler = 1 + (statsRef.current.wave * 0.2);

      enemiesRef.current.push({
        id: Math.random().toString(),
        x: x ?? Math.random() * (CANVAS_WIDTH - enemyDef.width),
        y: y ?? -60,
        width: enemyDef.width,
        height: 24,
        vx: (Math.random() - 0.5) * (enemyDef.type === 'ERROR_404' ? 4 : 0.5),
        vy: enemyDef.speed + (statsRef.current.wave * 0.1),
        color: enemyDef.color,
        type: enemyDef.type as EnemyType,
        hp: enemyDef.hp * waveScaler * scaleHP,
        maxHp: enemyDef.hp * waveScaler * scaleHP,
        text: enemyDef.text,
        scoreValue: enemyDef.score,
        age: 0,
        flashTimer: 0
      });
  };

  const spawnBoss = () => {
      const monolithDef = ENEMY_TYPES.find(e => e.type === 'MONOLITH') || ENEMY_TYPES[ENEMY_TYPES.length - 1];
      enemiesRef.current.push({
        id: 'boss-' + Math.random(),
        x: CANVAS_WIDTH / 2 - monolithDef.width / 2,
        y: -150,
        width: monolithDef.width,
        height: 60,
        vx: 0,
        vy: 2,
        color: monolithDef.color,
        type: 'MONOLITH',
        hp: monolithDef.hp * (1 + statsRef.current.wave * 0.5),
        maxHp: monolithDef.hp * (1 + statsRef.current.wave * 0.5),
        text: monolithDef.text,
        scoreValue: monolithDef.score,
        age: 0,
        flashTimer: 0
      });
      statsRef.current.bossActive = true;
      statsRef.current.lastLog = t('logBoss');
      addFloatingText(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, t('bossApproaching'), COLORS.error);
      shakeRef.current = 20;
      sfxBossAppear();
  };

  const pickPowerUpDrop = () => {
      const totalWeight = POWER_UPS.reduce((sum, p) => sum + p.chance, 0);
      let roll = Math.random() * totalWeight;
      for (const p of POWER_UPS) {
          roll -= p.chance;
          if (roll <= 0) return p;
      }
      return null;
  };

  const handleEnemyDefeat = (enemy: Enemy) => {
      if (enemy.hp > 0) return;

      const player = playerRef.current;
      enemy.hp = 0;
      createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, 12);
      sfxExplosion();

      if (enemy.type === 'MERGE_CONFLICT') {
          spawnEnemy('BUG', enemy.x - 20, enemy.y, 0.5);
          spawnEnemy('BUG', enemy.x + 20, enemy.y, 0.5);
          addFloatingText(enemy.x, enemy.y, t('split'), COLORS.gitModified);
      }

      const comboMultiplier = 1 + (statsRef.current.combo * 0.1);
      statsRef.current.score += Math.floor(enemy.scoreValue * comboMultiplier);
      statsRef.current.bugsFixed++;
      statsRef.current.combo++;
      statsRef.current.maxCombo = Math.max(statsRef.current.maxCombo, statsRef.current.combo);
      statsRef.current.comboTimer = COMBO_TIMER_MAX;

      player.specialCharge = Math.min(MAX_SPECIAL_CHARGE, player.specialCharge + SPECIAL_CHARGE_PER_KILL);

      if (statsRef.current.combo > 1 && statsRef.current.combo % 5 === 0) {
          addFloatingText(player.x, player.y - 50, t('comboLabel', { n: statsRef.current.combo }), COLORS.warning);
      }

      if (enemy.type === 'MONOLITH') {
          statsRef.current.bossActive = false;
          statsRef.current.wave++;
          statsRef.current.levelProgress = 0;
          statsRef.current.levelTarget += 5;
          enemyProjectilesRef.current = [];
          statsRef.current.lastLog = t('logBossKilled', { wave: statsRef.current.wave - 1 });
          addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, t('deploySuccess'), COLORS.class);
          player.hp = player.maxHp;
          player.ammo = player.maxAmmo;
          shakeRef.current = 20;
          sfxWaveClear();

          // Trigger wave upgrade screen
          const choices = pickUpgradeChoices();
          statsRef.current.pendingUpgrades = choices;
          syncStatsToUI();
          setGameState(GameState.UPGRADE);
      } else if (!statsRef.current.bossActive) {
          statsRef.current.levelProgress++;
      }

      if (Math.random() < 0.15) {
          const powerUp = pickPowerUpDrop();
          if (powerUp) {
              powerUpsRef.current.push({
                  id: Math.random().toString(),
                  x: enemy.x + enemy.width / 2 - 12,
                  y: enemy.y,
                  width: 24, height: 24,
                  vx: 0, vy: 2,
                  color: powerUp.color,
                  type: powerUp.type,
                  icon: powerUp.icon
              });
          }
      }
  };

  const triggerRefactorUltimate = () => {
      if (playerRef.current.specialCharge < MAX_SPECIAL_CHARGE) return;

      playerRef.current.specialCharge = 0;
      shakeRef.current = 30;
      statsRef.current.lastLog = t('logRefactor');
      enemyProjectilesRef.current = [];

      // BUG FIX #2: Snapshot to avoid modifying the array while iterating
      // (MERGE_CONFLICT defeat → spawnEnemy pushes new enemies into the same array)
      const snapshot = [...enemiesRef.current];
      snapshot.forEach(e => {
          e.hp -= 50;
          e.flashTimer = 10;
          createExplosion(e.x + e.width / 2, e.y + e.height / 2, COLORS.accent, 5);
          handleEnemyDefeat(e);
      });

      particlesRef.current.push({
          id: 'shockwave',
          x: playerRef.current.x + playerRef.current.width / 2,
          y: playerRef.current.y + playerRef.current.height / 2,
          width: 0, height: 0, vx: 0, vy: 0,
          color: COLORS.accent, life: 1.0, maxLife: 1.0, alpha: 0.8, char: ''
      });

      addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, t('refactorComplete'), COLORS.class);
      sfxUltimate();
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    overclockRef.current = false;
    fastGcRef.current = false;

    playerRef.current = {
      id: 'player',
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 60,
      width: 40, height: 40,
      vx: 0, vy: 0,
      color: COLORS.accent,
      hp: 100, maxHp: 100,
      invulnerable: 0,
      weaponLevel: 1,
      speedBuff: 0,
      shield: 0,
      ammo: MAX_AMMO,
      maxAmmo: MAX_AMMO,
      isReloading: false,
      reloadTimer: 0,
      specialCharge: 0
    };
    projectilesRef.current = [];
    enemyProjectilesRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    powerUpsRef.current = [];
    floatingTextsRef.current = [];
    shakeRef.current = 0;
    keysRef.current.clear();
    statsRef.current = {
        score: 0,
        bugsFixed: 0,
        linesOfCode: 0,
        wave: 1,
        fps: 60,
        lastLog: t('logNewSession'),
        levelProgress: 0,
        levelTarget: 15,
        bossActive: false,
        combo: 0,
        comboTimer: 0,
        maxCombo: 0,
        weaponLevel: 1,
        ammo: MAX_AMMO,
        maxAmmo: MAX_AMMO,
        specialCharge: 0,
        shieldActive: false,
        pendingUpgrades: []
    };
    lastFireTimeRef.current = 0;
    lastSpawnTimeRef.current = performance.now();
    lastTimeRef.current = performance.now();
    lastStatsSyncTimeRef.current = 0;
    syncStatsToUI();
  }, [syncStatsToUI]);

  // ── Input setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyboardEvent(e.target)) return;
      if (e.code === 'Escape' || e.code === 'KeyP') {
        setGameState(prev => {
          if (prev === GameState.PLAYING) return GameState.PAUSED;
          if (prev === GameState.PAUSED) return GameState.PLAYING;
          return prev;
        });
      }
      keysRef.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyboardEvent(e.target)) return;
      keysRef.current.delete(e.code);
    };

    // BUG FIX #1: Clear held keys on window blur to prevent stuck-key movement
    const handleBlur = () => keysRef.current.clear();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    setMounted(true);

    for (let i = 0; i < 20; i++) {
        bgParticlesRef.current.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT,
            text: BACKGROUND_STRINGS[Math.floor(Math.random() * BACKGROUND_STRINGS.length)],
            opacity: Math.random() * 0.1 + 0.02,
            speed: Math.random() * 1 + 0.5
        });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [setGameState]);

  // ── Game Loop ─────────────────────────────────────────────────────────────
  const gameLoop = useCallback((timestamp: number) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // ─ Paused / Upgrade: freeze logic, dim frame, keep rAF alive ─
    if (gameState === GameState.PAUSED || gameState === GameState.UPGRADE) {
        // BUG FIX #5: Keep lastTimeRef in sync so the first active frame
        // doesn't inherit a large deltaTime spike from the idle period.
        lastTimeRef.current = timestamp;

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        if (gameState === GameState.PAUSED) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 40px "Fira Code"';
          ctx.textAlign = 'center';
          ctx.fillText(t('breakpointHit'), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
          ctx.font = '20px "Fira Code"';
          ctx.fillStyle = '#cccccc';
          ctx.fillText(t('pressToContinue'), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
          ctx.textAlign = 'left';
        }
        // UPGRADE state: React overlay in App.tsx handles the actual UI
        ctx.restore();
        frameIdRef.current = requestAnimationFrame(gameLoop);
        return;
    }

    if (gameState !== GameState.PLAYING) {
        if (gameState === GameState.START) {
             ctx.fillStyle = COLORS.bg;
             ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
             ctx.fillStyle = '#2e2e2e';
             ctx.font = '14px "Fira Code"';
             bgParticlesRef.current.forEach(p => {
                 p.y += p.speed;
                 if (p.y > CANVAS_HEIGHT) { p.y = -20; p.x = Math.random() * CANVAS_WIDTH; }
                 ctx.globalAlpha = p.opacity;
                 ctx.fillText(p.text, p.x, p.y);
             });
             ctx.globalAlpha = 1.0;
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

    // 2. Player physics
    const sensitivity = Math.max(0.5, Math.min(2, movementSensitivity || 1));
    const currentSpeed = (player.speedBuff > 0 ? PLAYER_BOOST_SPEED : PLAYER_SPEED) * sensitivity;
    if (player.speedBuff > 0) player.speedBuff = Math.max(0, player.speedBuff - frameScale);
    if (player.shield > 0)    player.shield    = Math.max(0, player.shield - frameScale);
    if (player.invulnerable > 0) player.invulnerable = Math.max(0, player.invulnerable - frameScale);

    // Combo decay
    if (statsRef.current.combo > 0) {
        statsRef.current.comboTimer = Math.max(0, statsRef.current.comboTimer - frameScale);
        if (statsRef.current.comboTimer <= 0) {
            statsRef.current.combo = 0;
            statsRef.current.lastLog = t('logComboBreak');
        }
    }

    // Ultimate input
    if ((keysRef.current.has('KeyR') || keysRef.current.has('ShiftLeft')) && player.specialCharge >= MAX_SPECIAL_CHARGE) {
        triggerRefactorUltimate();
    }

    if (keysRef.current.has('ArrowLeft') || keysRef.current.has('KeyA')) player.x -= currentSpeed * frameScale;
    if (keysRef.current.has('ArrowRight') || keysRef.current.has('KeyD')) player.x += currentSpeed * frameScale;
    if (keysRef.current.has('ArrowUp')   || keysRef.current.has('KeyW')) player.y -= currentSpeed * frameScale;
    if (keysRef.current.has('ArrowDown') || keysRef.current.has('KeyS')) player.y += currentSpeed * frameScale;
    player.x = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.x));
    player.y = Math.max(0, Math.min(CANVAS_HEIGHT - player.height, player.y));

    // 3. Reload / Ammo
    const reloadDuration = fastGcRef.current ? RELOAD_TIME * 0.7 : RELOAD_TIME;
    if (player.isReloading) {
        player.reloadTimer -= frameScale;
        if (player.reloadTimer <= 0) {
            player.isReloading = false;
            player.ammo = player.maxAmmo;
            addFloatingText(player.x, player.y - 20, t('gcComplete'), COLORS.class);
        }
    } else {
        if (!keysRef.current.has('Space') && player.ammo < player.maxAmmo) {
            player.ammo = Math.min(player.maxAmmo, player.ammo + AMMO_REGEN);
        }
    }

    // 4. Shooting
    const fireRate = overclockRef.current ? 80 : (player.weaponLevel >= 3 ? 100 : 150);
    const canShoot = !player.isReloading && player.ammo >= 1;

    if (keysRef.current.has('Space') && timestamp - lastFireTimeRef.current > fireRate) {
        if (canShoot) {
            player.ammo -= 1;
            if (player.ammo <= 0) {
                player.isReloading = true;
                player.reloadTimer = reloadDuration;
                statsRef.current.lastLog = t('logGcPause');
                addFloatingText(player.x, player.y - 40, t('gcPause'), COLORS.warning);
            }

            projectilesRef.current.push({
                id: Math.random().toString(),
                x: player.x + player.width / 2 - 2, y: player.y,
                width: 4, height: 12, vx: 0, vy: -12, color: COLORS.keyword, damage: 10, type: 'DEFAULT'
            });

            if (player.weaponLevel >= 2) {
                projectilesRef.current.push(
                    { id: Math.random().toString(), x: player.x,              y: player.y + 10, width: 3, height: 10, vx: -1, vy: -10, color: COLORS.function, damage: 5, type: 'TS_BEAM' },
                    { id: Math.random().toString(), x: player.x + player.width, y: player.y + 10, width: 3, height: 10, vx:  1, vy: -10, color: COLORS.function, damage: 5, type: 'TS_BEAM' }
                );
            }

            if (player.weaponLevel >= 4) {
                projectilesRef.current.push(
                    { id: Math.random().toString(), x: player.x,              y: player.y + 10, width: 4, height: 8, vx: -4, vy: -8, color: COLORS.string, damage: 8, type: 'SUDO_BLAST' },
                    { id: Math.random().toString(), x: player.x + player.width, y: player.y + 10, width: 4, height: 8, vx:  4, vy: -8, color: COLORS.string, damage: 8, type: 'SUDO_BLAST' }
                );
            }

            statsRef.current.linesOfCode++;
            lastFireTimeRef.current = timestamp;
            sfxShoot();
        }
    }

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
    projectilesRef.current.forEach(p => { p.x += p.vx * frameScale; p.y += p.vy * frameScale; });
    projectilesRef.current = projectilesRef.current.filter(p => p.y > -50 && p.y < CANVAS_HEIGHT + 50);

    enemyProjectilesRef.current.forEach(p => { p.x += p.vx * frameScale; p.y += p.vy * frameScale; });
    enemyProjectilesRef.current = enemyProjectilesRef.current.filter(p => p.y < CANVAS_HEIGHT + 50);

    // 7. Move enemies & AI
    enemiesRef.current.forEach(enemy => {
      const previousAge = enemy.age;
      enemy.age += frameScale;
      if (enemy.flashTimer > 0) enemy.flashTimer = Math.max(0, enemy.flashTimer - frameScale);

      if (enemy.type === 'INFINITE_LOOP') {
          enemy.x += Math.cos(enemy.age * 0.1) * 3 * frameScale;
          enemy.y += enemy.vy * frameScale;
      } else if (enemy.type === 'RACE_CONDITION') {
          enemy.y += enemy.vy * frameScale;
          if (crossedFrameInterval(previousAge, enemy.age, 60) && Math.random() > 0.5) {
              createExplosion(enemy.x + enemy.width / 2, enemy.y, enemy.color, 3);
              enemy.x = Math.random() * (CANVAS_WIDTH - enemy.width);
          }
      } else if (enemy.type === 'MERGE_CONFLICT') {
          enemy.x += Math.sin(enemy.age * 0.05) * frameScale;
          enemy.y += enemy.vy * frameScale;
      } else if (enemy.type === 'MEMORY_LEAK') {
          if (crossedFrameInterval(previousAge, enemy.age, 40)) {
              enemy.width += 2; enemy.height += 1; enemy.x -= 1;
          }
          enemy.y += enemy.vy * frameScale;
      } else if (enemy.type === 'SPAGHETTI') {
          enemy.x += Math.sin(enemy.age * 0.1) * 2 * frameScale;
          enemy.y += enemy.vy * frameScale;
      } else if (enemy.type === 'MONOLITH') {
          if (enemy.y < 60) {
              enemy.y += enemy.vy * frameScale;
          } else {
              const isRage = enemy.hp < enemy.maxHp * 0.5;
              const hoverSpeed = isRage ? 0.06 : 0.02;
              const moveSpeed  = isRage ? 3 : 1;

              enemy.y = 60 + Math.sin(enemy.age * hoverSpeed) * 20;
              const dx = (player.x + player.width / 2) - (enemy.x + enemy.width / 2);
              if (dx >  20) enemy.x += moveSpeed * 0.5 * frameScale;
              if (dx < -20) enemy.x -= moveSpeed * 0.5 * frameScale;
              enemy.x = Math.max(0, Math.min(CANVAS_WIDTH - enemy.width, enemy.x));

              if (isRage && crossedFrameInterval(previousAge, enemy.age, 10)) {
                  enemy.color = enemy.color === COLORS.error ? COLORS.keyword : COLORS.error;
              }

              // Phase 1: single tracking projectile
              if (crossedFrameInterval(previousAge, enemy.age, isRage ? 40 : 90)) {
                  enemyProjectilesRef.current.push({
                      id: 'p-' + Math.random(),
                      x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height,
                      width: 20, height: 20,
                      vx: (player.x - (enemy.x + enemy.width / 2)) * 0.02, vy: 5,
                      color: COLORS.warning, damage: 15, label: '⚠'
                  });
              }

              // Phase 2 (RAGE): Spread shotgun burst every 70 frames
              if (isRage && crossedFrameInterval(previousAge, enemy.age, 70)) {
                  const cx = enemy.x + enemy.width / 2;
                  const cy = enemy.y + enemy.height;
                  [-3, 0, 3].forEach(offsetVx => {
                      enemyProjectilesRef.current.push({
                          id: 'sp-' + Math.random(),
                          x: cx, y: cy,
                          width: 14, height: 14,
                          vx: offsetVx, vy: 6,
                          color: COLORS.error, damage: 10, label: '✖'
                      });
                  });
              }

              // Minion spawns — rage doubles frequency
              if (crossedFrameInterval(previousAge, enemy.age, isRage ? 150 : 300)) {
                  spawnEnemy('BUG', enemy.x, enemy.y + 80);
                  spawnEnemy('SYNTAX_ERROR', enemy.x + enemy.width, enemy.y + 80);
              }
          }
      } else {
          enemy.x += enemy.vx * frameScale;
          enemy.y += enemy.vy * frameScale;
      }

      // Player ↔ enemy body collision
      if (
        player.x < enemy.x + enemy.width  &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y
      ) {
        if (player.shield > 0) {
             enemy.hp -= 10;
             createExplosion(enemy.x, enemy.y, '#0db7ed', 5);
             addFloatingText(player.x, player.y - 20, t('blocked'), '#0db7ed');
             handleEnemyDefeat(enemy);
        } else if (player.invulnerable <= 0) {
          player.hp -= 20;
          player.invulnerable = 60;
          player.weaponLevel = Math.max(1, player.weaponLevel - 1);
          statsRef.current.combo = 0;
          createExplosion(player.x, player.y, COLORS.error, 15);
          shakeRef.current = 15;
          addFloatingText(player.x, player.y - 40, t('exception'), COLORS.error);
          sfxPlayerHit();
          if (player.hp <= 0) triggerGameOver();
        }
        if (enemy.type !== 'MONOLITH') enemy.hp = 0;
      }
    });

    // Player ↔ enemy projectiles
    enemyProjectilesRef.current.forEach(p => {
        if (
            player.invulnerable <= 0 &&
            player.x < p.x + p.width  &&
            player.x + player.width > p.x &&
            player.y < p.y + p.height &&
            player.y + player.height > p.y
        ) {
            if (player.shield > 0) {
                addFloatingText(player.x, player.y - 20, t('blocked'), '#0db7ed');
            } else {
                player.hp -= p.damage;
                player.invulnerable = 40;
                statsRef.current.combo = 0;
                shakeRef.current = 15;
                createExplosion(player.x, player.y, COLORS.error, 8);
                addFloatingText(player.x, player.y - 30, t('dmgLabel', { n: p.damage }), COLORS.error);
                sfxPlayerHit();
                if (player.hp <= 0) triggerGameOver();
            }
            p.y = CANVAS_HEIGHT + 100;
        }
    });

    // Bullet ↔ enemy
    projectilesRef.current.forEach(p => {
      if (p.damage <= 0) return;
      enemiesRef.current.forEach(e => {
        if (e.hp <= 0) return;
        if (
          p.x < e.x + e.width && p.x + p.width > e.x &&
          p.y < e.y + e.height && p.y + p.height > e.y
        ) {
          e.hp -= p.damage;
          e.flashTimer = 3;
          p.damage = 0;
          createExplosion(p.x, p.y, COLORS.text, 1);
          sfxHit();
          handleEnemyDefeat(e);
        }
      });
    });

    // Cleanup dead entities
    projectilesRef.current = projectilesRef.current.filter(p => p.damage > 0);
    enemiesRef.current     = enemiesRef.current.filter(e => e.y < CANVAS_HEIGHT && e.hp > 0);

    particlesRef.current.forEach(p => {
      p.x += p.vx * frameScale;
      p.y += p.vy * frameScale;
      p.life -= 0.02 * frameScale;
      p.alpha = p.life;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    floatingTextsRef.current.forEach(t => { t.y += t.vy * frameScale; t.life -= frameScale; });
    floatingTextsRef.current = floatingTextsRef.current.filter(t => t.life > 0);

    // Power-ups
    powerUpsRef.current.forEach(p => {
        p.y += 2 * frameScale;
        if (
            player.x < p.x + p.width  && player.x + player.width > p.x &&
            player.y < p.y + p.height && player.y + player.height > p.y
        ) {
            if (p.type === 'COFFEE') {
                player.speedBuff = 600;
                addFloatingText(player.x, player.y, t('speedUp'), p.color);
                sfxPowerUp();
            } else if (p.type === 'COPILOT') {
                player.weaponLevel = Math.min(5, player.weaponLevel + 1);
                addFloatingText(player.x, player.y, t('weaponUp'), p.color);
                sfxPowerUp();
            } else if (p.type === 'DOCKER') {
                player.shield = 300;
                addFloatingText(player.x, player.y, t('shield'), p.color);
                sfxPowerUp();
            } else if (p.type === 'HOTFIX') {
                // New heal pickup
                const healed = Math.min(player.maxHp - player.hp, 30);
                player.hp = Math.min(player.maxHp, player.hp + 30);
                addFloatingText(player.x, player.y, t('hpGain', { n: healed }), p.color);
                sfxHeal();
            }
            p.y = CANVAS_HEIGHT + 100;
        }
    });
    powerUpsRef.current = powerUpsRef.current.filter(p => p.y < CANVAS_HEIGHT);

    // Throttled stats sync
    if (timestamp - lastStatsSyncTimeRef.current >= 100) {
        lastStatsSyncTimeRef.current = timestamp;
        syncStatsToUI();
    }

    // ── RENDER ──────────────────────────────────────────────────────────────
    ctx.save();
    if (shakeRef.current > 0) {
        ctx.translate(
          (Math.random() - 0.5) * shakeRef.current,
          (Math.random() - 0.5) * shakeRef.current
        );
        shakeRef.current *= Math.pow(0.9, frameScale);
        if (shakeRef.current < 0.5) shakeRef.current = 0;
    }

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background code rain
    ctx.font = '12px "Fira Code"';
    bgParticlesRef.current.forEach(p => {
        ctx.fillStyle = '#2e2e2e';
        ctx.globalAlpha = p.opacity;
        ctx.fillText(p.text, p.x, p.y);
    });
    ctx.globalAlpha = 1.0;

    // Large combo watermark
    if (statsRef.current.combo >= 5) {
        ctx.save();
        ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 120px "Fira Code"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${statsRef.current.combo}x`, 0, 0);
        ctx.restore();
    }

    // Grid
    ctx.strokeStyle = '#2e2e2e';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_HEIGHT; i += 40) {
       ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_WIDTH, i); ctx.stroke();
    }

    // Player ship
    if (player.invulnerable <= 0 || Math.floor(Date.now() / 50) % 2 === 0) {
        ctx.save();
        ctx.translate(player.x + player.width / 2, player.y + player.height / 2);

        if (player.shield > 0) {
            ctx.beginPath(); ctx.arc(0, 0, 35, 0, Math.PI * 2);
            ctx.strokeStyle = '#0db7ed'; ctx.lineWidth = 2; ctx.stroke();
        }
        if (player.specialCharge >= MAX_SPECIAL_CHARGE) {
             const pulsate = Math.sin(timestamp * 0.01) * 5;
             ctx.beginPath(); ctx.arc(0, 0, 40 + pulsate, 0, Math.PI * 2);
             ctx.strokeStyle = COLORS.class; ctx.lineWidth = 1;
             ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(0, -20); ctx.lineTo(15, 15); ctx.lineTo(0, 10); ctx.lineTo(-15, 15);
        ctx.closePath();
        ctx.fillStyle = player.speedBuff > 0 ? COLORS.warning : COLORS.statusBar;
        ctx.fill();

        const ammoPct = player.ammo / player.maxAmmo;
        ctx.fillStyle = '#333'; ctx.fillRect(-20, 25, 40, 4);
        ctx.fillStyle = player.isReloading ? COLORS.error : COLORS.class;
        ctx.fillRect(-20, 25, 40 * ammoPct, 4);
        ctx.restore();
    }

    // HP HUD (compact corner)
    const hpPct = Math.max(0, player.hp / player.maxHp);
    const hpHudX = 12, hpHudY = 12, hpBarWidth = 92;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = 'rgba(30,30,30,0.72)';
    ctx.fillRect(hpHudX, hpHudY, 148, 18);
    ctx.strokeStyle = '#3c3c3c';
    ctx.strokeRect(hpHudX, hpHudY, 148, 18);
    ctx.fillStyle = '#858585';
    ctx.font = '10px "Fira Code"';
    ctx.fillText(t('hpLabel'), hpHudX + 6, hpHudY + 12);
    ctx.fillStyle = '#333333';
    ctx.fillRect(hpHudX + 24, hpHudY + 5, hpBarWidth, 8);
    ctx.fillStyle = hpPct > 0.6 ? COLORS.class : hpPct > 0.3 ? COLORS.warning : COLORS.error;
    ctx.fillRect(hpHudX + 24, hpHudY + 5, hpBarWidth * hpPct, 8);
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`${Math.max(0, Math.ceil(player.hp))}/${player.maxHp}`, hpHudX + 120, hpHudY + 12);
    ctx.restore();

    // Enemy projectiles
    ctx.font = '20px "Fira Code"';
    enemyProjectilesRef.current.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillText(p.label, p.x - 10, p.y);
    });

    // Enemies
    enemiesRef.current.forEach(e => {
      ctx.save();
      ctx.fillStyle = e.flashTimer > 0 ? '#ffffff' : e.color;
      ctx.font = `bold ${e.type === 'MONOLITH' ? '24px' : '16px'} "Fira Code"`;
      ctx.fillText(e.text, e.x, e.y + 20);
      ctx.restore();

      const pct = e.hp / e.maxHp;
      if (pct < 1) {
        ctx.fillStyle = '#333'; ctx.fillRect(e.x, e.y - 5, e.width, 3);
        ctx.fillStyle = e.flashTimer > 0 ? '#ffffff' : e.color;
        ctx.fillRect(e.x, e.y - 5, e.width * pct, 3);
      }
    });

    // Player projectiles
    projectilesRef.current.forEach(p => {
      ctx.fillStyle = p.color;
      if (p.type === 'SUDO_BLAST') {
          ctx.font = '10px "Fira Code"';
          ctx.fillText('sudo', p.x - 5, p.y);
      } else {
          ctx.fillRect(p.x, p.y, p.width, p.height);
      }
    });

    // Power-up icons
    ctx.font = '20px sans-serif';
    powerUpsRef.current.forEach(p => ctx.fillText(p.icon, p.x, p.y + 20));

    // Particles
    particlesRef.current.forEach(p => {
      if (p.id === 'shockwave') {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, (1 - p.life) * 600, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 10 * p.life;
          ctx.stroke();
          ctx.restore();
      } else {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillText(p.char, p.x, p.y);
      }
    });
    ctx.globalAlpha = 1.0;

    // Floating texts
    ctx.font = 'bold 14px "Fira Code"';
    floatingTextsRef.current.forEach(t => {
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, t.x, t.y);
    });

    // Boss HP bar
    const monolith = enemiesRef.current.find(e => e.type === 'MONOLITH');
    if (monolith) {
        const barWidth = CANVAS_WIDTH * 0.6;
        const barX = (CANVAS_WIDTH - barWidth) / 2;
        const pct = Math.max(0, monolith.hp / monolith.maxHp);
        const isRage = monolith.hp < monolith.maxHp * 0.5;

        ctx.fillStyle = '#333'; ctx.fillRect(barX, 20, barWidth, 15);
        ctx.fillStyle = isRage ? COLORS.error : '#f14c4c';
        ctx.fillRect(barX, 20, barWidth * pct, 15);
        ctx.strokeStyle = isRage ? COLORS.warning : '#fff';
        ctx.strokeRect(barX, 20, barWidth, 15);
        ctx.fillStyle = isRage ? COLORS.warning : '#fff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px "Fira Code"';
        ctx.fillText(
          isRage
            ? t('bossBarPhase2', { wave: statsRef.current.wave })
            : t('bossBar', { wave: statsRef.current.wave }),
          CANVAS_WIDTH / 2, 15
        );
        ctx.textAlign = 'left';
    }

    // Damage vignette
    if (player.invulnerable > 0 && player.invulnerable % 10 > 5) {
        const grad = ctx.createRadialGradient(
          CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT / 3,
          CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT
        );
        grad.addColorStop(0, 'rgba(255,0,0,0)');
        grad.addColorStop(1, 'rgba(255,0,0,0.3)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // CRT scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < CANVAS_HEIGHT; i += 4) ctx.fillRect(0, i, CANVAS_WIDTH, 1);

    // Minimap
    const mmW = 60, mmScale = 0.08, mmX = CANVAS_WIDTH - mmW;
    ctx.fillStyle = 'rgba(30,30,30,0.8)';
    ctx.fillRect(mmX, 0, mmW, CANVAS_HEIGHT);
    ctx.strokeStyle = '#444'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mmX, 0); ctx.lineTo(mmX, CANVAS_HEIGHT); ctx.stroke();

    enemiesRef.current.forEach(e => {
        ctx.fillStyle = e.type === 'MONOLITH' ? COLORS.error : COLORS.warning;
        ctx.fillRect(mmX + e.x * mmScale, e.y * mmScale, Math.max(2, e.width * mmScale), Math.max(2, e.height * mmScale));
    });
    ctx.fillStyle = COLORS.statusBar;
    ctx.fillRect(mmX + player.x * mmScale, player.y * mmScale, 4, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(mmX, 0, mmW, CANVAS_HEIGHT * mmScale * 3);

    ctx.restore();

    frameIdRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, movementSensitivity, onStatsUpdate, setGameState, syncStatsToUI, triggerGameOver]);

  useEffect(() => {
    if (mounted) {
      const shouldReset = gameState === GameState.START || restartToken !== lastRestartTokenRef.current;
      if (shouldReset) {
        resetGame();
        lastRestartTokenRef.current = restartToken;
      }
      frameIdRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(frameIdRef.current);
  }, [gameState, gameLoop, mounted, resetGame, restartToken]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="cursor-none shadow-2xl shadow-black border border-[#333]"
      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
    />
  );
};

export default GameEngine;
