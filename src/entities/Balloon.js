// Balloon entity with natural buoyancy, specular glossy highlights, and special types

export class Balloon {
  constructor(x, y, type = 'normal', color = '#ef4444', speed = 80) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.type = type; // 'normal', 'bomb', 'freeze', 'quiver', 'star', 'fire_powerup', 'triple_powerup'
    this.color = color;
    this.baseSpeed = speed;
    this.speed = speed;

    // Dimensions (slightly taller than wide for classic balloon shape)
    this.radiusX = 24;
    this.radiusY = 32;

    // Natural buoyancy sway
    this.swayFreq = 1.8 + Math.random() * 1.5;
    this.swayAmp = 12 + Math.random() * 14;
    this.swayPhase = Math.random() * Math.PI * 2;
    this.time = 0;

    this.isPopped = false;
    this.points = this.calculatePoints();
  }

  calculatePoints() {
    switch (this.type) {
      case 'bomb': return 50;
      case 'freeze': return 100;
      case 'quiver': return 150;
      case 'star': return 300;
      case 'fire_powerup': return 200;
      case 'triple_powerup': return 200;
      default: return 100;
    }
  }

  update(dt, freezeFactor = 1.0, windX = 0) {
    if (this.isPopped) return;

    this.time += dt;

    // Apply speed modified by freeze effect (freezeFactor = 0.25 during ice stasis)
    const currentSpeed = this.baseSpeed * freezeFactor;
    this.y -= currentSpeed * dt;

    // Sway horizontally plus slight drift from wind
    this.startX += windX * dt * 0.35 * freezeFactor;
    this.x = this.startX + Math.sin(this.time * this.swayFreq + this.swayPhase) * this.swayAmp;
  }

  draw(ctx, freezeFactor = 1.0) {
    if (this.isPopped) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const rx = this.radiusX;
    const ry = this.radiusY;

    // 1. Draw Balloon Body with 3D Glossy Radial Gradient
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);

    const grad = ctx.createRadialGradient(
      -rx * 0.35, -ry * 0.35, 2,
      0, 0, ry * 1.15
    );

    // Color theming based on balloon type
    if (this.type === 'bomb') {
      grad.addColorStop(0, '#64748b');
      grad.addColorStop(0.4, '#1e293b');
      grad.addColorStop(1, '#020617');
    } else if (this.type === 'freeze') {
      grad.addColorStop(0, '#e0f2fe');
      grad.addColorStop(0.4, '#38bdf8');
      grad.addColorStop(1, '#0284c7');
    } else if (this.type === 'quiver') {
      grad.addColorStop(0, '#bbf7d0');
      grad.addColorStop(0.4, '#22c55e');
      grad.addColorStop(1, '#15803d');
    } else if (this.type === 'star') {
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.4, '#eab308');
      grad.addColorStop(1, '#ca8a04');
    } else if (this.type === 'fire_powerup') {
      grad.addColorStop(0, '#fed7aa');
      grad.addColorStop(0.4, '#f97316');
      grad.addColorStop(1, '#c2410c');
    } else if (this.type === 'triple_powerup') {
      grad.addColorStop(0, '#c7d2fe');
      grad.addColorStop(0.4, '#6366f1');
      grad.addColorStop(1, '#4338ca');
    } else {
      // Standard colorful balloon
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, this.color);
      grad.addColorStop(1, this.darkenColor(this.color, 0.4));
    }

    ctx.fillStyle = grad;
    ctx.fill();

    // Subtle edge stroke
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Glossy Highlight Reflection (Top-left curved specular glint)
    ctx.beginPath();
    ctx.ellipse(-rx * 0.38, -ry * 0.38, rx * 0.35, ry * 0.22, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fill();

    // 3. Icy sheen if frozen
    if (freezeFactor < 0.5) {
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(186, 230, 253, 0.35)';
      ctx.fill();
    }

    // 4. Knot at the bottom
    ctx.beginPath();
    ctx.moveTo(-5, ry - 1);
    ctx.lineTo(5, ry - 1);
    ctx.lineTo(0, ry + 6);
    ctx.closePath();
    ctx.fillStyle = this.type === 'bomb' ? '#0f172a' : this.darkenColor(this.color, 0.4);
    ctx.fill();

    // 5. Dangling string
    ctx.beginPath();
    ctx.moveTo(0, ry + 6);
    const sway = Math.sin(this.time * 4) * 5;
    ctx.quadraticCurveTo(sway, ry + 18, -sway * 0.5, ry + 32);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 6. Draw Special Badge / Emblem
    this.drawBadge(ctx);

    ctx.restore();
  }

  drawBadge(ctx) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (this.type === 'bomb') {
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('💣', 0, 2);
      // Spark at top of bomb
      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      ctx.arc(0, -this.radiusY - 4, 3 + Math.sin(this.time * 15) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'freeze') {
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('❄️', 0, 2);
    } else if (this.type === 'quiver') {
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('🏹', 0, 2);
    } else if (this.type === 'star') {
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('⭐', 0, 2);
    } else if (this.type === 'fire_powerup') {
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('🔥', 0, 2);
    } else if (this.type === 'triple_powerup') {
      ctx.font = 'bold 14px Outfit, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText('x3', 0, 2);
    }

    ctx.restore();
  }

  darkenColor(hex, factor = 0.4) {
    if (!hex || !hex.startsWith('#')) return '#1e293b';
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.floor(r * (1 - factor));
    g = Math.floor(g * (1 - factor));
    b = Math.floor(b * (1 - factor));
    return `rgb(${r}, ${g}, ${b})`;
  }
}
