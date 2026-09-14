// Obstacles such as rotating windmill shields and moving wood planks

export class Obstacle {
  constructor(x, y, width, height, type = 'windmill', speed = 1.2) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type; // 'windmill', 'moving_plank'
    this.rotation = 0;
    this.rotSpeed = speed;

    this.startY = y;
    this.moveSpeed = 70;
    this.moveRange = 120;
    this.time = 0;
  }

  update(dt) {
    this.time += dt;

    if (this.type === 'windmill') {
      this.rotation += this.rotSpeed * dt;
    } else if (this.type === 'moving_plank') {
      this.y = this.startY + Math.sin(this.time * 2) * this.moveRange;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.type === 'windmill') {
      // 4-bladed wooden cross
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((Math.PI / 2) * i);

        // Blade wood grain
        const grad = ctx.createLinearGradient(-10, 0, 10, this.height / 2);
        grad.addColorStop(0, '#854d0e');
        grad.addColorStop(0.5, '#a16207');
        grad.addColorStop(1, '#713f12');

        ctx.fillStyle = grad;
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.roundRect(-this.width / 2, 0, this.width, this.height / 2, 4);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }

      // Center gold hub pin
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.stroke();

    } else {
      // Moving plank / shield
      const grad = ctx.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
      grad.addColorStop(0, '#522e1b');
      grad.addColorStop(0.5, '#8b4513');
      grad.addColorStop(1, '#522e1b');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#3e1c0c';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 8);
      ctx.fill();
      ctx.stroke();

      // Metal bands
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-this.width / 2 + 8, -this.height / 2, 10, this.height);
      ctx.fillRect(this.width / 2 - 18, -this.height / 2, 10, this.height);
    }

    ctx.restore();
  }
}
