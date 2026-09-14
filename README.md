# 🏹 Arrow Pop: Master Archer (Balloon Blaster Deluxe)

![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Procedural-00f3ff?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

An arcade bow-and-arrow balloon blaster web game built with high-performance HTML5 Canvas, physics simulation (gravity, string tension, crosswinds, parabolic trajectory arcs), procedural Web Audio synthesis, and dynamic particle effects.

🎮 **Live Demo:** [https://deekshag96.github.io/balloon-blaster-app/](https://deekshag96.github.io/balloon-blaster-app/)

---

## ✨ Features

- **🏹 Animated Stylized Archer Avatar**:
  - An animated archer character standing on the shooting platform.
  - Dynamically draws the bowstring back with realistic elbow bend and turns head and eyes toward the aim vector.
  - Outfit dynamically changes color to match equipped elemental bows.

- **🎯 Realistic Bow & Trajectory Physics**:
  - Drag-and-release aiming with elastic string tension and limb curvature flex.
  - Real-time parabolic trajectory prediction dots calculated from pull velocity, gravity, and dynamic crosswinds.
  - Arrows rotate along their velocity vector, emit smoke/fire/spark trails, and bounce off obstacles with physical deflections.

- **🎈 Special Balloons & Chain Reactions**:
  - 💣 **Bomb Balloons**: Detonates adjacent balloons in a fiery blast radius with screen shake.
  - ❄️ **Freeze Balloons**: Cryogenic stasis slows all ascending balloons by 75% for 5 seconds.
  - 🏹 **Quiver Balloons**: Adds +3 arrows to your ammo.
  - ⭐ **Golden Star Balloons**: High-score boost with golden sparkle effects.
  - 🔥 **Fire Piercing** & 🌀 **Triple Split Arrows**: Special power-up arrows that slice through multiple targets or fire in 3-way spreads.

- **🛡️ The Bow Armory**:
  - Collect coins by popping balloons to unlock forged elemental bows:
    - 🪵 **Oak Recurve**: Starter balanced bow.
    - 🔥 **Phoenix Flamebow**: +15% launch speed & fire sparks.
    - ❄️ **Glacial Frostbow**: +10% velocity & ice mist aura.
    - 👑 **Celestial Sovereign**: **2x Coin Multiplier** on all balloons & star trails.

- **🔥 "FIRE RUSH" Overdrive**:
  - Maintain a 4x combo streak to activate **FIRE RUSH**!
  - The screen edges ignite with a pulsing fiery vignette.
  - Every arrow transforms into a flaming piercing projectile!

- **🏆 Trophies & Achievements**:
  - 7 interactive achievements with real-time sliding unlock banners and coin rewards.

- **🎵 100% Procedural Web Audio**:
  - Synthesized in real time using browser Web Audio API (bow pull creak, arrow whoosh, crisp pops, bomb kaboom, freeze chimes, fanfare). Zero missing audio assets.

- **🎮 2 Game Modes**:
  - **Level Campaign**: 10 progressive stages with obstacles (rotating windmills, swinging shields, crosswinds).
  - **Endless Blitz**: High-speed arcade mode with continuous balloon waves and streak multipliers.

---

## 🕹️ Controls

- **Aim & Shoot**: Click/touch and drag backwards from the bow. The glowing trajectory dots guide your shot. Release to fire!
- **Sound Toggle**: Click 🔊 / 🔇 in the top HUD.
- **Pause**: Click ⏸ in the HUD or press Esc.

---

## 🚀 Local Development

```bash
# Clone the repository
git clone https://github.com/DeekshaG96/balloon-blaster-app.git

# Navigate to project
cd balloon-blaster-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📄 License
MIT License. Created with ❤️ for archers and arcade fans!
