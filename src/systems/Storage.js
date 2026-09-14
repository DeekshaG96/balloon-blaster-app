// LocalStorage persistence for high scores, coins, unlocked bows, achievements, and settings

export class Storage {
  static KEYS = {
    HIGH_SCORE_ENDLESS: 'arrowpop_endless_highscore',
    UNLOCKED_LEVEL: 'arrowpop_unlocked_level',
    BEST_COMBO: 'arrowpop_best_combo',
    COINS: 'arrowpop_coins',
    EQUIPPED_BOW: 'arrowpop_equipped_bow',
    UNLOCKED_BOWS: 'arrowpop_unlocked_bows',
    ACHIEVEMENTS: 'arrowpop_achievements',
    MUTED: 'arrowpop_muted'
  };

  static getCoins() {
    try {
      return parseInt(localStorage.getItem(this.KEYS.COINS) || '150', 10); // Start with 150 starter coins
    } catch {
      return 150;
    }
  }

  static addCoins(amount) {
    try {
      const updated = this.getCoins() + amount;
      localStorage.setItem(this.KEYS.COINS, updated.toString());
      return updated;
    } catch {
      return 0;
    }
  }

  static spendCoins(amount) {
    const current = this.getCoins();
    if (current >= amount) {
      localStorage.setItem(this.KEYS.COINS, (current - amount).toString());
      return true;
    }
    return false;
  }

  static getEquippedBow() {
    try {
      return localStorage.getItem(this.KEYS.EQUIPPED_BOW) || 'oak';
    } catch {
      return 'oak';
    }
  }

  static setEquippedBow(bowId) {
    try {
      localStorage.setItem(this.KEYS.EQUIPPED_BOW, bowId);
    } catch {}
  }

  static getUnlockedBows() {
    try {
      const saved = localStorage.getItem(this.KEYS.UNLOCKED_BOWS);
      return saved ? JSON.parse(saved) : ['oak'];
    } catch {
      return ['oak'];
    }
  }

  static unlockBow(bowId) {
    try {
      const bows = this.getUnlockedBows();
      if (!bows.includes(bowId)) {
        bows.push(bowId);
        localStorage.setItem(this.KEYS.UNLOCKED_BOWS, JSON.stringify(bows));
      }
    } catch {}
  }

  static getAchievements() {
    try {
      const saved = localStorage.getItem(this.KEYS.ACHIEVEMENTS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  static unlockAchievement(id) {
    try {
      const achs = this.getAchievements();
      if (!achs[id]) {
        achs[id] = Date.now();
        localStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify(achs));
        return true;
      }
    } catch {}
    return false;
  }

  static getEndlessHighScore() {
    try {
      return parseInt(localStorage.getItem(this.KEYS.HIGH_SCORE_ENDLESS) || '0', 10);
    } catch {
      return 0;
    }
  }

  static setEndlessHighScore(score) {
    try {
      const current = this.getEndlessHighScore();
      if (score > current) {
        localStorage.setItem(this.KEYS.HIGH_SCORE_ENDLESS, score.toString());
        return true;
      }
    } catch {}
    return false;
  }

  static getUnlockedLevel() {
    try {
      return parseInt(localStorage.getItem(this.KEYS.UNLOCKED_LEVEL) || '1', 10);
    } catch {
      return 1;
    }
  }

  static setUnlockedLevel(level) {
    try {
      const current = this.getUnlockedLevel();
      if (level > current) {
        localStorage.setItem(this.KEYS.UNLOCKED_LEVEL, level.toString());
      }
    } catch {}
  }

  static getBestCombo() {
    try {
      return parseInt(localStorage.getItem(this.KEYS.BEST_COMBO) || '0', 10);
    } catch {
      return 0;
    }
  }

  static setBestCombo(combo) {
    try {
      const current = this.getBestCombo();
      if (combo > current) {
        localStorage.setItem(this.KEYS.BEST_COMBO, combo.toString());
      }
    } catch {}
  }

  static isMuted() {
    try {
      return localStorage.getItem(this.KEYS.MUTED) === 'true';
    } catch {
      return false;
    }
  }

  static setMuted(val) {
    try {
      localStorage.setItem(this.KEYS.MUTED, val ? 'true' : 'false');
    } catch {}
  }
}
