import * as THREE from 'three';
import type { RunResult, WorldId } from '../types';
import { haptic, sfx } from '../audio';

export interface NeonRush3DCallbacks {
  onScore?: (score: number) => void;
  onCoins?: (coins: number) => void;
  onCombo?: (combo: number, label: string) => void;
  onNearMiss?: () => void;
  onPowerUp?: (type: string) => void;
  onGameOver?: (result: RunResult) => void;
  onSpeedChange?: (speed: number) => void;
  onPowerUpStatus?: (type: string | null, time: number) => void;
  onDistanceChange?: (distance: number) => void;
}

export interface NeonRush3DConfig {
  accentColor?: string;
  worldId?: string;
  graphics: 'low' | 'medium' | 'high';
  reducedEffects?: boolean;
  sensitivity?: number;
  haptics?: boolean;
}

type Obstacle = {
  group: THREE.Group;
  lane: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  passed: boolean;
};

type Coin = {
  mesh: THREE.Mesh;
  lane: number;
  z: number;
  collected: boolean;
};

export class NeonRush3D {
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;
  private callbacks: NeonRush3DCallbacks;
  private config: NeonRush3DConfig;

  private player!: THREE.Group;
  private playerBody!: THREE.Group;
  private leftLeg!: THREE.Mesh;
  private rightLeg!: THREE.Mesh;
  private leftArm!: THREE.Mesh;
  private rightArm!: THREE.Mesh;

  private laneX = [-3.2, 0, 3.2];
  private lane = 1;
  private targetLane = 1;

  private playerY = 0;
  private jumping = false;
  private verticalVelocity = 0;
  private sliding = false;
  private slideTimer = 0;

  private triggerHaptic(pattern: number | number[]) {
    if (this.config.haptics !== false) haptic(pattern);
  }

  private obstacles: Obstacle[] = [];
  private coins: Coin[] = [];
  private powerUps: THREE.Group[] = [];
  private traffic: THREE.Group[] = [];
  private flyingCars: THREE.Group[] = [];
  private buildings: THREE.Group[] = [];
  private roadLines: THREE.Mesh[] = [];
  private reflectionStrips: THREE.Mesh[] = [];

  private rain!: THREE.Points;
  private rainPositions!: Float32Array;

  private activePowerUp: string | null = null;
  private powerUpTimer = 0;
  private shieldHits = 0;

  private running = false;
  private paused = false;
  private gameOver = false;
  private animationFrame = 0;
  private lastTime = 0;
  private clock = new THREE.Clock();

  private speed = 18;
  private score = 0;
  private coinsCollected = 0;
  private combo = 0;
  private distance = 0;
  private level = 1;
  private jumps = 0;
  private dodges = 0;
  private powerupsUsed = 0;
  private nearMisses = 0;
  private maxSpeed = 18;

  private spawnTimer = 0;
  private coinTimer = 0;
  private difficultyTimer = 0;
  private nearMissCooldown = 0;

  private touchStartX = 0;
  private touchStartY = 0;

  constructor(
    canvas: HTMLCanvasElement,
    callbacks: NeonRush3DCallbacks = {},
    config: NeonRush3DConfig = {
      graphics: 'high',
      worldId: 'neon-city',
    },
  ) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.config = config;

    this.camera = new THREE.PerspectiveCamera(
      60,
      (canvas.clientWidth || window.innerWidth) /
        Math.max(canvas.clientHeight || window.innerHeight, 1),
      0.1,
      500,
    );

