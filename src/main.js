import { sound } from './engine/Audio.js';
import { Physics, GRAVITY } from './engine/Physics.js';
import { Bow, BOW_SKINS } from './entities/Bow.js';
import { Arrow } from './entities/Arrow.js';
import { ParticleSystem } from './entities/Particles.js';
import { LevelManager } from './systems/LevelManager.js';
import { Storage } from './systems/Storage.js';
import { AchievementManager, ACHIEVEMENTS } from './systems/Achievements.js';

// Game States
const STATE = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  LEVEL_CLEAR: 'LEVEL_CLEAR',
  GAME_OVER: 'GAME_OVER',
  PAUSED: 'PAUSED'
};

class GameApp {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Logical dimensions
    this.width = 1280;
    this.height = 720;

    // Systems
    this.particles = new ParticleSystem();
    this.levels = new LevelManager();
    this.bow = new Bow(120, 360);
    this.bow.setSkin(Storage.getEquippedBow());

    this.achievements = new AchievementManager((ach) => this.showAchievementToast(ach));

    // Game variables
    this.state = STATE.MENU;
    this.gameMode = 'campaign'; // 'campaign' | 'endless'
    this.currentLevelNum = 1;
    this.score = 0;
    this.coins = Storage.getCoins();
    this.stageCoinsEarned = 0;
    this.arrowsLeft = 10;
    this.targetPops = 10;
    this.currentPops = 0;
    this.combo = 0;
    this.bestCombo = 0;

    // Fire Rush & Slow Mo
    this.isFireRush = false;
    this.slowMoTimer = 0;

    // Wind
    this.windX = 0;
    this.targetWind = 0;
    this.windTimer = 0;

    // Power-ups
    this.activePowerup = null; // 'fire' | 'triple'
    this.powerupShots = 0;

    // Freeze stasis
    this.freezeTimer = 0;

    // Screen shake
    this.screenShake = 0;

    // Entities
    this.arrows = [];
    this.balloons = [];
    this.obstacles = [];

    // Drag / Aim Input
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.pointerX = 0;
    this.pointerY = 0;

