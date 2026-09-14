// Particle and visual FX engine for balloon explosions, confetti, and floating scores

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
  }

  // Popping balloon burst: rubber shards + sparkles
  createBalloonPop(x, y, color, isSpecial = false) {
    const shardCount = isSpecial ? 22 : 14;

    for (let i = 0; i < shardCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 260;
      this.particles.push({
        type: 'shard',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 420,
        color,
        size: 4 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 15,
        life: 0.65 + Math.random() * 0.4,
        maxLife: 1.05
      });
    }

    // Add bright spark burst
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 160;
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 150,
        color: '#ffffff',
        size: 3,
        life: 0.35,
        maxLife: 0.35
      });
    }
  }

  // Bomb blast: fiery shockwave + smoke + embers
  createBombExplosion(x, y) {
    // Expanding shockwave
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: 180,
      color: '#ff4500',
      alpha: 1.0,
      speed: 400
    });

    // Fiery smoke clouds
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 320;
      const colors = ['#ff2200', '#ff7700', '#ffdd00', '#44403c'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        type: 'fire',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 120,
        color,
        size: 8 + Math.random() * 16,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9
      });
    }
  }

  // Freeze effect: icy frost cloud + snowflakes
  createFreezeEffect(x, y) {
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: 220,
      color: '#38bdf8',
      alpha: 0.8,
      speed: 350
    });

    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      this.particles.push({
        type: 'ice',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 60,
        color: Math.random() > 0.4 ? '#e0f2fe' : '#38bdf8',
        size: 4 + Math.random() * 5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 1.3
      });
    }
  }

  // Confetti cannon on victory / big streak
  createConfetti(x, y, count = 40) {
    const palette = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
      const speed = 250 + Math.random() * 350;
      this.particles.push({
        type: 'confetti',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 280,
        color: palette[Math.floor(Math.random() * palette.length)],
        width: 7 + Math.random() * 5,
        height: 12 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 12,
        flutterPhase: Math.random() * Math.PI,
        life: 1.5 + Math.random() * 1.0,
        maxLife: 2.5
      });
    }
  }

  // Add floating combat text (+100, COMBO x3, etc.)
  addFloatingText(text, x, y, color = '#fef08a', size = 22, prefix = '') {
    this.floatingTexts.push({
      text: `${prefix}${text}`,
      x,
      y,
      vy: -60,
      color,
      size,
      alpha: 1.0,
      life: 0.85,
      maxLife: 0.85
    });
  }

  emit(type, x, y, opts = {}) {
    this.particles.push({
      type,
      x,
      y,
      vx: (Math.random() - 0.5) * 30,
      vy: (Math.random() - 0.5) * 30,
      gravity: 0,
      color: opts.color || '#fff',
      size: opts.size || 3,
      life: opts.life || 0.3,
      maxLife: opts.life || 0.3
    });
  }

  update(dt) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.vy += (p.gravity || 0) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.rotSpeed) {
        p.rotation += p.rotSpeed * dt;
      }
      if (p.flutterPhase !== undefined) {
        p.flutterPhase += dt * 8;
        p.vx += Math.sin(p.flutterPhase) * 20 * dt;
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed * dt;
      sw.alpha = 1 - sw.radius / sw.maxRadius;
      if (sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update floating score texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
      ft.alpha = ft.life / ft.maxLife;
    }
  }

  draw(ctx) {
    // 1. Draw Shockwaves
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw Particles
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === 'confetti') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        const scaleX = Math.cos(p.flutterPhase);
        ctx.scale(scaleX, 1);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      } else if (p.type === 'shard') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size);
        ctx.lineTo(p.size, -p.size * 0.5);
        ctx.lineTo(p.size * 0.5, p.size);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'fire') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      } else if (p.type === 'ice') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Little 4-point snowflake
        ctx.moveTo(-p.size, 0); ctx.lineTo(p.size, 0);
        ctx.moveTo(0, -p.size); ctx.lineTo(0, p.size);
        ctx.stroke();
      } else {
        // Simple spark / dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.restore();
    }

    // 3. Draw Floating Score Texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `900 ${ft.size}px Outfit, sans-serif`;
      ctx.textAlign = 'center';

      // Text glow / outline
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x, ft.y);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
  }
}
