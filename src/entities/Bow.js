// Bow entity with multiple unlockable bow skins and an animated stylized Archer Character

export const BOW_SKINS = {
  oak: {
    id: 'oak',
    name: 'Oak Recurve',
    description: 'The reliable starter bow carved from aged carnival oak.',
    price: 0,
    speedMult: 1.0,
    primaryColor: '#5a2d0c',
    highlightColor: '#d4883b',
    trimColor: '#ffd700',
    stringColor: '#f8f9fa',
    special: 'Standard shot velocity'
  },
  flame: {
    id: 'flame',
    name: 'Phoenix Flamebow',
    description: 'Forged in ember dragonfire. +15% launch speed & fiery spark trails.',
    price: 350,
    speedMult: 1.15,
    primaryColor: '#7f1d1d',
    highlightColor: '#ef4444',
    trimColor: '#f59e0b',
    stringColor: '#fde047',
    special: '+15% Arrow Velocity & Fire Sparks'
  },
  frost: {
    id: 'frost',
    name: 'Glacial Frostbow',
    description: 'Carved from permafrost crystal. +10% velocity with frozen mist aura.',
    price: 450,
    speedMult: 1.10,
    primaryColor: '#0c4a6e',
    highlightColor: '#0284c7',
    trimColor: '#38bdf8',
    stringColor: '#e0f2fe',
    special: '+10% Velocity & Ice Mist'
  },
  celestial: {
    id: 'celestial',
    name: 'Celestial Sovereign',
    description: 'Royal bow infused with starfire. Doubles coins earned from all balloons!',
    price: 750,
    speedMult: 1.22,
    primaryColor: '#581c87',
    highlightColor: '#a855f7',
    trimColor: '#ffd700',
    stringColor: '#ffffff',
    special: '⭐ 2x Coin Multiplier & Star Trails'
  }
};

export class Bow {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseAngle = 0; // Aiming angle in radians
    this.pullPower = 0; // 0 to 1
    this.isPulling = false;
    this.maxPullDistance = 85;
    this.currentPullDistance = 0;
    this.vibration = 0; // String vibration on release
    this.skinId = 'oak';

    // Bow dimensions
    this.height = 110;
    this.limbCurvature = 28;

