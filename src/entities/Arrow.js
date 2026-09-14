// Arrow entity handling flight physics, particle trails, and piercing

import { GRAVITY } from '../engine/Physics.js';

export class Arrow {
  constructor(x, y, vx, vy, type = 'normal') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.type = type; // 'normal', 'fire', 'triple'
    this.length = 74;
    this.angle = Math.atan2(vy, vx);
    this.isDead = false;
    this.stuck = false; // If embedded in wooden wall
    this.pierceCount = type === 'fire' ? 4 : 1; // Fire arrow pierces multiple
    this.hitBalloons = new Set(); // Prevent duplicate hit on same balloon in 1 frame
    this.trailTimer = 0;
  }

  update(dt, windX = 0, onEmitParticle = null) {
    if (this.stuck || this.isDead) return;

    // Apply wind and gravity
    this.vx += windX * dt;
    this.vy += GRAVITY * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Dynamically align arrow heading along its velocity vector
    this.angle = Math.atan2(this.vy, this.vx);

    // Emit trail particles
    this.trailTimer += dt;
    if (this.trailTimer > 0.025 && onEmitParticle) {
      this.trailTimer = 0;
      // Tail position
      const tailX = this.x - Math.cos(this.angle) * (this.length * 0.7);
      const tailY = this.y - Math.sin(this.angle) * (this.length * 0.7);

      if (this.type === 'fire') {
        onEmitParticle('flame', tailX, tailY, {
          color: Math.random() > 0.4 ? '#ff4500' : '#ffd700',
          size: 3 + Math.random() * 4,
          life: 0.35
        });
      } else if (this.type === 'triple') {
        onEmitParticle('spark', tailX, tailY, {
          color: '#00e5ff',
          size: 2.5,
          life: 0.25
        });
      } else {
        // Subtle wind streak
        onEmitParticle('wind', tailX, tailY, {
          color: 'rgba(255, 255, 255, 0.4)',
          size: 2,
          life: 0.2
        });
      }
    }

    // Boundary check (offscreen)
    if (this.x > 1800 || this.x < -300 || this.y > 1100 || (this.y < -300 && this.vy < 0)) {
      this.isDead = true;
    }
  }

  deflect(normalX = -1, normalY = 0) {
    // Reflect velocity with energy damping
    const dot = this.vx * normalX + this.vy * normalY;
    this.vx = (this.vx - 2 * dot * normalX) * 0.55;
    this.vy = (this.vy - 2 * dot * normalY) * 0.55;
    this.angle = Math.atan2(this.vy, this.vx);
  }

  draw(ctx) {
    if (this.isDead) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const len = this.length;

    // Glowing aura for special arrows
    if (this.type === 'fire') {
      ctx.shadowColor = '#ff3700';
      ctx.shadowBlur = 14;
    } else if (this.type === 'triple') {
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 10;
    }

    // Arrow shaft
    ctx.strokeStyle = this.type === 'fire' ? '#ff6b35' : this.type === 'triple' ? '#00e5ff' : '#d2b48c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Arrow tip (Iron/Flint or Burning Obsidian)
    ctx.fillStyle = this.type === 'fire' ? '#ff2200' : '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-14, -6);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-14, 6);
    ctx.closePath();
    ctx.fill();

    // Fletching / Feathers
    ctx.fillStyle = this.type === 'fire' ? '#ffd700' : this.type === 'triple' ? '#38bdf8' : '#e63946';
    // Top feather
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.lineTo(-len + 16, -6);
    ctx.lineTo(-len + 6, 0);
    ctx.closePath();
    ctx.fill();

    // Bottom feather
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.lineTo(-len + 16, 6);
    ctx.lineTo(-len + 6, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