    this.camera.position.set(0, 4.2, 10);
    this.camera.lookAt(0, 1.5, -35);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: config.graphics !== 'low',
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, config.graphics === 'low' ? 1 : 1.25),
    );
    this.renderer.setSize(
      canvas.clientWidth || window.innerWidth,
      canvas.clientHeight || window.innerHeight,
      false,
    );
    this.renderer.shadowMap.enabled = config.graphics !== 'low';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.addLights();
    this.createWorld();
    this.player = this.createPlayer();
    this.scene.add(this.player);

    this.playerBody = this.player.getObjectByName('playerBody') as THREE.Group;
    this.leftLeg = this.player.getObjectByName('leftLeg') as THREE.Mesh;
    this.rightLeg = this.player.getObjectByName('rightLeg') as THREE.Mesh;
    this.leftArm = this.player.getObjectByName('leftArm') as THREE.Mesh;
    this.rightArm = this.player.getObjectByName('rightArm') as THREE.Mesh;

    this.bindControls();
    this.handleResize();
  }

  private addLights() {
    const ambient = new THREE.AmbientLight('#7dd3fc', 1.4);
    this.scene.add(ambient);

    const moon = new THREE.DirectionalLight('#dbeafe', 2.2);
    moon.position.set(-20, 35, 20);
    moon.castShadow = this.config.graphics !== 'low';
    this.scene.add(moon);

    const cyan = new THREE.PointLight('#00d9ff', this.config.reducedEffects ? 40 : 80, 55);
    cyan.position.set(-15, 6, -25);
    this.scene.add(cyan);

    const pink = new THREE.PointLight('#ff1688', this.config.reducedEffects ? 45 : 90, 60);
    pink.position.set(15, 8, -45);
    this.scene.add(pink);

    const purple = new THREE.PointLight('#8b5cf6', this.config.reducedEffects ? 35 : 70, 70);
    purple.position.set(0, 12, -90);
    this.scene.add(purple);
  }

  private createWorld() {
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 260),
      new THREE.MeshStandardMaterial({
        color: '#030712',
        roughness: 0.3,
        metalness: 0.65,
      }),
    );

    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.05, -105);
    road.receiveShadow = true;
    this.scene.add(road);

    const sidewalkMaterial = new THREE.MeshStandardMaterial({
      color: '#07111f',
      roughness: 0.7,
      metalness: 0.35,
    });

    for (const x of [-8.5, 8.5]) {
      const sidewalk = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.35, 260),
        sidewalkMaterial,
      );
      sidewalk.position.set(x, 0, -105);
      this.scene.add(sidewalk);
    }

    const lineMaterial = new THREE.MeshBasicMaterial({
      color: this.config.accentColor ?? '#67e8f9',
    });

    for (const x of [-1.7, 1.7]) {
      for (let i = 0; i < 18; i++) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.025, 5.5),
          lineMaterial,
        );
        line.position.set(x, 0.025, -i * 14);
        this.scene.add(line);
        this.roadLines.push(line);
      }
    }

    const edgeMaterial = new THREE.MeshBasicMaterial({
      color: '#22d3ee',
    });

    for (const x of [-6.7, 6.7]) {
      const edge = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.04, 260),
        edgeMaterial,
      );
      edge.position.set(x, 0.04, -105);
      this.scene.add(edge);
    }

    this.createRoadReflections();
    this.createBuildings();
    this.createFlyingCars();
    this.createPowerUps();
    this.createRain();
  }

  private createBuildings() {
    for (let i = 0; i < 18; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const height = 7 + Math.random() * 23;
      const width = 4 + Math.random() * 4;
      const depth = 7 + Math.random() * 9;

      const group = new THREE.Group();

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(
            0.58 + Math.random() * 0.12,
            0.55,
            0.055 + Math.random() * 0.045,
          ),
          roughness: 0.8,
          metalness: 0.3,
        }),
      );

      body.position.y = height / 2;
      group.add(body);

      const neon = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.72, 0.12, 0.08),
        new THREE.MeshBasicMaterial({
          color: i % 3 === 0 ? '#ff1493' : '#00d9ff',
        }),
      );

      neon.position.set(0, height * 0.62, depth / 2 + 0.05);
      group.add(neon);

      const windowMaterial = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? '#22d3ee' : '#f472b6',
        transparent: true,
        opacity: 0.72,
      });

      const rows = Math.max(3, Math.floor(height / 4));
      const columns = 3;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          if (Math.random() < 0.48) continue;

          const window = new THREE.Mesh(
            new THREE.BoxGeometry(0.34, 0.22, 0.035),
            windowMaterial,
          );

          const spacing = Math.max(0.7, width / (columns + 1));

          window.position.set(
            (col - 1) * spacing,
            1.2 + row * 1.15,
            depth / 2 + 0.07,
          );

          group.add(window);
        }
      }

      group.position.set(
        side * (10 + Math.random() * 9),
        0,
        -15 - i * 9 - Math.random() * 20,
      );

      this.scene.add(group);
      this.buildings.push(group);
    }
  }

  private createRain() {
    const count = this.config.reducedEffects ? 60 : (this.config.graphics === 'low' ? 120 : 400);

    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = Math.random() * 22;
      positions[i * 3 + 2] = -Math.random() * 220;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3),
    );

    const material = new THREE.PointsMaterial({
      color: '#8be9ff',
      size: this.config.graphics === 'low' ? 0.045 : 0.065,
      transparent: true,
      opacity: this.config.reducedEffects ? 0.35 : 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.rain = new THREE.Points(geometry, material);
    this.rainPositions = positions;
    this.scene.add(this.rain);
  }

  private updateRain(delta: number) {
    if (!this.rain || !this.rainPositions) return;

    const positions = this.rainPositions;
    const count = positions.length / 3;

    for (let i = 0; i < count; i++) {
      const index = i * 3;

      positions[index + 1] -= (28 + this.speed * 0.35) * delta;
      positions[index + 2] += this.speed * 0.35 * delta;

      if (positions[index + 1] < 0) {
        positions[index + 1] = 18 + Math.random() * 8;
        positions[index] = (Math.random() - 0.5) * 24;
      }

      if (positions[index + 2] > 25) {
        positions[index + 2] = -210 - Math.random() * 40;
      }
    }

    const attribute = this.rain.geometry.getAttribute(
      'position',
    ) as THREE.BufferAttribute;

    attribute.needsUpdate = true;
  }

  private createTraffic() {
    for (let i = 0; i < 8; i++) {
      const car = new THREE.Group();

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.55, 3.1),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? '#111827' : '#1e293b',
          emissive: i % 2 === 0 ? '#071a2b' : '#19051c',
          emissiveIntensity: 0.8,
          metalness: 0.8,
          roughness: 0.25,
        }),
      );

      body.position.y = 0.55;
      car.add(body);

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.35, 0.5, 1.45),
        new THREE.MeshStandardMaterial({
          color: '#0f172a',
          transparent: true,
          opacity: 0.9,
          metalness: 0.9,
          roughness: 0.15,
        }),
      );

      cabin.position.set(0, 0.95, 0.15);
      car.add(cabin);

      const frontLight = new THREE.Mesh(
        new THREE.BoxGeometry(1.35, 0.09, 0.06),
        new THREE.MeshBasicMaterial({ color: '#00eaff' }),
      );

      frontLight.position.set(0, 0.62, -1.57);
      car.add(frontLight);

      const rearLight = new THREE.Mesh(
        new THREE.BoxGeometry(1.35, 0.09, 0.06),
        new THREE.MeshBasicMaterial({ color: '#ff1688' }),
      );

      rearLight.position.set(0, 0.62, 1.57);
      car.add(rearLight);

      const lane = i % 3;

      car.position.set(
        this.laneX[lane],
        0,
        -35 - i * 25,
      );

      car.userData.speedFactor = 0.55 + Math.random() * 0.25;

      this.scene.add(car);

    }
  }

  private createFlyingCars() {
    for (let i = 0; i < 5; i++) {
      const car = new THREE.Group();

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.38, 4.2),
        new THREE.MeshStandardMaterial({
          color: '#101827',
          emissive: i % 2 === 0 ? '#062b45' : '#2a0828',
          emissiveIntensity: 1,
          metalness: 0.85,
          roughness: 0.2,
        }),
      );

      car.add(body);

      const canopy = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 0.32, 1.7),
        new THREE.MeshBasicMaterial({
          color: '#38bdf8',
          transparent: true,
          opacity: 0.42,
        }),
      );

      canopy.position.y = 0.32;
      car.add(canopy);

      const light = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.06, 0.08),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? '#00eaff' : '#ff1688',
        }),
      );

      light.position.set(0, 0.08, -2.1);
      car.add(light);

      car.position.set(
        (Math.random() - 0.5) * 32,
        9 + Math.random() * 12,
        -50 - i * 42,
      );

      car.rotation.y = Math.PI * 0.5;
      car.userData.flightSpeed = 3 + Math.random() * 5;

      this.scene.add(car);

    }
  }

  private createRoadReflections() {
    const colors = ['#00d9ff', '#ff1688', '#8b5cf6'];

    for (let i = 0; i < 18; i++) {
      const strip = new THREE.Mesh(
        new THREE.PlaneGeometry(
          0.35 + Math.random() * 0.7,
          3 + Math.random() * 5,
        ),
        new THREE.MeshBasicMaterial({
          color: colors[i % colors.length],
          transparent: true,
          opacity: 0.12,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );

      strip.rotation.x = -Math.PI / 2;

      strip.position.set(
        (Math.random() - 0.5) * 12,
        0.012,
        -10 - i * 12,
      );

      this.scene.add(strip);
      this.reflectionStrips.push(strip);
    }
  }

  private createPowerUps() {
    const types = ['MAGNET', 'SHIELD', 'TURBO'];

    for (let i = 0; i < 6; i++) {
      const group = new THREE.Group();
      const type = types[i % types.length];

      const color =
        type === 'MAGNET'
          ? '#facc15'
          : type === 'SHIELD'
            ? '#38bdf8'
            : '#fb7185';

      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.38, 1),
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 1.8,
          metalness: 0.5,
          roughness: 0.2,
        }),
      );

      group.add(core);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.58, 0.035, 8, 24),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.85,
        }),
      );

      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      group.position.set(
        this.laneX[i % 3],
        1.45,
        -130 - i * 75,
      );

      group.userData.type = type;

      this.scene.add(group);
      this.powerUps.push(group);
    }
  }

  private updatePowerUps(delta: number) {
    const movement = this.speed * delta;

    // MAGNET: nearby coins ko Kai ki taraf attract karo
    if (this.activePowerUp === "MAGNET") {
      for (const coin of this.coins) {
        if (coin.collected) continue;

        const dx = this.player.position.x - coin.mesh.position.x;
        const dy = (this.player.position.y + 1.2) - coin.mesh.position.y;
        const dz = this.player.position.z - coin.mesh.position.z;

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 12) {
          const pullStrength = Math.min(1, delta * 9);
          coin.mesh.position.x += dx * pullStrength;
          coin.mesh.position.y += dy * pullStrength;
          coin.mesh.position.z += dz * pullStrength;
        }
      }
    }


    for (const powerUp of this.powerUps) {
      powerUp.position.z += movement;
      powerUp.rotation.y += delta * 3;
      powerUp.rotation.z += delta * 1.5;

      const xDistance = Math.abs(
        this.player.position.x - powerUp.position.x,
      );

      const zDistance = Math.abs(
        this.player.position.z - powerUp.position.z,
      );

      const yDistance = Math.abs(
        this.player.position.y + 1.2 - powerUp.position.y,
      );

      // Magnet automatically attracts nearby power-ups/coins later.
      if (
        xDistance < 1.15 &&
        zDistance < 1.2 &&
        yDistance < 1.4
      ) {
        this.activatePowerUp(
          powerUp.userData.type as string,
        );

        powerUp.position.z = 100;
      }

      if (powerUp.position.z > 30) {
        powerUp.position.z = -260 - Math.random() * 100;
        powerUp.position.x =
          this.laneX[Math.floor(Math.random() * 3)];
      }
    }

    if (this.activePowerUp) {
      this.powerUpTimer -= delta;

      this.callbacks.onPowerUpStatus?.(
        this.activePowerUp,
        Math.max(0, this.powerUpTimer),
      );

      if (this.powerUpTimer <= 0) {
        this.activePowerUp = null;
        this.shieldHits = 0;
        this.callbacks.onPowerUpStatus?.(null, 0);
      }
    }
  }

  private activatePowerUp(type: string) {
    this.powerupsUsed += 1;
    sfx.powerup();
    this.triggerHaptic(45);
    this.activePowerUp = type;
    this.powerUpTimer = type === 'TURBO' ? 5 : 8;

    if (type === 'SHIELD') {
      this.shieldHits = 1;
    }

    this.callbacks.onPowerUp?.(type);
    this.callbacks.onPowerUpStatus?.(
      type,
      this.powerUpTimer,
    );
  }

  private createPlayer() {
    const root = new THREE.Group();
    root.name = 'kai';

    const body = new THREE.Group();
    body.name = 'playerBody';

    // ---------- MATERIALS ----------
    const skin = new THREE.MeshStandardMaterial({
      color: '#d99a78',
      roughness: 0.48,
      metalness: 0.05,
    });

    const jacket = new THREE.MeshStandardMaterial({
      color: '#075985',
      emissive: '#0088bb',
      emissiveIntensity: 1.15,
      metalness: 0.45,
      roughness: 0.3,
    });

    const jacketDark = new THREE.MeshStandardMaterial({
      color: '#06243a',
      emissive: '#00334d',
      emissiveIntensity: 0.65,
      metalness: 0.6,
      roughness: 0.28,
    });

    const pants = new THREE.MeshStandardMaterial({
      color: '#050811',
      emissive: '#020b16',
      emissiveIntensity: 0.35,
      metalness: 0.7,
      roughness: 0.28,
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: '#0a1020',
      emissive: '#07152b',
      emissiveIntensity: 0.35,
      roughness: 0.42,
      metalness: 0.15,
    });

    const neon = new THREE.MeshBasicMaterial({
      color: this.config.accentColor ?? '#00eaff',
    });

    const neonPink = new THREE.MeshBasicMaterial({
      color: '#ff1688',
    });

    // ---------- HEAD ----------
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 24, 18),
      skin,
    );
    head.scale.set(0.92, 1.08, 0.9);
    head.position.set(0, 3.02, -0.02);
    body.add(head);

    // Hair cap
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 20, 12),
      hairMaterial,
    );
    hair.scale.set(1, 0.55, 0.98);
    hair.position.set(0, 3.3, -0.04);
    body.add(hair);

    // Hair spikes
    for (let i = 0; i < 5; i++) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.13, 0.42, 6),
        hairMaterial,
      );

      spike.position.set(
        -0.32 + i * 0.16,
        3.45 + (i % 2) * 0.04,
        -0.03,
      );

      spike.rotation.z = (i - 2) * 0.12;
      body.add(spike);
    }

    // Cyber visor
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.1, 0.035),
      neon,
    );
    visor.position.set(0, 3.05, -0.47);
    body.add(visor);

    // ---------- NECK ----------
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.2, 0.25, 12),
      skin,
    );
    neck.position.y = 2.57;
    body.add(neck);

    // ---------- TORSO ----------
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 1.22, 0.58),
      jacket,
    );
    torso.position.y = 1.96;
    body.add(torso);

    // Chest armor
    const chestArmor = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.55, 0.08),
      jacketDark,
    );
    chestArmor.position.set(0, 2.08, -0.33);
    body.add(chestArmor);

    // Chest neon strip
    const chestLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.055, 0.035),
      neon,
    );
    chestLine.position.set(0, 2.15, -0.39);
    body.add(chestLine);

    // Jacket side strips
    for (const x of [-0.49, 0.49]) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.055, 0.78, 0.045),
        neon,
      );
      strip.position.set(x, 1.98, -0.31);
      body.add(strip);
    }

    // ---------- SHOULDERS ----------
    for (const x of [-0.7, 0.7]) {
      const shoulder = new THREE.Mesh(
        new THREE.SphereGeometry(0.23, 16, 12),
        jacketDark,
      );
      shoulder.scale.set(1.15, 0.72, 1);
      shoulder.position.set(x, 2.4, 0);
      body.add(shoulder);
    }

    // ---------- ARMS ----------
    const leftArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.9, 0.3),
      jacket,
    );
    leftArm.name = 'leftArm';
    leftArm.position.set(-0.72, 1.98, 0);
    body.add(leftArm);

    const rightArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.9, 0.3),
      jacket,
    );
    rightArm.name = 'rightArm';
    rightArm.position.set(0.72, 1.98, 0);
    body.add(rightArm);

    // Forearm tech plates
    for (const x of [-0.72, 0.72]) {
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.31, 0.3, 0.34),
        jacketDark,
      );
      plate.position.set(x, 1.68, -0.01);
      body.add(plate);
    }

    // ---------- WRIST ENERGY DEVICE ----------
    const wrist = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.045, 10, 20),
      neon,
    );
    wrist.rotation.x = Math.PI / 2;
    wrist.position.set(0.9, 1.73, -0.02);
    body.add(wrist);

    const energyCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 12, 12),
      neonPink,
    );
    energyCore.position.set(0.9, 1.73, -0.09);
    body.add(energyCore);

    // ---------- WAIST ----------
    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(1.02, 0.18, 0.62),
      jacketDark,
    );
    belt.position.y = 1.32;
    body.add(belt);

    const beltLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.08, 0.035),
      neon,
    );
    beltLight.position.set(0, 1.35, -0.34);
    body.add(beltLight);

    // ---------- LEGS ----------
    const leftLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 1.12, 0.4),
      pants,
    );
    leftLeg.name = 'leftLeg';
    leftLeg.position.set(-0.27, 0.72, 0);
    body.add(leftLeg);

    const rightLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 1.12, 0.4),
      pants,
    );
    rightLeg.name = 'rightLeg';
    rightLeg.position.set(0.27, 0.72, 0);
    body.add(rightLeg);

    // Knee armor
    for (const x of [-0.27, 0.27]) {
      const knee = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.22, 0.45),
        jacketDark,
      );
      knee.position.set(x, 0.92, -0.04);
      body.add(knee);
    }

    // ---------- SHOES ----------
    const leftShoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.2, 0.78),
      jacketDark,
    );
    leftShoe.position.set(-0.27, 0.16, -0.12);
    body.add(leftShoe);

    const rightShoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.2, 0.78),
      jacketDark,
    );
    rightShoe.position.set(0.27, 0.16, -0.12);
    body.add(rightShoe);

    // Neon soles
    for (const x of [-0.27, 0.27]) {
      const sole = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.055, 0.7),
        neon,
      );
      sole.position.set(x, 0.065, -0.13);
      body.add(sole);
    }

    // Energy strips on shoes
    for (const x of [-0.27, 0.27]) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.045, 0.08),
        neonPink,
      );
      strip.position.set(x, 0.19, -0.53);
      body.add(strip);
    }

    body.position.y = 0;
    root.add(body);

    // Character energy halo
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.018, 8, 32),
      neon,
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.08;
    halo.name = 'energyHalo';
    root.add(halo);

    root.position.set(0, 0, 5);
    root.scale.set(0.78, 0.78, 0.78);

    

    return root;
  }

  private createObstacle(lane: number, z: number) {
    const group = new THREE.Group();

    const type = Math.random();

    if (true) {
      const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(2.7, 1.65, 0.65),
        new THREE.MeshStandardMaterial({
          color: '#161b2b',
          emissive: '#042c3c',
          emissiveIntensity: 1.3,
          metalness: 0.5,
          roughness: 0.3,
        }),
      );
      barrier.position.y = 0.82;
      group.add(barrier);

      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(2.9, 0.12, 0.12),
        new THREE.MeshBasicMaterial({ color: '#00eaff' }),
      );
      beam.position.y = 1.15;
      group.add(beam);
    }

    group.position.set(this.laneX[lane], 0, z);
    this.scene.add(group);

    this.obstacles.push({
      group,
      lane,
      z,
      width: 2.2,
      height: type < 0.5 ? 1.1 : 1.7,
      depth: type < 0.5 ? 1.7 : 0.33,
      passed: false,
    });
  }

  private createCoin(lane: number, z: number) {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.1, 10, 24),
      new THREE.MeshStandardMaterial({
        color: '#fde047',
        emissive: '#f59e0b',
        emissiveIntensity: 1.5,
        metalness: 0.75,
        roughness: 0.18,
      }),
    );

    mesh.rotation.y = Math.PI / 2;
    mesh.position.set(this.laneX[lane], 1.35, z);

    this.scene.add(mesh);

    this.coins.push({
      mesh,
      lane,
      z,
      collected: false,
    });
  }

  private bindControls() {
    window.addEventListener('keydown', this.onKeyDown);
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('resize', this.handleResize);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (!this.running || this.paused || this.gameOver) return;

    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
      this.moveLeft();
    }

    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
      this.moveRight();
    }

    if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w' || event.key === ' ') {
      event.preventDefault();
      this.jump();
    }

    if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
      this.slide();
    }

    if (event.key === 'Escape') {
      this.paused = !this.paused;
    }
  };

  private onPointerDown = (event: PointerEvent) => {
    this.touchStartX = event.clientX;
    this.touchStartY = event.clientY;
  };

  private onPointerUp = (event: PointerEvent) => {
    if (!this.running || this.paused || this.gameOver) return;

    const dx = event.clientX - this.touchStartX;
    const dy = event.clientY - this.touchStartY;

    const sensitivity = Math.max(0.5, Math.min(2, this.config.sensitivity ?? 1));
    const swipeThreshold = 25 / sensitivity;

    if (Math.abs(dx) < swipeThreshold && Math.abs(dy) < swipeThreshold) {
      this.jump();
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) this.moveRight();
      else this.moveLeft();
    } else {
      if (dy < 0) this.jump();
      else this.slide();
    }
  };

  private moveLeft() {
    this.targetLane = Math.max(0, this.targetLane - 1);
  }

  private moveRight() {
    this.targetLane = Math.min(2, this.targetLane + 1);
  }

  private jump() {
    if (this.jumping) return;

    this.jumping = true;
    this.jumps += 1;
    this.verticalVelocity = 9.5;
    this.triggerHaptic(35);
  }

  private slide() {
    if (this.jumping) return;

    this.sliding = true;
    this.triggerHaptic(25);
    this.slideTimer = 0.65;
  }

  private handleResize = () => {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  start() {
    if (this.running) return;

    this.running = true;
    this.paused = false;
    this.gameOver = false;
    this.lastTime = performance.now();
    this.clock.start();

    this.animate();
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this.lastTime = performance.now();
  }

  stop() {
    this.running = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private animate = () => {
    if (!this.running) return;

    this.animationFrame = requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    if (!this.paused && !this.gameOver) {
      this.update(delta);
    }

    this.renderer.render(this.scene, this.camera);
  };

  private update(delta: number) {
    this.difficultyTimer += delta;
    this.nearMissCooldown = Math.max(
      0,
      this.nearMissCooldown - delta,
    );

    if (this.difficultyTimer > 6) {
      this.difficultyTimer = 0;
      this.speed = Math.min(80, this.speed + 0.8);
      this.maxSpeed = Math.max(this.maxSpeed, this.speed);
    }

    this.distance += this.speed * delta;

    this.score += Math.floor(this.speed * delta * (1 + this.combo * 0.08));

    this.level = Math.min(5000, Math.floor(this.coinsCollected / 10) + 1);
    this.callbacks.onDistanceChange?.(Math.floor(this.distance));
    this.callbacks.onScore?.(this.score);
    this.callbacks.onSpeedChange?.(Math.round(this.speed));

    this.updatePlayer(delta);
    this.updateRoad(delta);
    this.updateBuildings(delta);
    this.updateFlyingCars(delta);
    this.updateRain(delta);
    this.updateObstacles(delta);
    this.updateCoins(delta);
    this.updatePowerUps(delta);
    this.spawnObjects(delta);
  }

  private updatePlayer(delta: number) {
    const targetX = this.laneX[this.targetLane];

    this.player.position.x = THREE.MathUtils.lerp(
      this.player.position.x,
      targetX,
      Math.min(1, delta * 12),
    );

    this.lane = this.targetLane;

    if (this.jumping) {
      this.verticalVelocity -= 24 * delta;
      this.playerY += this.verticalVelocity * delta;

      if (this.playerY <= 0) {
        this.playerY = 0;
        this.verticalVelocity = 0;
        this.jumping = false;
      }
    }

    if (this.sliding) {
      this.slideTimer -= delta;

      if (this.slideTimer <= 0) {
        this.slideTimer = 0;
        this.sliding = false;
      }
    }

    this.player.position.y = this.playerY;

    const runTime = performance.now() * 0.012;
    const swing = Math.sin(runTime) * 0.65;

    if (this.jumping) {
      this.leftLeg.rotation.x = 0.25;
      this.rightLeg.rotation.x = -0.25;
      this.leftArm.rotation.x = -0.35;
      this.rightArm.rotation.x = 0.35;
    } else if (this.sliding) {
      this.playerBody.rotation.x = -0.55;
      this.leftLeg.rotation.x = 0.8;
      this.rightLeg.rotation.x = 0.8;
      this.leftArm.rotation.x = -0.7;
      this.rightArm.rotation.x = -0.7;
    } else {
      this.playerBody.rotation.x = 0;
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing;
      this.rightArm.rotation.x = swing;
    }

    this.player.rotation.z = THREE.MathUtils.lerp(
      this.player.rotation.z,
      (targetX - this.player.position.x) * -0.08,
      delta * 10,
    );
  }

  private updateRoad(delta: number) {
    const movement = this.speed * delta;

    for (const line of this.roadLines) {
      line.position.z += movement;

      if (line.position.z > 15) {
        line.position.z -= 252;
      }
    }
  }

  private updateBuildings(delta: number) {
    const movement = this.speed * delta * 0.9;

    for (const building of this.buildings) {
      building.position.z += movement;

      if (building.position.z > 30) {
        building.position.z = -230 - Math.random() * 80;
      }
    }
  }

  private updateTraffic(delta: number) {

    }

  private updateFlyingCars(delta: number) {


    const movement = this.speed * delta;

    for (const strip of this.reflectionStrips) {
      strip.position.z += movement * 0.95;

      if (strip.position.z > 20) {
        strip.position.z = -220 - Math.random() * 40;
        strip.position.x = (Math.random() - 0.5) * 12;
      }
    }
  }

  private updateObstacles(delta: number) {
    const movement = this.speed * delta;

    for (const obstacle of this.obstacles) {
      const previousZ = obstacle.group.position.z;

      obstacle.group.position.z += movement;
      obstacle.z = obstacle.group.position.z;

      if (!obstacle.passed && obstacle.z > 6) {
        obstacle.passed = true;

        const laneDistance = Math.abs(
          this.player.position.x - this.laneX[obstacle.lane],
        );

        if (laneDistance > 1.05) {
            this.dodges += 1;
          this.combo += 1;

          const multiplier =
            this.combo >= 10 ? 5 :
            this.combo >= 5 ? 3 :
            this.combo >= 2 ? 2 : 1;

          this.score += 80 * multiplier + this.combo * 20;

          const label =
            this.combo >= 10
              ? `COMBO x${this.combo}`
              : this.combo >= 5
                ? `COMBO x${this.combo}`
                : this.combo >= 2
                  ? `COMBO x${this.combo}`
                  : '';

          if (label) {
            this.callbacks.onCombo?.(this.combo, label);
          }

          if (
            laneDistance < 2.4 &&
            this.nearMissCooldown <= 0
          ) {
            this.nearMissCooldown = 0.7;
              this.nearMisses += 1;
            this.score += 150;
            sfx.nearMiss();
            this.triggerHaptic(20);
            this.callbacks.onNearMiss?.();
          }
        }
      }

      const playerZ = this.player.position.z;

      // IMPORTANT:
      // Collision is checked only when the obstacle actually
      // crosses the player's Z position from front to back.
      const crossedPlayerZ =
        previousZ < playerZ &&
        obstacle.z >= playerZ;

      if (
        !obstacle.passed &&
        crossedPlayerZ &&
        this.checkObstacleCollision(obstacle)
      ) {
        if (
          this.activePowerUp === 'SHIELD' &&
          this.shieldHits > 0
        ) {
          this.shieldHits = 0;
          sfx.shield();
          this.triggerHaptic([30, 40, 30]);
          this.activePowerUp = null;
          this.powerUpTimer = 0;
          this.callbacks.onPowerUpStatus?.(null, 0);
          obstacle.passed = true;
          continue;
        }

        sfx.hit();
        this.triggerHaptic([80, 50, 120]);
        this.finishRun();
        return;
      }

      if (obstacle.z > 25) {
        this.scene.remove(obstacle.group);
      }
    }

    this.obstacles = this.obstacles.filter(
      obstacle => obstacle.z <= 25,
    );
  }

  private checkObstacleCollision(obstacle: Obstacle) {
    // Use the actual 3D world-space bounding boxes.
    // This prevents Game Over when an obstacle only appears
    // close because of the camera perspective.

    const playerBox = new THREE.Box3().setFromObject(
      this.player,
    );

    const obstacleBox = new THREE.Box3().setFromObject(
      obstacle.group,
    );

    // Keep a small tolerance so touching/near-touching
    // objects are not treated as a collision.
    playerBox.expandByScalar(-0.12);
    obstacleBox.expandByScalar(-0.08);

    if (!playerBox.intersectsBox(obstacleBox)) {
      return false;
    }

    // Different lane = no collision.
    const laneX = this.laneX[obstacle.lane];

    if (
      Math.abs(this.player.position.x - laneX) > 0.9
    ) {
      return false;
    }

    // Jumping over ground obstacles.
    if (this.jumping && this.playerY > 0.85) {
      return false;
    }

    // Sliding under high barriers.
    if (
      this.sliding &&
      obstacle.height >= 1.3
    ) {
      return false;
    }

    return true;
  }
  private finishRun() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.running = false;
    sfx.gameOver();
    this.triggerHaptic([100, 60, 160]);

    const xp = Math.floor(
      this.score / 100 +
      this.coinsCollected * 2 +
      Math.floor(this.distance / 100),
    );

    const result: RunResult = {
      score: this.score,
      coins: this.coinsCollected,
      distance: Math.floor(this.distance),
      combo: this.combo,
      xp,
      jumps: this.jumps,
      dodges: this.dodges,
      powerups: this.powerupsUsed,
      nearMisses: this.nearMisses,
      maxSpeed: Math.round(this.maxSpeed),
      worldId: (this.config.worldId ?? 'neon-city') as WorldId,
      perfectRun: false,
      missionsCompleted: [],
      achievementsCompleted: [],
    };

    this.callbacks.onGameOver?.(result);
  }
  private updateCoins(delta: number) {
    const movement = this.speed * delta;

    for (const coin of this.coins) {
      if (coin.collected) continue;

      coin.mesh.position.z += movement;
      coin.z = coin.mesh.position.z;
      coin.mesh.rotation.z += delta * 7;

      const xDistance = Math.abs(
        this.player.position.x - coin.mesh.position.x,
      );

      const zDistance = Math.abs(
        this.player.position.z - coin.mesh.position.z,
      );

      const yDistance = Math.abs(
        this.player.position.y + 1.2 - coin.mesh.position.y,
      );

      if (xDistance < 1.15 && zDistance < 1.2 && yDistance < 1.5) {
        coin.collected = true;
        this.coinsCollected += 1;
      this.speed = Math.min(this.speed + 0.5, 80);
          this.maxSpeed = Math.max(this.maxSpeed, this.speed);
      this.combo += 1;
        this.score += 100 + this.combo * 10;

        this.callbacks.onCoins?.(this.coinsCollected);
        this.callbacks.onScore?.(this.score);
      }

      if (coin.z > 25) {
        coin.collected = true;
      }
    }

    for (const coin of this.coins) {
      if (coin.collected) {
        this.scene.remove(coin.mesh);
      }
    }

    this.coins = this.coins.filter(
      coin => !coin.collected,
    );
  }

  private spawnObjects(delta: number) {
    this.spawnTimer += delta;
    this.coinTimer += delta;

    const obstacleInterval = Math.max(
      0.65,
      1.25 - this.distance / 30000,
    );

    if (this.spawnTimer >= obstacleInterval) {
      this.spawnTimer = 0;

      const lane = Math.floor(Math.random() * 3);
      this.createObstacle(lane, -100);
    }

    if (this.coinTimer >= 0.42) {
      this.coinTimer = 0;

      const lane = Math.floor(Math.random() * 3);
      this.createCoin(lane, -85);
    }
  }


  destroy() {
    this.stop();

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('resize', this.handleResize);

    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);

    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();

        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    this.renderer.dispose();
  }
}



















