    // Archer animation
    this.releaseTimer = 0;
  }

  setSkin(skinId) {
    if (BOW_SKINS[skinId]) {
      this.skinId = skinId;
    }
  }

  getSkin() {
    return BOW_SKINS[this.skinId] || BOW_SKINS.oak;
  }

  setAim(targetX, targetY) {
    const dx = this.x - targetX;
    const dy = this.y - targetY;
    this.baseAngle = Math.atan2(dy, dx);

    // Limit angle to comfortable forward firing arc
    const minAngle = -Math.PI * 0.44;
    const maxAngle = Math.PI * 0.44;
    this.baseAngle = Math.max(minAngle, Math.min(maxAngle, this.baseAngle));
  }

  setPull(dragDist) {
    this.currentPullDistance = Math.min(this.maxPullDistance, Math.max(0, dragDist));
    this.pullPower = this.currentPullDistance / this.maxPullDistance;
  }

  release() {
    const power = this.pullPower;
    this.isPulling = false;
    this.vibration = 20;
    this.releaseTimer = 0.15;
    this.currentPullDistance = 0;
    this.pullPower = 0;
    return power;
  }

  update(dt) {
    if (this.vibration > 0) {
      this.vibration -= dt * 65;
      if (this.vibration < 0) this.vibration = 0;
    }
    if (this.releaseTimer > 0) {
      this.releaseTimer -= dt;
    }
  }

  // Draw both the animated stylized Archer Character and the Bow
  draw(ctx, currentArrowType = 'normal', isFireRush = false) {
    const skin = this.getSkin();

    // 1. Draw Archer Character Avatar behind bow
    this.drawArcher(ctx);

    // 2. Draw Bow & String in transformed space
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.baseAngle);

    const halfH = this.height / 2;
    const flex = this.pullPower * 14;
    const topX = -flex;
    const topY = -halfH;
    const botX = -flex;
    const botY = halfH;

    let stringPullX = -this.currentPullDistance;
    if (this.vibration > 0) {
      stringPullX += Math.sin(Date.now() * 0.05) * this.vibration;
    }

    // Glow aura for elemental bows or Fire Rush
    if (isFireRush || skin.id === 'flame') {
      ctx.shadowColor = '#ff4500';
      ctx.shadowBlur = 18;
    } else if (skin.id === 'frost') {
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 16;
    } else if (skin.id === 'celestial') {
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 20;
    }

    // A. Draw Limbs
    ctx.lineWidth = 7.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const bowGrad = ctx.createLinearGradient(-30, -halfH, 15, halfH);
    bowGrad.addColorStop(0, skin.primaryColor);
    bowGrad.addColorStop(0.3, skin.highlightColor);
    bowGrad.addColorStop(0.7, skin.highlightColor);
    bowGrad.addColorStop(1, skin.primaryColor);

    ctx.strokeStyle = bowGrad;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(this.limbCurvature - flex, -halfH * 0.5, 0, 0);
    ctx.quadraticCurveTo(this.limbCurvature - flex, halfH * 0.5, botX, botY);
    ctx.stroke();

    // Metallic grip and limb tips
    ctx.strokeStyle = skin.trimColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, 9, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Golden tip caps
    ctx.fillStyle = skin.trimColor;
    ctx.beginPath();
    ctx.arc(topX, topY, 4.5, 0, Math.PI * 2);
    ctx.arc(botX, botY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // B. Draw Bowstring
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = skin.stringColor;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(stringPullX, 0);
    ctx.lineTo(botX, botY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // C. Draw Nocked Arrow if aiming
    if (this.isPulling || this.currentPullDistance > 0) {
      const activeType = isFireRush ? 'fire' : currentArrowType;
      this.drawNockedArrow(ctx, stringPullX, activeType, skin);
    }

    ctx.restore();
  }

  // Stylized Archer Character standing on the shooting deck
  drawArcher(ctx) {
    ctx.save();
    // Archer stands around (x: 80, y: 360)
    const archerX = this.x - 45;
    const archerY = this.y + 10;

    // Shadow on the wood deck
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(archerX, archerY + 50, 22, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs / Boots
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(archerX - 12, archerY + 25, 9, 25);
    ctx.fillRect(archerX + 3, archerY + 25, 9, 25);

    // Torso / Tunic
    const skin = this.getSkin();
    ctx.fillStyle = skin.id === 'flame' ? '#991b1b' :
                    skin.id === 'frost' ? '#075985' :
                    skin.id === 'celestial' ? '#4c1d95' : '#15803d'; // Forest green default
    ctx.beginPath();
    ctx.roundRect(archerX - 16, archerY - 15, 32, 44, 8);
    ctx.fill();

    // Leather belt & buckle
    ctx.fillStyle = '#78350f';
    ctx.fillRect(archerX - 16, archerY + 12, 32, 6);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(archerX - 4, archerY + 10, 8, 10);

    // Left Arm holding the bow handle (stretches towards bow)
    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(archerX + 8, archerY - 2);
    ctx.lineTo(this.x - 4, this.y + 2);
    ctx.stroke();

    // Head
    const headY = archerY - 32;
    ctx.fillStyle = '#fed7aa'; // Skin tone
    ctx.beginPath();
    ctx.arc(archerX, headY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Feathered Archer Cap
    ctx.fillStyle = skin.id === 'flame' ? '#b91c1c' :
                    skin.id === 'frost' ? '#0369a1' :
                    skin.id === 'celestial' ? '#6b21a8' : '#166534';
    ctx.beginPath();
    ctx.moveTo(archerX - 16, headY - 4);
    ctx.lineTo(archerX + 16, headY - 4);
    ctx.lineTo(archerX + 4, headY - 22);
    ctx.lineTo(archerX - 12, headY - 14);
    ctx.closePath();
    ctx.fill();

    // Feather in cap
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(archerX - 4, headY - 14);
    ctx.quadraticCurveTo(archerX - 18, headY - 26, archerX - 22, headY - 34);
    ctx.stroke();

    // Focused Eye looking in direction of baseAngle
    const eyeOffsetX = Math.cos(this.baseAngle) * 5;
    const eyeOffsetY = Math.sin(this.baseAngle) * 4;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(archerX + 6 + eyeOffsetX, headY + eyeOffsetY, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Right Arm pulling the string back
    const pullX = this.x - Math.cos(this.baseAngle) * this.currentPullDistance;
    const pullY = this.y - Math.sin(this.baseAngle) * this.currentPullDistance;

    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(archerX - 8, archerY - 2);
    // Elbow bends
    const elbowX = (archerX - 8 + pullX) / 2 - 12;
    const elbowY = (archerY - 2 + pullY) / 2 - 6;
    ctx.quadraticCurveTo(elbowX, elbowY, pullX - 6, pullY);
    ctx.stroke();

    ctx.restore();
  }

  drawNockedArrow(ctx, nockX, type, skin) {
    const arrowLen = 80;
    const tipX = nockX + arrowLen;

    ctx.save();
    if (type === 'fire' || skin.id === 'flame') {
      ctx.shadowColor = '#ff4500';
      ctx.shadowBlur = 12;
    } else if (type === 'triple' || skin.id === 'frost') {
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 10;
    } else if (skin.id === 'celestial') {
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 14;
    }

    // Shaft
    ctx.strokeStyle = type === 'fire' ? '#ff6600' :
                      type === 'triple' ? '#00e5ff' :
                      skin.id === 'celestial' ? '#ffd700' : '#d2b48c';
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(nockX, 0);
    ctx.lineTo(tipX, 0);
    ctx.stroke();

    // Tip
    ctx.fillStyle = type === 'fire' ? '#ff2200' :
                    skin.id === 'frost' ? '#7dd3fc' :
                    skin.id === 'celestial' ? '#ffffff' : '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(tipX, 0);
    ctx.lineTo(tipX - 14, -6);
    ctx.lineTo(tipX - 10, 0);
    ctx.lineTo(tipX - 14, 6);
    ctx.closePath();
    ctx.fill();

    // Fletching
    ctx.fillStyle = type === 'fire' ? '#ffd700' :
                    skin.id === 'frost' ? '#38bdf8' :
                    skin.id === 'celestial' ? '#e879f9' : '#e63946';
    ctx.beginPath();
    ctx.moveTo(nockX, 0);
    ctx.lineTo(nockX + 16, -5);
    ctx.lineTo(nockX + 6, 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(nockX, 0);
    ctx.lineTo(nockX + 16, 5);
    ctx.lineTo(nockX + 6, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  getReleasePos() {
    const stringPullX = -this.currentPullDistance;
    const cos = Math.cos(this.baseAngle);
    const sin = Math.sin(this.baseAngle);
    return {
      x: this.x + stringPullX * cos,
      y: this.y + stringPullX * sin,
      angle: this.baseAngle
    };
  }
}
