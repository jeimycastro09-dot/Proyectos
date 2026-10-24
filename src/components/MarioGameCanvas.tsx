import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  GameEntity,
  EntityType,
  FloatingText,
  MatrixCounts,
  ClassificationResult,
  GameLogEntry,
  LevelConfig,
} from '../types/game';
import { sounds } from '../utils/sound';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Heart,
  Shield,
  Eye,
  Sliders,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface MarioGameCanvasProps {
  onMatrixUpdate: (counts: MatrixCounts, lastResult: ClassificationResult, log: GameLogEntry) => void;
  currentCounts: MatrixCounts;
  onResetCounts: () => void;
}

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Mundo 1-1: Pradera de los Fundamentos',
    description: 'Entidades claras. Aprende a distinguir amenazas de aliados pacíficos.',
    spawnInterval: 2800,
    targetEntities: 10,
    speedMultiplier: 1.0,
    allowDisguised: false,
    goal: 'Logra al menos 80% de Exactitud evaluando 10 entidades.',
  },
  {
    id: 2,
    name: 'Mundo 1-2: Bosque de los Disfraces',
    description: '¡Cuidado con el ruido y la ambigüedad! Enemigos con disfraces inocentes.',
    spawnInterval: 2400,
    targetEntities: 14,
    speedMultiplier: 1.25,
    allowDisguised: true,
    goal: 'Observa la telemetría del radar para evitar Falsos Negativos y Positivos.',
  },
  {
    id: 3,
    name: 'Mundo 1-3: La Fortaleza de Bowser',
    description: 'Prueba de alta cadencia. Maximiza tu F1-Score y defiende el Castillo.',
    spawnInterval: 1900,
    targetEntities: 18,
    speedMultiplier: 1.5,
    allowDisguised: true,
    goal: 'Equilibra Precisión y Recall para obtener la estrella de oro.',
  },
];

