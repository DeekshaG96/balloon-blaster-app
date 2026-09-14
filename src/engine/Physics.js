// Physics calculations, collisions, and trajectory prediction

export const GRAVITY = 720; // pixels per second squared

export class Physics {
  // Compute predicted trajectory points for aim guidance
  static predictTrajectory(startX, startY, velocityX, velocityY, windX = 0, steps = 30, dt = 0.04) {
    const points = [];
    let x = startX;
    let y = startY;
    let vx = velocityX;
    let vy = velocityY;

    for (let i = 0; i < steps; i++) {
      points.push({ x, y });
      vx += windX * dt;
      vy += GRAVITY * dt;
      x += vx * dt;
      y += vy * dt;

      // Stop if leaving ground or far out of bounds
      if (y > 900 || x > 1600 || x < -200) break;
    }
    return points;
  }

  // Check collision between an arrow tip/segment and a balloon (ellipse)
  static checkArrowBalloon(arrow, balloon) {
    if (balloon.isPopped) return false;

    // Arrow line segment from tip to mid-shaft
    const tipX = arrow.x;
    const tipY = arrow.y;
    const shaftX = arrow.x - Math.cos(arrow.angle) * (arrow.length * 0.4);
    const shaftY = arrow.y - Math.sin(arrow.angle) * (arrow.length * 0.4);

    // Transform tip into balloon's local coordinate space
    const dx = tipX - balloon.x;
    const dy = tipY - balloon.y;
    const rx = balloon.radiusX;
    const ry = balloon.radiusY;

    // Ellipse interior test: (dx/rx)^2 + (dy/ry)^2 <= 1.05
    if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.05) {
      return true;
    }

    // Also test shaft mid point
    const mdx = shaftX - balloon.x;
    const mdy = shaftY - balloon.y;
    if ((mdx * mdx) / (rx * rx) + (mdy * mdy) / (ry * ry) <= 1.05) {
      return true;
    }

    return false;
  }

  // Check collision between an arrow and a rectangular obstacle (e.g. rotating windmill blade)
  static checkArrowObstacle(arrow, obstacle) {
    // Transform arrow tip into obstacle's local rotated space
    const cos = Math.cos(-obstacle.rotation);
    const sin = Math.sin(-obstacle.rotation);

    const relX = arrow.x - obstacle.x;
    const relY = arrow.y - obstacle.y;

    const localX = relX * cos - relY * sin;
    const localY = relX * sin + relY * cos;

    const halfW = obstacle.width / 2;
    const halfH = obstacle.height / 2;

    return (
      localX >= -halfW &&
      localX <= halfW &&
      localY >= -halfH &&
      localY <= halfH
    );
  }

  // Calculate distance between two points
  static dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
