// Achievements system with unlock conditions, coin rewards, and notifications
import { Storage } from './Storage.js';

export const ACHIEVEMENTS = [
  {
    id: 'first_blood',
    title: 'First Target',
    description: 'Pop your very first balloon.',
    icon: '🎯',
    reward: 50
  },
  {
    id: 'combo_master',
    title: 'Sharpshooter',
    description: 'Achieve a 4x or higher combo multiplier.',
    icon: '⚡',
    reward: 100
  },
  {
    id: 'bomb_expert',
    title: 'Demolition Archer',
    description: 'Trigger 5 bomb balloon chain reactions.',
    icon: '💣',
    reward: 120
  },
  {
    id: 'cryo_archer',
    title: 'Absolute Zero',
    description: 'Freeze time using 3 frost balloons.',
    icon: '❄️',
    reward: 120
  },
  {
    id: 'fire_rush',
    title: 'Blazing Fury',
    description: 'Enter the ON FIRE Rush mode by keeping a combo alive.',
    icon: '🔥',
    reward: 150
  },
  {
    id: 'level_five',
    title: 'Carnival Veteran',
    description: 'Conquer Stage 5 with moving crosswinds.',
    icon: '🏆',
    reward: 200
  },
  {
    id: 'armory_collector',
    title: 'Master of Bows',
    description: 'Unlock and equip a special bow from the Armory.',
    icon: '🏹',
    reward: 250
  }
];

export class AchievementManager {
  constructor(onUnlock) {
    this.onUnlock = onUnlock;
    this.stats = {
      pops: 0,
      bombs: 0,
      freezes: 0,
      fireRushes: 0
    };
  }

  checkPops() {
    this.stats.pops++;
    if (this.stats.pops >= 1) this.tryUnlock('first_blood');
  }

  checkCombo(combo) {
    if (combo >= 4) this.tryUnlock('combo_master');
  }

  checkBomb() {
    this.stats.bombs++;
    if (this.stats.bombs >= 3) this.tryUnlock('bomb_expert');
  }

  checkFreeze() {
    this.stats.freezes++;
    if (this.stats.freezes >= 2) this.tryUnlock('cryo_archer');
  }

  checkFireRush() {
    this.stats.fireRushes++;
    this.tryUnlock('fire_rush');
  }

  checkLevel(level) {
    if (level >= 5) this.tryUnlock('level_five');
  }

  checkArmory(bowId) {
    if (bowId !== 'oak') this.tryUnlock('armory_collector');
  }

  tryUnlock(id) {
    const isNew = Storage.unlockAchievement(id);
    if (isNew) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        Storage.addCoins(ach.reward);
        if (this.onUnlock) {
          this.onUnlock(ach);
        }
      }
    }
  }
}
