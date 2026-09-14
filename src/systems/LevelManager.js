// Level definitions, objectives, and endless mode procedural spawner
import { Balloon } from '../entities/Balloon.js';
import { Obstacle } from '../entities/Obstacle.js';

export class LevelManager {
  constructor() {
    this.currentLevel = 1;
    this.totalLevels = 10;
    this.colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
  }

  getLevelConfig(levelNum) {
    switch (levelNum) {
      case 1:
        return {
          title: "Carnival Warmup",
          description: "Pop all 10 colorful balloons! Get a feel for the bow.",
          targetPops: 10,
          arrows: 12,
          windRange: [0, 0],
          obstacles: [],
          balloonGen: () => {
            const list = [];
            // Two neat columns/rows right in the center field of view (y: 160 to 480)
            for (let i = 0; i < 10; i++) {
              const col = i % 5;
              const row = Math.floor(i / 5);
              const x = 540 + col * 120 + (Math.random() - 0.5) * 20;
              const y = 160 + row * 220 + (Math.random() - 0.5) * 40;
              const color = this.colors[i % this.colors.length];
              list.push(new Balloon(x, y, 'normal', color, 55));
            }
            return list;
          }
        };

      case 2:
        return {
          title: "Chain Reaction",
          description: "Hit the 💣 Bomb balloon to pop surrounding clusters!",
          targetPops: 14,
          arrows: 8,
          windRange: [0, 0],
          obstacles: [],
          balloonGen: () => {
            const list = [];
            // Cluster 1 - Center left (x: 580, y: 300)
            list.push(new Balloon(580, 300, 'bomb', '#0f172a', 50));
            list.push(new Balloon(530, 260, 'normal', '#ef4444', 50));
            list.push(new Balloon(630, 260, 'normal', '#3b82f6', 50));
            list.push(new Balloon(540, 340, 'normal', '#10b981', 50));
            list.push(new Balloon(620, 340, 'normal', '#f59e0b', 50));
            list.push(new Balloon(580, 380, 'normal', '#ec4899', 50));

            // Cluster 2 - Center right (x: 900, y: 340)
            list.push(new Balloon(900, 340, 'bomb', '#0f172a', 55));
            list.push(new Balloon(850, 300, 'normal', '#06b6d4', 55));
            list.push(new Balloon(950, 300, 'normal', '#8b5cf6', 55));
            list.push(new Balloon(860, 380, 'normal', '#ef4444', 55));
            list.push(new Balloon(940, 380, 'normal', '#10b981', 55));
            list.push(new Balloon(900, 420, 'star', '#ffd700', 55));

            // 2 bonus balloons floating between clusters
            list.push(new Balloon(740, 240, 'quiver', '#22c55e', 60));
            list.push(new Balloon(740, 420, 'normal', '#3b82f6', 60));
            return list;
          }
        };

      case 3:
        return {
          title: "Winter Frost Stasis",
          description: "Pop the ❄️ Freeze balloon to slow fast-ascending balloons!",
          targetPops: 12,
          arrows: 8,
          windRange: [-30, 30],
          obstacles: [],
          balloonGen: () => {
            const list = [];
            list.push(new Balloon(540, 240, 'freeze', '#38bdf8', 90));
            list.push(new Balloon(840, 360, 'freeze', '#38bdf8', 95));

            for (let i = 0; i < 10; i++) {
              const x = 500 + Math.random() * 520;
              const y = 140 + Math.random() * 420;
              const isStar = i === 3 || i === 7;
              const type = isStar ? 'star' : 'normal';
              const color = isStar ? '#ffd700' : this.colors[i % this.colors.length];
              list.push(new Balloon(x, y, type, color, 95 + Math.random() * 25));
            }
            return list;
          }
        };

      case 4:
        return {
          title: "The Windmill",
          description: "Time your shots through the rotating wooden windmill!",
          targetPops: 10,
          arrows: 9,
          windRange: [0, 0],
          obstacles: [
            new Obstacle(620, 360, 22, 280, 'windmill', 1.1)
          ],
          balloonGen: () => {
            const list = [];
            // Target balloons positioned on the right side of the windmill
            for (let i = 0; i < 10; i++) {
              const col = i % 3;
              const row = Math.floor(i / 3);
              const x = 820 + col * 90;
              const y = 160 + row * 130 + (Math.random() - 0.5) * 30;
              const type = i === 4 ? 'fire_powerup' : i === 7 ? 'bomb' : 'normal';
              list.push(new Balloon(x, y, type, this.colors[i % this.colors.length], 60));
            }
            return list;
          }
        };

      case 5:
        return {
          title: "Crosswind Trial",
          description: "Account for strong gusts of wind deflecting your arrow!",
          targetPops: 12,
          arrows: 10,
          windRange: [-180, 180],
          obstacles: [],
          balloonGen: () => {
            const list = [];
            for (let i = 0; i < 12; i++) {
              const x = 500 + Math.random() * 520;
              const y = 140 + Math.random() * 440;
              const type = i % 4 === 0 ? 'quiver' : 'normal';
              list.push(new Balloon(x, y, type, this.colors[i % this.colors.length], 65));
            }
            return list;
          }
        };

      case 6:
        return {
          title: "Twin Mill Mayhem",
          description: "Two rotating mills guarding rows of target balloons!",
          targetPops: 12,
          arrows: 10,
          windRange: [-50, 50],
          obstacles: [
            new Obstacle(560, 340, 20, 240, 'windmill', 1.3),
            new Obstacle(780, 380, 20, 240, 'windmill', -1.1)
          ],
          balloonGen: () => {
            const list = [];
            for (let i = 0; i < 12; i++) {
              const x = 660 + (i % 2 === 0 ? 0 : 260) + (Math.random() - 0.5) * 30;
              const y = 150 + Math.floor(i / 2) * 80;
              const type = i === 2 ? 'triple_powerup' : i === 5 ? 'bomb' : 'normal';
              list.push(new Balloon(x, y, type, this.colors[i % this.colors.length], 65));
            }
            return list;
          }
        };

      case 7:
        return {
          title: "Bomb Fiesta",
          description: "Trigger multiple bomb reactions to clear the dense sky!",
          targetPops: 16,
          arrows: 7,
          windRange: [0, 0],
          obstacles: [],
          balloonGen: () => {
            const list = [];
            const hubs = [
              { x: 540, y: 300 },
              { x: 750, y: 380 },
              { x: 960, y: 300 }
            ];
            hubs.forEach(hub => {
              list.push(new Balloon(hub.x, hub.y, 'bomb', '#0f172a', 55));
              for (let i = 0; i < 4; i++) {
                const angle = (Math.PI * 2 / 4) * i;
                const bx = hub.x + Math.cos(angle) * 55;
                const by = hub.y + Math.sin(angle) * 55;
                list.push(new Balloon(bx, by, 'normal', this.colors[Math.floor(Math.random() * this.colors.length)], 55));
              }
            });
            list.push(new Balloon(750, 220, 'star', '#ffd700', 60));
            return list;
          }
        };

      case 8:
        return {
          title: "Speed Rush",
          description: "Rapidly ascending balloons! Use freeze & fire arrows wisely.",
          targetPops: 15,
          arrows: 10,
          windRange: [-80, 80],
          obstacles: [],
          balloonGen: () => {
            const list = [];
            list.push(new Balloon(520, 260, 'freeze', '#38bdf8', 110));
            list.push(new Balloon(880, 360, 'freeze', '#38bdf8', 110));
            list.push(new Balloon(700, 300, 'fire_powerup', '#f97316', 100));

            for (let i = 0; i < 12; i++) {
              const x = 480 + Math.random() * 520;
              const y = 140 + Math.random() * 450;
              list.push(new Balloon(x, y, 'normal', this.colors[i % this.colors.length], 100 + Math.random() * 25));
            }
            return list;
          }
        };

      case 9:
        return {
          title: "Moving Shields",
          description: "Patrolling wooden barricades block your flight path!",
          targetPops: 12,
          arrows: 9,
          windRange: [-100, 100],
          obstacles: [
            new Obstacle(580, 360, 24, 130, 'moving_plank', 1.0),
            new Obstacle(780, 340, 24, 130, 'moving_plank', 1.4)
          ],
          balloonGen: () => {
            const list = [];
            for (let i = 0; i < 12; i++) {
              const x = 670 + (i % 2 === 0 ? 0 : 230) + (Math.random() - 0.5) * 30;
              const y = 150 + Math.floor(i / 2) * 85;
              const type = i === 1 ? 'quiver' : i === 8 ? 'bomb' : 'normal';
              list.push(new Balloon(x, y, type, this.colors[i % this.colors.length], 65));
            }
            return list;
          }
        };

      case 10:
      default:
        return {
          title: "Grand Carnival Finale",
          description: "The ultimate carnival test! Windmills, wind, bombs, and stars!",
          targetPops: 20,
          arrows: 12,
          windRange: [-160, 160],
          obstacles: [
            new Obstacle(580, 320, 22, 220, 'windmill', 1.5),
            new Obstacle(860, 400, 22, 220, 'windmill', -1.3)
          ],
          balloonGen: () => {
            const list = [];
            list.push(new Balloon(500, 280, 'bomb', '#0f172a', 60));
            list.push(new Balloon(720, 340, 'freeze', '#38bdf8', 70));
            list.push(new Balloon(940, 280, 'bomb', '#0f172a', 60));
            list.push(new Balloon(620, 220, 'star', '#ffd700', 65));
            list.push(new Balloon(820, 220, 'star', '#ffd700', 65));
            list.push(new Balloon(720, 460, 'triple_powerup', '#6366f1', 60));

            for (let i = 0; i < 14; i++) {
              const x = 480 + Math.random() * 560;
              const y = 140 + Math.random() * 460;
              list.push(new Balloon(x, y, 'normal', this.colors[i % this.colors.length], 65 + Math.random() * 25));
            }
            return list;
          }
        };
    }
  }

  // Endless mode spawner generator
  spawnEndlessBalloon(canvasWidth, canvasHeight, currentScore, startOnScreen = false) {
    const minX = 450;
    const maxX = Math.min(canvasWidth - 90, 1150);
    const x = minX + Math.random() * (maxX - minX);
    const y = startOnScreen ? (140 + Math.random() * 480) : (canvasHeight + 40);

    // Determine type by roll
    const roll = Math.random();
    let type = 'normal';
    if (roll < 0.10) type = 'bomb';
    else if (roll < 0.18) type = 'freeze';
    else if (roll < 0.25) type = 'quiver';
    else if (roll < 0.33) type = 'star';
    else if (roll < 0.38) type = 'fire_powerup';
    else if (roll < 0.43) type = 'triple_powerup';

    // Difficulty increases speed gradually
    const baseSpeed = 60 + Math.min(70, Math.floor(currentScore / 300) * 8);
    const speed = baseSpeed + Math.random() * 20;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];

    return new Balloon(x, y, type, color, speed);
  }
}