    // Background stars
    this.stars = [];
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.7),
        radius: 0.8 + Math.random() * 1.6,
        alpha: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 1 + Math.random() * 3
      });
    }

    // Initialize ambient balloons for main menu
    this.initAmbientBalloons();

    // Time
    this.lastTime = performance.now();

    this.initDOM();
    this.initInput();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Audio persistence
    if (Storage.isMuted()) {
      sound.muted = true;
      document.getElementById('btn-sound').textContent = '🔇';
    }

    // Start loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  initAmbientBalloons() {
    this.balloons = [];
    for (let i = 0; i < 12; i++) {
      const b = this.levels.spawnEndlessBalloon(this.width, this.height, 0, true);
      b.speed = 35 + Math.random() * 25;
      this.balloons.push(b);
    }
  }

  resizeCanvas() {
    const container = document.getElementById('canvas-container');
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.scaleRatioX = this.width / rect.width;
    this.scaleRatioY = this.height / rect.height;
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (this.width / rect.width),
      y: (clientY - rect.top) * (this.height / rect.height)
    };
  }

  initDOM() {
    // Navigation Buttons
    document.getElementById('btn-start-campaign').addEventListener('click', () => this.startCampaign(Storage.getUnlockedLevel()));
    document.getElementById('btn-start-endless').addEventListener('click', () => this.startEndless());
    document.getElementById('btn-open-levels').addEventListener('click', () => this.showLevelSelect());
    document.getElementById('btn-close-levels').addEventListener('click', () => this.hideLevelSelect());

    // Armory
    document.getElementById('btn-open-armory').addEventListener('click', () => this.showArmory());
    document.getElementById('btn-open-armory-hud').addEventListener('click', () => this.showArmory());
    document.getElementById('btn-close-armory').addEventListener('click', () => this.hideArmory());

    // Achievements
    document.getElementById('btn-open-achievements').addEventListener('click', () => this.showAchievements());
    document.getElementById('btn-open-achievements-hud').addEventListener('click', () => this.showAchievements());
    document.getElementById('btn-close-achievements').addEventListener('click', () => this.hideAchievements());

    // Campaign progression
    document.getElementById('btn-next-level').addEventListener('click', () => {
      this.startCampaign(this.currentLevelNum + 1);
    });
    document.getElementById('btn-clear-menu').addEventListener('click', () => this.showMenu());

    document.getElementById('btn-retry').addEventListener('click', () => {
      if (this.gameMode === 'campaign') {
        this.startCampaign(this.currentLevelNum);
      } else {
        this.startEndless();
      }
    });
    document.getElementById('btn-game-over-menu').addEventListener('click', () => this.showMenu());

    // Pause
    document.getElementById('btn-pause').addEventListener('click', () => this.togglePause());
    document.getElementById('btn-resume').addEventListener('click', () => this.togglePause());
    document.getElementById('btn-pause-restart').addEventListener('click', () => {
      this.togglePause();
      if (this.gameMode === 'campaign') this.startCampaign(this.currentLevelNum);
      else this.startEndless();
    });
    document.getElementById('btn-pause-menu').addEventListener('click', () => {
      this.togglePause();
      this.showMenu();
    });

    // Sound toggle
    document.getElementById('btn-sound').addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      Storage.setMuted(isMuted);
      document.getElementById('btn-sound').textContent = isMuted ? '🔇' : '🔊';
    });

    this.updateMenuStats();
    this.updateHUD();
  }

  showAchievementToast(ach) {
    sound.playAchievement();
    const toast = document.getElementById('achievement-toast');
    document.getElementById('ach-toast-icon').textContent = ach.icon;
    document.getElementById('ach-toast-title').textContent = ach.title;
    document.getElementById('ach-toast-coins').textContent = ach.reward;

    toast.classList.remove('hidden');
    this.coins = Storage.getCoins();
    this.updateHUD();

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3800);
  }

  showArmory() {
    const wasPlaying = this.state === STATE.PLAYING;
    if (wasPlaying) this.state = STATE.PAUSED;

    const container = document.getElementById('armory-bows-container');
    container.innerHTML = '';
    const unlocked = Storage.getUnlockedBows();
    const equipped = Storage.getEquippedBow();
    this.coins = Storage.getCoins();

    document.getElementById('armory-coins-display').textContent = this.coins.toLocaleString();

    Object.values(BOW_SKINS).forEach(skin => {
      const isUnlocked = unlocked.includes(skin.id);
      const isEquipped = equipped === skin.id;

      const card = document.createElement('div');
      card.className = `bow-card ${isEquipped ? 'equipped' : ''}`;
      card.innerHTML = `
        <div class="bow-card-header">
          <span class="bow-card-title">${skin.name}</span>
          <span class="bow-badge ${isEquipped ? 'equipped' : ''}">${isEquipped ? 'EQUIPPED' : isUnlocked ? 'OWNED' : `🪙 ${skin.price}`}</span>
        </div>
        <div class="bow-card-desc">${skin.description}</div>
        <div class="bow-card-special">${skin.special}</div>
        <button class="bow-action-btn ${isUnlocked ? 'btn-equip' : 'btn-unlock'}">
          ${isEquipped ? 'In Use' : isUnlocked ? 'Equip Bow' : `Unlock (🪙 ${skin.price})`}
        </button>
      `;

      const btn = card.querySelector('.bow-action-btn');
      if (isEquipped) {
        btn.disabled = true;
      } else if (isUnlocked) {
        btn.addEventListener('click', () => {
          Storage.setEquippedBow(skin.id);
          this.bow.setSkin(skin.id);
          this.achievements.checkArmory(skin.id);
          this.showArmory();
        });
      } else {
        btn.addEventListener('click', () => {
          if (Storage.spendCoins(skin.price)) {
            sound.playCoinSound();
            Storage.unlockBow(skin.id);
            Storage.setEquippedBow(skin.id);
            this.bow.setSkin(skin.id);
            this.achievements.checkArmory(skin.id);
            this.showArmory();
            this.updateHUD();
          } else {
            alert('Not enough coins! Pop more balloons to earn coins.');
          }
        });
      }

      container.appendChild(card);
    });

    document.getElementById('armory-modal').classList.remove('hidden');
  }

  hideArmory() {
    document.getElementById('armory-modal').classList.add('hidden');
  }

  showAchievements() {
    const container = document.getElementById('achievements-container');
    container.innerHTML = '';
    const unlockedMap = Storage.getAchievements();

    ACHIEVEMENTS.forEach(ach => {
      const isUnlocked = !!unlockedMap[ach.id];
      const card = document.createElement('div');
      card.className = `ach-card ${isUnlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <div class="ach-icon">${ach.icon}</div>
        <div class="ach-info">
          <div class="ach-title">${ach.title} ${isUnlocked ? '✅' : '🔒'}</div>
          <div class="ach-desc">${ach.description}</div>
        </div>
        <div class="ach-reward">+${ach.reward} 🪙</div>
      `;
      container.appendChild(card);
    });

    document.getElementById('achievements-modal').classList.remove('hidden');
  }

  hideAchievements() {
    document.getElementById('achievements-modal').classList.add('hidden');
  }

  updateMenuStats() {
    document.getElementById('menu-highscore').textContent = Storage.getEndlessHighScore().toLocaleString();
    document.getElementById('menu-unlocked-level').textContent = `${Storage.getUnlockedLevel()} / ${this.levels.totalLevels}`;
  }

  initInput() {
    const onPointerDown = (e) => {
      if (this.state !== STATE.PLAYING) return;
      sound.init();

      const pos = this.getCanvasCoords(e);
      this.isDragging = true;
      this.dragStartX = pos.x;
      this.dragStartY = pos.y;
      this.pointerX = pos.x;
      this.pointerY = pos.y;
      this.bow.isPulling = true;

      const toast = document.getElementById('aim-help-toast');
      if (toast) toast.style.display = 'none';

      this.updateAim(pos.x, pos.y);
    };

    const onPointerMove = (e) => {
      if (!this.isDragging || this.state !== STATE.PLAYING) return;
      const pos = this.getCanvasCoords(e);
      this.pointerX = pos.x;
      this.pointerY = pos.y;
      this.updateAim(pos.x, pos.y);
    };

    const onPointerUp = () => {
      if (!this.isDragging || this.state !== STATE.PLAYING) return;
      this.isDragging = false;
      this.fireArrow();
    };

    this.canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      onPointerDown(e);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging) e.preventDefault();
      onPointerMove(e);
    }, { passive: false });

    window.addEventListener('touchend', onPointerUp);
  }

  updateAim(px, py) {
    const dx = px - this.bow.x;
    const dy = py - this.bow.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    this.bow.setAim(px, py);
    this.bow.setPull(dist * 0.9);

    if (Math.random() < 0.08 && this.bow.pullPower > 0.3) {
      sound.playBowPull(this.bow.pullPower);
    }
  }

  fireArrow() {
    const power = this.bow.release();
    if (power < 0.18 || this.arrowsLeft <= 0) return;

    this.arrowsLeft--;
    this.updateHUD();

    sound.playArrowRelease(power);

    const skin = this.bow.getSkin();
    const baseSpeed = (460 + power * 780) * (skin.speedMult || 1.0);
    const angle = this.bow.baseAngle;

    const release = this.bow.getReleasePos();
    const arrowType = this.isFireRush ? 'fire' : (this.activePowerup || 'normal');

    if (this.activePowerup === 'triple') {
      [-0.14, 0, 0.14].forEach(spread => {
        const spreadAngle = angle + spread;
        const vx = Math.cos(spreadAngle) * baseSpeed;
        const vy = Math.sin(spreadAngle) * baseSpeed;
        this.arrows.push(new Arrow(release.x, release.y, vx, vy, 'triple'));
      });
      this.powerupShots--;
      if (this.powerupShots <= 0) this.activePowerup = null;
    } else {
      const vx = Math.cos(angle) * baseSpeed;
      const vy = Math.sin(angle) * baseSpeed;
      this.arrows.push(new Arrow(release.x, release.y, vx, vy, arrowType));

      if (this.activePowerup === 'fire') {
        this.powerupShots--;
        if (this.powerupShots <= 0) this.activePowerup = null;
      }
    }

    this.updateHUD();
  }

  startCampaign(levelNum) {
    this.gameMode = 'campaign';
    this.currentLevelNum = Math.min(levelNum, this.levels.totalLevels);
    const config = this.levels.getLevelConfig(this.currentLevelNum);

    this.score = 0;
    this.stageCoinsEarned = 0;
    this.arrowsLeft = config.arrows;
    this.targetPops = config.targetPops;
    this.currentPops = 0;
    this.combo = 0;
    this.isFireRush = false;
    this.activePowerup = null;
    this.powerupShots = 0;
    this.freezeTimer = 0;
    this.slowMoTimer = 0;

    document.getElementById('fire-rush-vignette').classList.remove('active');

    this.windX = config.windRange[0] + Math.random() * (config.windRange[1] - config.windRange[0]);
    this.targetWind = this.windX;

    this.arrows = [];
    this.particles.clear();
    this.obstacles = config.obstacles;
    this.balloons = config.balloonGen();

    this.hideAllModals();
    this.state = STATE.PLAYING;
    this.updateHUD();
    sound.startBGM();
  }

  startEndless() {
    this.gameMode = 'endless';
    this.score = 0;
    this.stageCoinsEarned = 0;
    this.arrowsLeft = 14;
    this.currentPops = 0;
    this.combo = 0;
    this.isFireRush = false;
    this.activePowerup = null;
    this.powerupShots = 0;
    this.freezeTimer = 0;
    this.slowMoTimer = 0;
    this.windX = 0;
    this.targetWind = 0;

    document.getElementById('fire-rush-vignette').classList.remove('active');

    this.arrows = [];
    this.particles.clear();
    this.obstacles = [];
    this.balloons = [];

    for (let i = 0; i < 12; i++) {
      const b = this.levels.spawnEndlessBalloon(this.width, this.height, 0, true);
      this.balloons.push(b);
    }

    this.hideAllModals();
    this.state = STATE.PLAYING;
    this.updateHUD();
    sound.startBGM();
  }

  showMenu() {
    this.state = STATE.MENU;
    this.hideAllModals();
    document.getElementById('menu-modal').classList.remove('hidden');
    document.getElementById('fire-rush-vignette').classList.remove('active');
    this.updateMenuStats();
    this.initAmbientBalloons();
  }

  showLevelSelect() {
    const container = document.getElementById('level-buttons-container');
    container.innerHTML = '';
    const unlocked = Storage.getUnlockedLevel();

    for (let i = 1; i <= this.levels.totalLevels; i++) {
      const btn = document.createElement('button');
      btn.className = `level-btn ${i > unlocked ? 'locked' : ''} ${i === this.currentLevelNum ? 'active' : ''}`;
      btn.innerHTML = i > unlocked ? `🔒 ${i}` : `⭐ ${i}`;
      if (i <= unlocked) {
        btn.addEventListener('click', () => {
          this.hideLevelSelect();
          this.startCampaign(i);
        });
      }
      container.appendChild(btn);
    }

    document.getElementById('level-select-modal').classList.remove('hidden');
  }

  hideLevelSelect() {
    document.getElementById('level-select-modal').classList.add('hidden');
  }

  togglePause() {
    if (this.state === STATE.PLAYING) {
      this.state = STATE.PAUSED;
      document.getElementById('pause-modal').classList.remove('hidden');
    } else if (this.state === STATE.PAUSED) {
      this.state = STATE.PLAYING;
      document.getElementById('pause-modal').classList.add('hidden');
    }
  }

  hideAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
  }

  updateHUD() {
    document.getElementById('hud-arrows').textContent = this.arrowsLeft;
    document.getElementById('hud-score').textContent = this.score.toLocaleString();
    document.getElementById('hud-coins').textContent = Storage.getCoins().toLocaleString();

    if (this.gameMode === 'campaign') {
      document.getElementById('hud-mode-label').textContent = 'Level';
      document.getElementById('hud-level').textContent = `${this.currentLevelNum} (${this.currentPops}/${this.targetPops})`;
    } else {
      document.getElementById('hud-mode-label').textContent = 'Mode';
      document.getElementById('hud-level').textContent = 'Endless';
    }

    // Fire Rush Gauge Fill
    const fillPercent = Math.min(100, (this.combo / 4) * 100);
    document.getElementById('fire-bar-fill').style.width = `${fillPercent}%`;

    // Wind meter
    const windSpeedMph = Math.round(Math.abs(this.windX) / 10);
    document.getElementById('wind-speed').textContent = `${windSpeedMph} mph`;
    const arrowEl = document.getElementById('wind-arrow');
    arrowEl.style.transform = this.windX >= 0 ? 'rotate(0deg)' : 'rotate(180deg)';

    // Active power-up badge
    const badge = document.getElementById('powerup-badge');
    if (this.activePowerup) {
      badge.classList.add('active');
      const icon = this.activePowerup === 'fire' ? '🔥' : '🌀';
      const name = this.activePowerup === 'fire' ? 'Fire Piercing' : 'Triple Split';
      document.getElementById('powerup-icon').textContent = icon;
      document.getElementById('powerup-name').textContent = name;
      document.getElementById('powerup-timer').textContent = this.powerupShots;
    } else {
      badge.classList.remove('active');
    }
  }

  triggerCombo(multiplier) {
    const el = document.getElementById('combo-display');
    const numEl = document.getElementById('combo-multiplier');
    numEl.textContent = multiplier;
    el.classList.add('active');

    if (this.comboTimer) clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => {
      el.classList.remove('active');
    }, 1200);

    sound.playComboFanfare(multiplier);

    // Fire rush trigger
    if (multiplier >= 4 && !this.isFireRush) {
      this.isFireRush = true;
      sound.playFireRush();
      document.getElementById('fire-rush-vignette').classList.add('active');
      this.particles.addFloatingText('🔥 FIRE RUSH ACTIVATED!', this.width / 2, 220, '#ff4500', 36);
      this.achievements.checkFireRush();
    }
  }

  popBalloon(balloon, hitX, hitY) {
    balloon.isPopped = true;
    this.currentPops++;
    this.combo++;
    if (this.combo > this.bestCombo) this.bestCombo = this.combo;

    // Check combo and pop achievements
    this.achievements.checkPops();
    this.achievements.checkCombo(this.combo);

    // Score and Coin rewards
    const earnedPoints = balloon.points * Math.max(1, this.combo);
    this.score += earnedPoints;

    const skin = this.bow.getSkin();
    const coinMult = skin.id === 'celestial' ? 2 : 1;
    let earnedCoins = (balloon.type === 'star' ? 30 : balloon.type === 'bomb' ? 15 : 10) * coinMult;
    Storage.addCoins(earnedCoins);
    this.stageCoinsEarned += earnedCoins;

    sound.playPop();
    this.particles.createBalloonPop(balloon.x, balloon.y, balloon.color, balloon.type !== 'normal');
    this.particles.addFloatingText(
      earnedPoints,
      balloon.x,
      balloon.y - 15,
      this.combo > 1 ? '#f59e0b' : '#38bdf8',
      24,
      '+'
    );

    if (this.combo >= 2) {
      this.triggerCombo(this.combo);
    }

    // Special balloon handlers
    if (balloon.type === 'bomb') {
      sound.playExplosion();
      this.achievements.checkBomb();
      this.particles.createBombExplosion(balloon.x, balloon.y);
      this.screenShake = 16;
      this.particles.addFloatingText('BOOM!', balloon.x, balloon.y - 45, '#ff4500', 32);

      this.balloons.forEach(other => {
        if (!other.isPopped && Physics.dist(balloon.x, balloon.y, other.x, other.y) <= 165) {
          setTimeout(() => this.popBalloon(other, other.x, other.y), 60);
        }
      });
    } else if (balloon.type === 'freeze') {
      sound.playFreeze();
      this.achievements.checkFreeze();
      this.particles.createFreezeEffect(balloon.x, balloon.y);
      this.freezeTimer = 5.0;
      this.particles.addFloatingText('FREEZE!', balloon.x, balloon.y - 35, '#38bdf8', 28);
    } else if (balloon.type === 'quiver') {
      sound.playQuiverChime();
      this.arrowsLeft += 3;
      this.particles.addFloatingText('+3 ARROWS!', balloon.x, balloon.y - 35, '#22c55e', 26);
    } else if (balloon.type === 'star') {
      sound.playStarChime();
      this.particles.addFloatingText('STAR BONUS! +300', balloon.x, balloon.y - 35, '#ffd700', 28);
    } else if (balloon.type === 'fire_powerup') {
      sound.playQuiverChime();
      this.activePowerup = 'fire';
      this.powerupShots = 3;
      this.particles.addFloatingText('🔥 FIRE ARROWS!', balloon.x, balloon.y - 35, '#ff6600', 26);
    } else if (balloon.type === 'triple_powerup') {
      sound.playQuiverChime();
      this.activePowerup = 'triple';
      this.powerupShots = 3;
      this.particles.addFloatingText('🌀 TRIPLE SHOT!', balloon.x, balloon.y - 35, '#00e5ff', 26);
    }

    this.updateHUD();
    this.checkVictoryOrDefeat();
  }

  checkVictoryOrDefeat() {
    if (this.gameMode === 'campaign') {
      if (this.currentPops >= this.targetPops && this.state === STATE.PLAYING) {
        // Trigger Slow-Mo Cinematic Finish
        this.slowMoTimer = 1.0;
        this.screenShake = 12;
        setTimeout(() => this.onLevelComplete(), 1000);
      } else if (this.arrowsLeft <= 0 && this.arrows.length === 0) {
        setTimeout(() => this.onGameOver('Out of arrows! Try again to pop all targets.'), 600);
      }
    } else {
      if (this.arrowsLeft <= 0 && this.arrows.length === 0) {
        setTimeout(() => this.onGameOver('Endless Blitz completed! Great shooting!'), 600);
      }
    }
  }

  onLevelComplete() {
    this.state = STATE.LEVEL_CLEAR;
    sound.playVictory();
    this.particles.createConfetti(this.width / 2, this.height / 3, 70);

    Storage.setUnlockedLevel(this.currentLevelNum + 1);
    Storage.setBestCombo(this.bestCombo);
    this.achievements.checkLevel(this.currentLevelNum);

    document.getElementById('clear-level-name').textContent = this.levels.getLevelConfig(this.currentLevelNum).title;
    document.getElementById('clear-pops').textContent = `${this.currentPops} / ${this.targetPops}`;
    document.getElementById('clear-coins').textContent = this.stageCoinsEarned;

    document.getElementById('fire-rush-vignette').classList.remove('active');
    document.getElementById('level-clear-modal').classList.remove('hidden');
  }

  onGameOver(reason) {
    this.state = STATE.GAME_OVER;
    if (this.gameMode === 'endless') {
      Storage.setEndlessHighScore(this.score);
    }
    Storage.setBestCombo(this.bestCombo);

    document.getElementById('game-over-reason').textContent = reason;
    document.getElementById('game-over-score').textContent = this.score.toLocaleString();
    document.getElementById('game-over-combo').textContent = `x${this.bestCombo || 1}`;

    document.getElementById('fire-rush-vignette').classList.remove('active');
    document.getElementById('game-over-modal').classList.remove('hidden');
  }

  // --- Game Loop ---
  gameLoop(time) {
    let dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    // Cinematic slow-mo factor
    if (this.slowMoTimer > 0) {
      this.slowMoTimer -= dt;
      dt *= 0.25;
    }

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  update(dt) {
    if (this.screenShake > 0) {
      this.screenShake -= dt * 30;
      if (this.screenShake < 0) this.screenShake = 0;
    }

    // Handle MENU state ambient balloons
    if (this.state === STATE.MENU) {
      for (const b of this.balloons) {
        b.update(dt, 1.0, 0);
        if (b.y < -70) {
          b.y = this.height + 40;
          b.startX = 350 + Math.random() * (this.width - 450);
          b.x = b.startX;
        }
      }
      return;
    }

    if (this.state !== STATE.PLAYING && this.state !== STATE.LEVEL_CLEAR) return;

    const freezeFactor = this.freezeTimer > 0 ? 0.25 : 1.0;
    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      if (this.freezeTimer < 0) this.freezeTimer = 0;
    }

    this.windTimer += dt;
    if (this.windTimer > 8) {
      this.windTimer = 0;
      if (this.gameMode === 'endless') {
        this.targetWind = (Math.random() - 0.5) * 160;
      }
    }
    this.windX += (this.targetWind - this.windX) * dt * 2;

    this.bow.update(dt);
    this.obstacles.forEach(obs => obs.update(dt));

    // Update arrows
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i];
      arrow.update(dt, this.windX, (type, x, y, opts) => this.particles.emit(type, x, y, opts));

      for (const obs of this.obstacles) {
        if (Physics.checkArrowObstacle(arrow, obs)) {
          sound.playDeflect();
          this.particles.emit('spark', arrow.x, arrow.y, { color: '#ffd700', size: 4 });
          arrow.deflect(-1, 0);
          break;
        }
      }

      for (const b of this.balloons) {
        if (!b.isPopped && !arrow.hitBalloons.has(b) && Physics.checkArrowBalloon(arrow, b)) {
          arrow.hitBalloons.add(b);
          this.popBalloon(b, arrow.x, arrow.y);
          arrow.pierceCount--;
          if (arrow.pierceCount <= 0) {
            arrow.isDead = true;
            break;
          }
        }
      }

      if (arrow.isDead) {
        if (arrow.hitBalloons.size === 0) {
          // Missed shot resets combo & Fire Rush
          this.combo = 0;
          this.isFireRush = false;
          document.getElementById('fire-rush-vignette').classList.remove('active');
          this.updateHUD();
        }
        this.arrows.splice(i, 1);
        this.checkVictoryOrDefeat();
      }
    }

    // Update balloons
    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      b.update(dt, freezeFactor, this.windX);

      if (b.y < -70) {
        if (this.gameMode === 'campaign') {
          b.y = this.height + 40 + Math.random() * 60;
          b.startX = 500 + Math.random() * (this.width - 580);
          b.x = b.startX;
        } else {
          this.balloons.splice(i, 1);
        }
      }
    }

    if (this.gameMode === 'endless') {
      while (this.balloons.length < 12) {
        this.balloons.push(this.levels.spawnEndlessBalloon(this.width, this.height, this.score, false));
      }
    }

    this.particles.update(dt);
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();

    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    this.drawBackdrop(ctx);

    if (this.bow.isPulling && this.bow.pullPower > 0.12) {
      this.drawTrajectory(ctx);
    }

    this.obstacles.forEach(obs => obs.draw(ctx));

    const freezeFactor = this.freezeTimer > 0 ? 0.25 : 1.0;
    this.balloons.forEach(b => b.draw(ctx, freezeFactor));

    this.arrows.forEach(a => a.draw(ctx));

    this.drawArcherStand(ctx);
    this.bow.draw(ctx, this.activePowerup || 'normal', this.isFireRush);

    this.particles.draw(ctx);

    if (this.freezeTimer > 0) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.5)';
      ctx.lineWidth = 12;
      ctx.strokeRect(0, 0, this.width, this.height);
    }

    ctx.restore();
  }

  drawBackdrop(ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, '#0f172a');
    sky.addColorStop(0.4, '#1e1b4b');
    sky.addColorStop(0.8, '#312e81');
    sky.addColorStop(1, '#1e293b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

    const now = Date.now() * 0.001;
    this.stars.forEach(star => {
      const alpha = star.alpha + Math.sin(now * star.twinkleSpeed) * 0.25;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, alpha)})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    const moonX = this.width - 180;
    const moonY = 120;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 90);
    moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.5)');
    moonGlow.addColorStop(0.5, 'rgba(253, 224, 71, 0.15)');
    moonGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef9c3';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
    ctx.fill();

    this.drawCarnivalSilhouette(ctx);

    const hill = ctx.createLinearGradient(0, this.height - 90, 0, this.height);
    hill.addColorStop(0, '#064e3b');
    hill.addColorStop(0.4, '#042f2e');
    hill.addColorStop(1, '#021815');

    ctx.fillStyle = hill;
    ctx.beginPath();
    ctx.moveTo(0, this.height - 60);
    ctx.bezierCurveTo(380, this.height - 90, 850, this.height - 40, this.width, this.height - 70);
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();

    this.drawFairyLights(ctx);
  }

  drawCarnivalSilhouette(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';

    ctx.beginPath();
    ctx.moveTo(700, this.height - 60);
    ctx.lineTo(760, this.height - 180);
    ctx.lineTo(820, this.height - 60);
    ctx.moveTo(800, this.height - 60);
    ctx.lineTo(870, this.height - 210);
    ctx.lineTo(940, this.height - 60);
    ctx.fill();

    const fx = 1060;
    const fy = this.height - 190;
    const fr = 75;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i + (Date.now() * 0.0003);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + Math.cos(a) * fr, fy + Math.sin(a) * fr);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawFairyLights(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.quadraticCurveTo(this.width * 0.5, 95, this.width, 30);
    ctx.stroke();

    const count = 22;
    const colors = ['#f43f5e', '#fbbf24', '#38bdf8', '#4ade80', '#c084fc'];
    for (let i = 1; i < count; i++) {
      const t = i / count;
      const x = t * this.width;
      const y = (1 - t) * (1 - t) * 30 + 2 * (1 - t) * t * 95 + t * t * 30;
      const color = colors[i % colors.length];

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, y + 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawArcherStand(ctx) {
    ctx.save();
    const grad = ctx.createLinearGradient(0, 300, 160, 420);
    grad.addColorStop(0, '#78350f');
    grad.addColorStop(1, '#451a03');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, 310, 135, 100, [0, 16, 16, 0]);
    ctx.fill();

    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.roundRect(40, 335, 30, 65, 6);
    ctx.fill();

    for (let i = 0; i < Math.min(this.arrowsLeft, 6); i++) {
      ctx.strokeStyle = '#d2b48c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(48 + i * 3, 335);
      ctx.lineTo(44 + i * 4, 310);
      ctx.stroke();

      ctx.fillStyle = '#e63946';
      ctx.fillRect(43 + i * 4, 308, 4, 6);
    }

    ctx.restore();
  }

  drawTrajectory(ctx) {
    const skin = this.bow.getSkin();
    const baseSpeed = (460 + this.bow.pullPower * 780) * (skin.speedMult || 1.0);
    const angle = this.bow.baseAngle;
    const release = this.bow.getReleasePos();

    const vx = Math.cos(angle) * baseSpeed;
    const vy = Math.sin(angle) * baseSpeed;

    const points = Physics.predictTrajectory(release.x, release.y, vx, vy, this.windX, 28, 0.038);

    ctx.save();
    points.forEach((pt, idx) => {
      const alpha = (1 - idx / points.length) * 0.8;
      const size = Math.max(1.8, 4 - idx * 0.1);

      ctx.fillStyle = this.isFireRush || this.activePowerup === 'fire' ? `rgba(255, 107, 53, ${alpha})` :
                      this.activePowerup === 'triple' ? `rgba(0, 243, 255, ${alpha})` :
                      skin.id === 'celestial' ? `rgba(255, 215, 0, ${alpha})` :
                      `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
}

// Instantiate on window load
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameApp();
});