export const MarioGameCanvas: React.FC<MarioGameCanvasProps> = ({
  onMatrixUpdate,
  currentCounts,
  onResetCounts,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const currentLevel = LEVELS[currentLevelIndex];

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [score, setScore] = useState(0);
  const [castleHealth, setCastleHealth] = useState(100);
  const [marioLives, setMarioLives] = useState(3);
  const [entitiesProcessed, setEntitiesProcessed] = useState(0);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [showTelemetry, setShowTelemetry] = useState(true);

  // Live telemetry of nearest entity
  const [nearestEntity, setNearestEntity] = useState<GameEntity | null>(null);

  // References for mutable game loop state to avoid re-renders at 60fps
  const stateRef = useRef({
    mario: {
      x: 140,
      y: 260,
      vx: 0,
      vy: 0,
      width: 32,
      height: 44,
      isGrounded: true,
      facing: 'right' as 'left' | 'right',
      isJumping: false,
      stompCooldown: 0,
      animFrame: 0,
    },
    entities: [] as GameEntity[],
    floatingTexts: [] as FloatingText[],
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      life: number;
    }>,
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      space: false,
    },
    lastSpawnTime: 0,
    nextEntityId: 1,
    groundY: 300,
    castleX: 60,
    screenShake: 0,
    counts: { ...currentCounts },
  });

  // Keep counts in sync
  useEffect(() => {
    stateRef.current.counts = { ...currentCounts };
  }, [currentCounts]);

  // Audio mute toggle
  const toggleMute = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
  };

  // Spawn dynamic entity
  const spawnEntity = useCallback((level: LevelConfig) => {
    const isThreat = Math.random() > 0.45; // ~55% threat, 45% friendly
    const isDisguised = level.allowDisguised && Math.random() > 0.6;
    const id = `entity_${stateRef.current.nextEntityId++}`;

    let type: EntityType = isThreat ? 'goomba' : 'toad';
    let name = isThreat ? 'Goomba Hostil' : 'Toad Ciudadano';
    let threatProb = isThreat ? 0.75 + Math.random() * 0.23 : 0.05 + Math.random() * 0.25;
    let hostility = isThreat ? Math.floor(70 + Math.random() * 30) : Math.floor(Math.random() * 25);
    let spikes = isThreat;

    if (isDisguised) {
      if (isThreat) {
        name = 'Goomba Infiltrado (Disfraz Pacifista)';
        threatProb = 0.52 + Math.random() * 0.2; // Borderline threat probability
        hostility = 65;
      } else {
        name = 'Toad con Paraguas Picudo (Aspecto Falso)';
        threatProb = 0.35 + Math.random() * 0.18; // Looks slightly suspicious but is safe
        hostility = 20;
      }
    }

    const newEntity: GameEntity = {
      id,
      type,
      name,
      isRealThreat: isThreat,
      x: 780,
      y: stateRef.current.groundY - 34,
      vx: -(1.6 * level.speedMultiplier + Math.random() * 0.3),
      width: 32,
      height: 34,
      speed: 1.6 * level.speedMultiplier,
      telemetry: {
        threatProbability: Number(threatProb.toFixed(2)),
        hostilityLevel: hostility,
        spikesDetected: spikes,
        friendlyAura: isThreat ? 10 : 85,
        disguiseSuspected: isDisguised,
      },
      description: isThreat
        ? 'Monstruo leal a Bowser. Atacará la bandera si no lo pisas.'
        : 'Habitante pacífico del reino. Déjalo pasar en paz.',
      appearance: {
        bodyColor: isThreat ? '#8B4513' : '#3B82F6',
        hasSpikes: spikes,
        hatColor: isDisguised ? '#F59E0B' : undefined,
      },
      processed: false,
    };

    stateRef.current.entities.push(newEntity);
  }, []);

  // Process classification outcome
  const handleClassification = useCallback(
    (entity: GameEntity, action: 'stomp_threat' | 'allow_friendly') => {
      if (entity.processed) return;
      entity.processed = true;

      const isRealThreat = entity.isRealThreat;
      const predictedThreat = action === 'stomp_threat';

      let result: ClassificationResult;
      let floatingText = '';
      let textColor = '';
      let bgColor = '';

      const updatedCounts = { ...stateRef.current.counts };

      if (isRealThreat && predictedThreat) {
        // TRUE POSITIVE
        result = 'TP';
        updatedCounts.tp += 1;
        setScore((s) => s + 100);
        floatingText = '+100 VP (Amenaza Eliminada)';
        textColor = '#10B981';
        bgColor = 'rgba(6, 78, 59, 0.9)';
        sounds.playStomp();

        // Spawn green particles
        for (let i = 0; i < 12; i++) {
          stateRef.current.particles.push({
            x: entity.x + entity.width / 2,
            y: entity.y + entity.height / 2,
            vx: (Math.random() - 0.5) * 6,
            vy: -Math.random() * 5 - 2,
            color: '#34D399',
            size: 3 + Math.random() * 3,
            life: 25,
          });
        }
      } else if (!isRealThreat && !predictedThreat) {
        // TRUE NEGATIVE
        result = 'TN';
        updatedCounts.tn += 1;
        setScore((s) => s + 100);
        floatingText = '+100 VN (Aliado Protegido)';
        textColor = '#38BDF8';
        bgColor = 'rgba(12, 74, 110, 0.9)';
        sounds.playPassFriendly();

        // Spawn peaceful blue sparkle particles
        for (let i = 0; i < 10; i++) {
          stateRef.current.particles.push({
            x: entity.x + entity.width / 2,
            y: entity.y + entity.height / 2,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 4 - 1,
            color: '#60A5FA',
            size: 3 + Math.random() * 2,
            life: 25,
          });
        }
      } else if (!isRealThreat && predictedThreat) {
        // FALSE POSITIVE (Error Tipo I: Falsa alarma / Inocente atacado)
        result = 'FP';
        updatedCounts.fp += 1;
        floatingText = '⚠️ FP: ¡Inocente Pisado! (Falsa Alarma)';
        textColor = '#F59E0B';
        bgColor = 'rgba(120, 53, 15, 0.9)';
        sounds.playFalsePositive();
        stateRef.current.screenShake = 6;

        // Penalty
        setMarioLives((l) => Math.max(0, l - 1));

        // Amber distress particles
        for (let i = 0; i < 14; i++) {
          stateRef.current.particles.push({
            x: entity.x + entity.width / 2,
            y: entity.y + entity.height / 2,
            vx: (Math.random() - 0.5) * 6,
            vy: -Math.random() * 5 - 1,
            color: '#FBBF24',
            size: 4,
            life: 30,
          });
        }
      } else {
        // FALSE NEGATIVE (Error Tipo II: Peligro omitido)
        result = 'FN';
        updatedCounts.fn += 1;
        floatingText = '💥 FN: ¡Enemigo Infiltrado! (Peligro Omitido)';
        textColor = '#F43F5E';
        bgColor = 'rgba(136, 19, 55, 0.9)';
        sounds.playFalseNegative();
        stateRef.current.screenShake = 12;

        // Castle damage
        setCastleHealth((ch) => Math.max(0, ch - 25));

        // Red explosion particles
        for (let i = 0; i < 16; i++) {
          stateRef.current.particles.push({
            x: stateRef.current.castleX + 20,
            y: stateRef.current.groundY - 30,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 6 - 2,
            color: '#FB7185',
            size: 4 + Math.random() * 3,
            life: 35,
          });
        }
      }

      stateRef.current.counts = updatedCounts;

      // Add floating text
      stateRef.current.floatingTexts.push({
        id: `ft_${Date.now()}_${Math.random()}`,
        text: floatingText,
        x: action === 'stomp_threat' ? entity.x - 30 : stateRef.current.castleX + 10,
        y: entity.y - 20,
        vy: -1.5,
        color: textColor,
        bg: bgColor,
        opacity: 1,
        resultType: result,
      });

      // Update parent component log and metrics
      const logEntry: GameLogEntry = {
        id: `log_${Date.now()}_${Math.random()}`,
        entityName: entity.name,
        isRealThreat,
        predictedThreat,
        result,
        timestamp: Date.now(),
        reason:
          result === 'TP'
            ? 'Peligro real eliminado con éxito (+VP).'
            : result === 'TN'
            ? 'Ciudadano inofensivo dejado pasar (+VN).'
            : result === 'FP'
            ? '¡Castigaste a un inocente! Error Tipo I (Reduce Precisión).'
            : '¡Dejaste pasar al enemigo al castillo! Error Tipo II (Reduce Recall).',
      };

      onMatrixUpdate(updatedCounts, result, logEntry);
      setEntitiesProcessed((p) => p + 1);

      // Check level targets
      const nextProcessed = entitiesProcessed + 1;
      if (nextProcessed >= currentLevel.targetEntities) {
        setIsLevelCleared(true);
        setIsPlaying(false);
        sounds.playVictory();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    },
    [currentLevel, entitiesProcessed, onMatrixUpdate]
  );

  // Jump handler (Stomp action)
  const performJump = useCallback(() => {
    const { mario } = stateRef.current;
    if (mario.isGrounded) {
      mario.vy = -11.5;
      mario.isGrounded = false;
      mario.isJumping = true;
      sounds.playJump();
    }
  }, []);

  // Allow friendly action (Passing without stomping)
  const performAllowFriendly = useCallback(() => {
    // Finds nearest entity ahead of Mario
    const nearest = stateRef.current.entities.find(
      (e) => !e.processed && e.x > stateRef.current.castleX && e.x < 500
    );
    if (nearest) {
      handleClassification(nearest, 'allow_friendly');
    }
  }, [handleClassification]);

  // Restart / Reset game
  const resetGame = useCallback(
    (levelIdx = currentLevelIndex) => {
      setCurrentLevelIndex(levelIdx);
      setScore(0);
      setCastleHealth(100);
      setMarioLives(3);
      setEntitiesProcessed(0);
      setIsGameOver(false);
      setIsLevelCleared(false);
      setIsPaused(false);
      setIsPlaying(true);

      stateRef.current.mario = {
        x: 140,
        y: 260,
        vx: 0,
        vy: 0,
        width: 32,
        height: 44,
        isGrounded: true,
        facing: 'right',
        isJumping: false,
        stompCooldown: 0,
        animFrame: 0,
      };
      stateRef.current.entities = [];
      stateRef.current.floatingTexts = [];
      stateRef.current.particles = [];
      stateRef.current.lastSpawnTime = Date.now();

      onResetCounts();
    },
    [currentLevelIndex, onResetCounts]
  );

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyZ', 'KeyX'].includes(e.code)) {
        // Prevent default scrolling only when game is focused
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
          e.preventDefault();
        }
      }

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        stateRef.current.keys.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        stateRef.current.keys.right = true;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        stateRef.current.keys.space = true;
        performJump();
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'KeyZ') {
        stateRef.current.keys.down = true;
        performAllowFriendly();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        stateRef.current.keys.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        stateRef.current.keys.right = false;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        stateRef.current.keys.space = false;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'KeyZ') {
        stateRef.current.keys.down = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [performJump, performAllowFriendly]);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastTime = performance.now();

    const loop = (timestamp: number) => {
      animationId = requestAnimationFrame(loop);

      const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
      lastTime = timestamp;

      if (!isPlaying || isPaused || isGameOver || isLevelCleared) {
        // Draw static frame
        renderFrame(ctx, canvas.width, canvas.height);
        return;
      }

      // Update Screen Shake
      if (stateRef.current.screenShake > 0) {
        stateRef.current.screenShake -= dt * 25;
        if (stateRef.current.screenShake < 0) stateRef.current.screenShake = 0;
      }

      // Spawn Entities according to level interval
      const now = Date.now();
      if (
        now - stateRef.current.lastSpawnTime > currentLevel.spawnInterval &&
        stateRef.current.entities.length < 5 &&
        entitiesProcessed + stateRef.current.entities.filter((e) => !e.processed).length <
          currentLevel.targetEntities
      ) {
        spawnEntity(currentLevel);
        stateRef.current.lastSpawnTime = now;
      }

      // Update Mario Physics & Controls
      const { mario, keys, groundY } = stateRef.current;
      const speed = 220;

      if (keys.left) {
        mario.vx = -speed;
        mario.facing = 'left';
      } else if (keys.right) {
        mario.vx = speed;
        mario.facing = 'right';
      } else {
        mario.vx *= 0.7; // friction
      }

      // Gravity
      mario.vy += 26; // gravity
      mario.x += mario.vx * dt;
      mario.y += mario.vy * dt;

      // Restrict horizontal bounds
      const minX = stateRef.current.castleX + 35;
      const maxX = canvas.width - 50;
      if (mario.x < minX) mario.x = minX;
      if (mario.x > maxX) mario.x = maxX;

      // Floor collision
      if (mario.y + mario.height >= groundY) {
        mario.y = groundY - mario.height;
        mario.vy = 0;
        mario.isGrounded = true;
        mario.isJumping = false;
      }

      // Animation frame
      if (Math.abs(mario.vx) > 10 && mario.isGrounded) {
        mario.animFrame += dt * 10;
      } else {
        mario.animFrame = 0;
      }

      // Update Entities
      let nearest: GameEntity | null = null;
      let minDistance = Infinity;

      for (let i = stateRef.current.entities.length - 1; i >= 0; i--) {
        const entity = stateRef.current.entities[i];

        if (!entity.processed) {
          entity.x += entity.vx;

          // Track nearest entity to Mario
          const dist = entity.x - mario.x;
          if (dist > -40 && dist < minDistance) {
            minDistance = dist;
            nearest = entity;
          }

          // Check if entity reached castle (Unattended / Let Pass automatically)
          if (entity.x <= stateRef.current.castleX + 20) {
            handleClassification(entity, 'allow_friendly');
            continue;
          }

          // Check Mario Stomp Collision!
          // Stomp occurs when Mario is falling downwards (mario.vy > 0)
          // and Mario's feet intersect with the entity's head/top box.
          const marioFeet = mario.y + mario.height;
          const entityHead = entity.y;
          const horizontalOverlap =
            mario.x + mario.width > entity.x + 4 && mario.x < entity.x + entity.width - 4;

          if (
            horizontalOverlap &&
            marioFeet >= entityHead &&
            marioFeet <= entityHead + 22 &&
            mario.vy > 0
          ) {
            // Stomp execution!
            mario.vy = -8.5; // Bounce Mario up!
            handleClassification(entity, 'stomp_threat');
            continue;
          }

          // Side walk-through / Bump without stomp:
          // If Mario touches entity from side while not jumping on top
          const verticalOverlap = mario.y < entity.y + entity.height && marioFeet > entity.y + 10;
          if (horizontalOverlap && verticalOverlap && !mario.isJumping) {
            // Contextual hint: player walked into it without jumping
            // Can be treated as an allow/pass or bump
          }
        } else {
          // If already processed, let it fade or fall
          entity.y += 3;
          if (entity.y > canvas.height + 50) {
            stateRef.current.entities.splice(i, 1);
          }
        }
      }

      setNearestEntity(nearest);

      // Update Floating Texts
      for (let i = stateRef.current.floatingTexts.length - 1; i >= 0; i--) {
        const ft = stateRef.current.floatingTexts[i];
        ft.y += ft.vy;
        ft.opacity -= dt * 0.7;
        if (ft.opacity <= 0) {
          stateRef.current.floatingTexts.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = stateRef.current.particles.length - 1; i >= 0; i--) {
        const p = stateRef.current.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life -= dt * 60;
        if (p.life <= 0) {
          stateRef.current.particles.splice(i, 1);
        }
      }

      // Check Game Over Conditions
      if (marioLives <= 0 || castleHealth <= 0) {
        setIsGameOver(true);
        setIsPlaying(false);
      }

      // Render
      renderFrame(ctx, canvas.width, canvas.height);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [
    isPlaying,
    isPaused,
    isGameOver,
    isLevelCleared,
    currentLevel,
    entitiesProcessed,
    marioLives,
    castleHealth,
    spawnEntity,
    handleClassification,
  ]);

  // Draw Full Retro Mario Scene
  const renderFrame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();

    // Screen Shake effect
    if (stateRef.current.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * stateRef.current.screenShake;
      const shakeY = (Math.random() - 0.5) * stateRef.current.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Sky gradient (Classic 8-bit sky blue)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#5C94FC');
    skyGrad.addColorStop(0.7, '#6EA2FC');
    skyGrad.addColorStop(1, '#90BBFE');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Fluffy pixel clouds
    drawCloud(ctx, 120, 45, 1.2);
    drawCloud(ctx, 380, 70, 0.9);
    drawCloud(ctx, 640, 50, 1.1);

    // Green Background Hills
    drawHill(ctx, 220, stateRef.current.groundY, 90, 60, '#00A800');
    drawHill(ctx, 480, stateRef.current.groundY, 140, 95, '#008800');

    // Floating Mystery ? Blocks & Brick platforms
    drawBrickBlock(ctx, 280, 170);
    drawQuestionBlock(ctx, 312, 170, Math.floor(Date.now() / 300) % 2 === 0);
    drawBrickBlock(ctx, 344, 170);

    // Ground: Grass top and brown retro dirt bricks
    const groundY = stateRef.current.groundY;
    ctx.fillStyle = '#00A800'; // Green grass top
    ctx.fillRect(0, groundY, width, 10);

    // Soil pattern
    ctx.fillStyle = '#C84C0C';
    ctx.fillRect(0, groundY + 10, width, height - groundY - 10);

    // Ground brick grid lines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    for (let x = 0; x < width; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 10);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = groundY + 10; y < height; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Peach's Castle / Safety Pipe on the left
    drawCastle(ctx, stateRef.current.castleX, groundY);

    // Draw Entities
    stateRef.current.entities.forEach((entity) => {
      drawEntity(ctx, entity);
    });

    // Draw Mario Hero
    drawMario(ctx, stateRef.current.mario);

    // Draw Particles
    stateRef.current.particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    // Draw Floating Texts (+VP, +VN, FP, FN)
    stateRef.current.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.opacity);
      ctx.font = '10px "Press Start 2P", monospace';

      // Background pill
      const textWidth = ctx.measureText(ft.text).width;
      ctx.fillStyle = ft.bg;
      ctx.fillRect(ft.x - 6, ft.y - 14, textWidth + 12, 20);
      ctx.strokeStyle = ft.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ft.x - 6, ft.y - 14, textWidth + 12, 20);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();
  };

  // Pixel Cloud Helper
  const drawCloud = (ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#FFFFFF';

    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.arc(20, -6, 22, 0, Math.PI * 2);
    ctx.arc(42, 0, 18, 0, Math.PI * 2);
    ctx.arc(20, 8, 14, 0, Math.PI * 2);
    ctx.fill();

    // Cloud shadow
    ctx.fillStyle = '#D9E8F5';
    ctx.beginPath();
    ctx.arc(20, 10, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Pixel Hill Helper
  const drawHill = (
    ctx: CanvasRenderingContext2D,
    hx: number,
    hy: number,
    hw: number,
    hh: number,
    color: string
  ) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(hx, hy, hw / 2, hh, 0, Math.PI, 0);
    ctx.fill();

    // Hill dots
    ctx.fillStyle = '#000000';
    ctx.fillRect(hx - 12, hy - hh * 0.6, 4, 12);
    ctx.fillRect(hx + 10, hy - hh * 0.5, 4, 10);
    ctx.restore();
  };

  // Brick block
  const drawBrickBlock = (ctx: CanvasRenderingContext2D, bx: number, by: number) => {
    ctx.fillStyle = '#D86422';
    ctx.fillRect(bx, by, 24, 24);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, 24, 24);

    // Brick pattern
    ctx.strokeRect(bx + 2, by + 2, 9, 8);
    ctx.strokeRect(bx + 13, by + 2, 9, 8);
    ctx.strokeRect(bx + 6, by + 12, 11, 8);
  };

  // Mystery ? block
  const drawQuestionBlock = (
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    blink: boolean
  ) => {
    ctx.fillStyle = blink ? '#FCB42C' : '#E4981C';
    ctx.fillRect(bx, by, 24, 24);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, 24, 24);

    // Question mark
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('?', bx + 7, by + 17);
  };

  // Castle / Warp Pipe
  const drawCastle = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
    ctx.save();
    // Green Pipe Entrance for safe allies
    ctx.fillStyle = '#00A800';
    ctx.fillRect(cx - 15, cy - 50, 42, 50);
    ctx.fillRect(cx - 19, cy - 65, 50, 18);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 15, cy - 50, 42, 50);
    ctx.strokeRect(cx - 19, cy - 65, 50, 18);

    // Pipe highlight
    ctx.fillStyle = '#80D010';
    ctx.fillRect(cx - 10, cy - 48, 6, 46);
    ctx.fillRect(cx - 14, cy - 63, 6, 14);

    // Castle Flag
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx - 35, cy - 110, 4, 110);
    ctx.fillStyle = castleHealth > 30 ? '#10B981' : '#EF4444';
    ctx.beginPath();
    ctx.moveTo(cx - 35, cy - 110);
    ctx.lineTo(cx - 65, cy - 95);
    ctx.lineTo(cx - 35, cy - 80);
    ctx.fill();

    // Castle Label
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#000000';
    ctx.fillText('CASTILLO', cx - 42, cy - 116);
    ctx.fillStyle = '#FBBF24';
    ctx.fillText('CASTILLO', cx - 43, cy - 117);

    ctx.restore();
  };

  // Draw Entity (Goomba vs Toad)
  const drawEntity = (ctx: CanvasRenderingContext2D, entity: GameEntity) => {
    ctx.save();
    ctx.translate(entity.x, entity.y);

    const isThreat = entity.isRealThreat;

    if (isThreat) {
      // GOOMBA (Threat / Positivo Real)
      // Head / Body mushroom shaped brown
      ctx.fillStyle = entity.appearance.bodyColor;
      ctx.beginPath();
      ctx.ellipse(16, 14, 14, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Angry Eyebrows & Eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(8, 8, 4, 8);
      ctx.fillRect(18, 8, 4, 8);

      ctx.fillStyle = '#000000';
      ctx.fillRect(10, 10, 2, 4);
      ctx.fillRect(18, 10, 2, 4);

      // Angled eyebrows
      ctx.beginPath();
      ctx.moveTo(6, 6);
      ctx.lineTo(13, 9);
      ctx.moveTo(24, 6);
      ctx.lineTo(17, 9);
      ctx.stroke();

      // Sharp fangs
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(11, 20);
      ctx.lineTo(13, 16);
      ctx.lineTo(15, 20);
      ctx.moveTo(17, 20);
      ctx.lineTo(19, 16);
      ctx.lineTo(21, 20);
      ctx.fill();

      // Spikes on head if detected
      if (entity.telemetry.spikesDetected) {
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(13, 2);
        ctx.lineTo(16, -6);
        ctx.lineTo(19, 2);
        ctx.fill();
        ctx.stroke();
      }

      // Disguise hat if applicable
      if (entity.appearance.hatColor) {
        ctx.fillStyle = entity.appearance.hatColor;
        ctx.fillRect(8, -2, 16, 5);
        ctx.fillStyle = '#EC4899';
        ctx.fillRect(14, -6, 5, 5); // Fake flower
      }

      // Black walking feet
      const footCycle = Math.sin(Date.now() / 100) * 3;
      ctx.fillStyle = '#000000';
      ctx.fillRect(6 + footCycle, 24, 7, 7);
      ctx.fillRect(17 - footCycle, 24, 7, 7);
    } else {
      // TOAD (Friendly Ally / Negativo Real)
      // Large white mushroom cap with dots
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(16, 12, 14, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Colored spots on cap (Red or Blue)
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(16, 6, 5, 0, Math.PI * 2);
      ctx.arc(7, 13, 4, 0, Math.PI * 2);
      ctx.arc(25, 13, 4, 0, Math.PI * 2);
      ctx.fill();

      // Innocent Face
      ctx.fillStyle = '#FFE0BD';
      ctx.fillRect(9, 17, 14, 9);
      ctx.strokeRect(9, 17, 14, 9);

      // Cute round happy eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(11, 19, 2, 4);
      ctx.fillRect(19, 19, 2, 4);

      // Smile
      ctx.beginPath();
      ctx.arc(16, 22, 3, 0, Math.PI);
      ctx.stroke();

      // Little blue vest & feet
      ctx.fillStyle = '#2563EB';
      ctx.fillRect(8, 25, 16, 5);

      const footCycle = Math.sin(Date.now() / 100) * 3;
      ctx.fillStyle = '#854D0E';
      ctx.fillRect(8 + footCycle, 29, 5, 5);
      ctx.fillRect(18 - footCycle, 29, 5, 5);
    }

    // Telemetry indicator badge above entity
    if (showTelemetry) {
      const prob = entity.telemetry.threatProbability;
      const badgeColor = prob > 0.6 ? '#EF4444' : prob < 0.4 ? '#10B981' : '#F59E0B';

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(-2, -22, 36, 14);
      ctx.strokeStyle = badgeColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(-2, -22, 36, 14);

      ctx.fillStyle = badgeColor;
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText(`${Math.round(prob * 100)}%`, 2, -12);
    }

    ctx.restore();
  };

  // Draw Mario Character
  const drawMario = (
    ctx: CanvasRenderingContext2D,
    mario: typeof stateRef.current.mario
  ) => {
    ctx.save();
    ctx.translate(mario.x, mario.y);

    if (mario.facing === 'left') {
      ctx.scale(-1, 1);
      ctx.translate(-mario.width, 0);
    }

    // Mario Cap (Red)
    ctx.fillStyle = '#E52521';
    ctx.fillRect(6, 2, 20, 8);
    ctx.fillRect(12, 0, 16, 5);

    // Face / Skin tone
    ctx.fillStyle = '#FCD8A8';
    ctx.fillRect(8, 10, 16, 10);

    // Brown hair / mustache / eyes
    ctx.fillStyle = '#6B4423';
    ctx.fillRect(6, 8, 4, 8); // Hair back
    ctx.fillRect(10, 15, 14, 4); // Mustache
    ctx.fillRect(18, 11, 3, 3); // Eye
    ctx.fillStyle = '#FCD8A8';
    ctx.fillRect(20, 13, 6, 4); // Big nose

    // Red Shirt
    ctx.fillStyle = '#E52521';
    ctx.fillRect(6, 20, 20, 10);

    // Blue Overalls
    ctx.fillStyle = '#0026FF';
    ctx.fillRect(8, 24, 16, 12);
    ctx.fillRect(10, 20, 4, 6); // Suspenders
    ctx.fillRect(18, 20, 4, 6);

    // Yellow buttons
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(11, 23, 2, 2);
    ctx.fillRect(19, 23, 2, 2);

    // White Gloves
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2, 23, 5, 5);
    ctx.fillRect(24, 23, 5, 5);

    // Brown Boots with walk cycle
    const step = Math.floor(mario.animFrame) % 3;
    ctx.fillStyle = '#6B4423';
    if (!mario.isGrounded) {
      // Jump pose
      ctx.fillRect(6, 34, 8, 6);
      ctx.fillRect(18, 32, 8, 6);
    } else if (step === 0) {
      ctx.fillRect(6, 36, 8, 6);
      ctx.fillRect(18, 36, 8, 6);
    } else if (step === 1) {
      ctx.fillRect(4, 35, 8, 6);
      ctx.fillRect(18, 37, 8, 6);
    } else {
      ctx.fillRect(8, 37, 8, 6);
      ctx.fillRect(20, 35, 8, 6);
    }

    ctx.restore();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Game HUD Bar */}
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* World and score */}
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">NIVEL</span>
            <span className="font-pixel text-xs sm:text-sm text-yellow-400">
              {currentLevel.name.split(':')[0]}
            </span>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <span className="text-[10px] text-slate-400 font-mono block">PUNTOS</span>
            <span className="font-pixel text-xs sm:text-sm text-white">{score}</span>
          </div>
        </div>

        {/* Castle Health & Mario Lives */}
        <div className="flex items-center gap-4">
          {/* Mario Lives */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="font-pixel text-xs text-red-400">x{marioLives}</span>
          </div>

          {/* Castle Health (Damage increases with Falsos Negativos!) */}
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Shield className="w-4 h-4 text-sky-400" />
            <div className="flex flex-col">
              <div className="flex justify-between text-[9px] font-mono text-slate-300">
                <span>Castillo:</span>
                <span className={castleHealth < 40 ? 'text-rose-400 font-bold' : 'text-sky-300'}>
                  {castleHealth}%
                </span>
              </div>
              <div className="w-20 sm:w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div
                  className={`h-full transition-all duration-300 ${
                    castleHealth > 50
                      ? 'bg-sky-400'
                      : castleHealth > 25
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${castleHealth}%` }}
                />
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="hidden sm:block text-right">
            <span className="text-[9px] text-slate-400 font-mono block">EVALUADOS</span>
            <span className="font-pixel text-xs text-emerald-400">
              {entitiesProcessed} / {currentLevel.targetEntities}
            </span>
          </div>
        </div>

        {/* Controls toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTelemetry(!showTelemetry)}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              showTelemetry
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Activar/Desactivar Radar de Probabilidades"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden md:inline font-mono text-[11px]">Radar</span>
          </button>

          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {!isPlaying && !isGameOver && !isLevelCleared && (
            <button
              onClick={() => resetGame(currentLevelIndex)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5" />
              <span>JUGAR</span>
            </button>
          )}

          {isPlaying && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              title={isPaused ? 'Reanudar' : 'Pausar'}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
            </button>
          )}

          <button
            onClick={() => resetGame(currentLevelIndex)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Reiniciar Nivel"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Container with Overlay CRT screen style */}
      <div className="relative rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={800}
          height={380}
          className="w-full h-auto block max-h-[460px] object-cover"
        />

        {/* Scanlines overlay for arcade feeling */}
        <div className="absolute inset-0 arcade-scanlines pointer-events-none opacity-40" />

        {/* Start Game Overlay */}
        {!isPlaying && !isGameOver && !isLevelCleared && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/50 mb-3 border-2 border-red-400">
              <span className="font-pixel text-xl text-white">M</span>
            </div>
            <h2 className="font-pixel text-base sm:text-lg text-yellow-400 mb-2">
              SUPER CONFUSION BROS
            </h2>
            <p className="text-sm text-slate-300 max-w-lg mb-4 leading-relaxed">
              Mario es el <strong>clasificador de amenazas del Reino Champiñón</strong>. Pisar a un
              villano es un <strong>Verdadero Positivo</strong>. Proteger a un inocente es un{' '}
              <strong>Verdadero Negativo</strong>. ¡Pero cuidado con equivocarte!
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-md w-full mb-5 text-left text-xs font-mono">
              <div className="bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-lg">
                <span className="text-emerald-400 font-bold block mb-1">
                  👾 AMENAZA (Goomba)
                </span>
                <span className="text-slate-300 text-[11px]">
                  ¡Písalo con [ESPACIO]! Si pasa al castillo -&gt; <strong>Falso Negativo (FN)</strong>.
                </span>
              </div>
              <div className="bg-sky-950/60 border border-sky-500/40 p-2.5 rounded-lg">
                <span className="text-sky-400 font-bold block mb-1">
                  🍄 INOCENTE (Toad)
                </span>
                <span className="text-slate-300 text-[11px]">
                  ¡Déjalo pasar con [Z]! Si lo pisas -&gt; <strong>Falso Positivo (FP)</strong>.
                </span>
              </div>
            </div>

            <button
              onClick={() => resetGame(currentLevelIndex)}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-pixel text-xs sm:text-sm shadow-xl shadow-red-950/80 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>INICIAR MISIÓN</span>
            </button>
          </div>
        )}

        {/* Level Cleared Overlay */}
        {isLevelCleared && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 mb-3 shadow-xl shadow-emerald-500/40">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-pixel text-lg text-emerald-400 mb-1">
              ¡NIVEL COMPLETADO!
            </h3>
            <p className="text-sm text-slate-300 max-w-md mb-4">
              Has evaluado todas las entidades del {currentLevel.name}. Observa la matriz de
              confusión abajo para analizar tu Precisión y Sensibilidad.
            </p>
            <div className="flex gap-3">
              {currentLevelIndex < LEVELS.length - 1 ? (
                <button
                  onClick={() => resetGame(currentLevelIndex + 1)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all hover:scale-105"
                >
                  <span>SIGUIENTE MUNDO</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => resetGame(0)}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-pixel text-xs flex items-center gap-2 shadow-lg shadow-amber-950 transition-all hover:scale-105"
                >
                  <span>REPETIR CAMPAÑA</span>
                </button>
              )}
              <button
                onClick={() => resetGame(currentLevelIndex)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs border border-slate-700"
              >
                REINTENTAR
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-rose-600 flex items-center justify-center text-white mb-3 shadow-xl shadow-rose-600/40">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="font-pixel text-lg text-rose-400 mb-1">GAME OVER</h3>
            <p className="text-sm text-slate-300 max-w-md mb-4">
              {castleHealth <= 0
                ? '¡Demasiados Falsos Negativos! Los monstruos que dejaste pasar derribaron el Castillo.'
                : '¡Demasiados Falsos Positivos! Mario agotó sus vidas por atacar a ciudadanos inocentes.'}
            </p>
            <button
              onClick={() => resetGame(currentLevelIndex)}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-pixel text-xs flex items-center gap-2 shadow-xl shadow-rose-950 transition-all hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REINTENTAR NIVEL</span>
            </button>
          </div>
        )}

        {/* Telemetry Sensor Card on bottom-left inside canvas */}
        {isPlaying && showTelemetry && nearestEntity && (
          <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-cyan-500/50 rounded-xl p-2.5 max-w-xs shadow-xl backdrop-blur-sm pointer-events-none">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-1.5">
              <span className="text-[9px] font-pixel text-cyan-400 flex items-center gap-1">
                <Eye className="w-3 h-3 text-cyan-400" />
                RADAR CLASIFICADOR
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                {nearestEntity.telemetry.disguiseSuspected ? '⚠️ Señal Ambigua' : 'Señal Clara'}
              </span>
            </div>
            <div className="text-xs font-bold text-white truncate mb-1">
              {nearestEntity.name}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300">
              <div>
                Prob. Amenaza:
                <span
                  className={`font-bold ml-1 ${
                    nearestEntity.telemetry.threatProbability > 0.5
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {Math.round(nearestEntity.telemetry.threatProbability * 100)}%
                </span>
              </div>
              <div>
                Pinchos:{' '}
                <span className="text-amber-300">
                  {nearestEntity.telemetry.spikesDetected ? 'DETECTADOS' : 'NO'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Touch & On-screen Action Controls (Ideal for mobile and quick desktop clicks) */}
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-3 shadow-lg flex flex-wrap items-center justify-between gap-3">
        {/* Direction buttons */}
        <div className="flex items-center gap-2">
          <button
            onMouseDown={() => (stateRef.current.keys.left = true)}
            onMouseUp={() => (stateRef.current.keys.left = false)}
            onTouchStart={() => (stateRef.current.keys.left = true)}
            onTouchEnd={() => (stateRef.current.keys.left = false)}
            className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 flex items-center justify-center text-slate-200 transition-colors"
            title="Mover Izquierda (A / Flecha Izq)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onMouseDown={() => (stateRef.current.keys.right = true)}
            onMouseUp={() => (stateRef.current.keys.right = false)}
            onTouchStart={() => (stateRef.current.keys.right = true)}
            onTouchEnd={() => (stateRef.current.keys.right = false)}
            className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 flex items-center justify-center text-slate-200 transition-colors"
            title="Mover Derecha (D / Flecha Der)"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Classification Action Buttons */}
        <div className="flex items-center gap-2.5 flex-1 justify-end">
          {/* Allow / Pass (Negative prediction) */}
          <button
            onClick={performAllowFriendly}
            className="px-4 py-2.5 rounded-xl bg-sky-950 hover:bg-sky-900 active:bg-sky-800 border-2 border-sky-500/80 text-sky-200 font-pixel text-[10px] sm:text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <ArrowDown className="w-4 h-4 text-sky-400" />
            <span>DEJAR PASAR (PREDECIR INOCENTE) [Z]</span>
          </button>

          {/* Jump / Stomp (Positive prediction) */}
          <button
            onClick={performJump}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 border-2 border-red-400 text-white font-pixel text-[10px] sm:text-xs flex items-center gap-2 shadow-lg shadow-red-950 transition-transform active:scale-95"
          >
            <ArrowUp className="w-4 h-4 text-white" />
            <span>SALTAR Y PISAR (PREDECIR AMENAZA) [ESPACIO]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
