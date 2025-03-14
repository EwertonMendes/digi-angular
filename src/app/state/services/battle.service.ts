import { Injectable } from '@angular/core';
import { Digimon } from '../../core/interfaces/digimon.interface';
import { PlayerData } from '../../core/interfaces/player-data.interface';

@Injectable({
  providedIn: 'root',
})
export class BattleService {
  rankMultiplier: Record<string, number> = {
    Mega: 2.0,
    Ultimate: 1.75,
    Champion: 1.5,
    Rookie: 1.2,
    'In-Training': 0.7,
    Fresh: 0.4,
  };

  private maxLevel = 100;
  private maxHpMp = 999999;
  private maxOtherStats = 99999;

  private calculateDamage(attacker: Digimon, defender: Digimon) {
    let baseDamage =
      (attacker.atk - defender.def) * this.rankMultiplier[attacker.rank];
    baseDamage = Math.max(1, baseDamage);

    const criticalHit = Math.random() < 0.1 ? 1.5 : 1.0;
    const randomVariance = 0.9 + Math.random() * 0.2;

    return Math.floor(baseDamage * criticalHit * randomVariance);
  }

  attack(attacker: Digimon, defender: Digimon) {
    const damage = this.calculateDamage(attacker, defender);
    defender.currentHp -= damage;

    if (defender.currentHp <= 0) {
      defender.currentHp = 0;
    }
    return damage;
  }

  calculateExpGiven(defeatedDigimon: Digimon): number {
    const baseExp = 50;
    const rankMultiplier = this.rankMultiplier[defeatedDigimon.rank];
    const levelMultiplier = Math.pow(defeatedDigimon.level, 1.5);
    return Math.floor(baseExp * rankMultiplier * levelMultiplier);
  }

  calculateRequiredExpForLevel(level: number, baseExp: number = 100): number {
    return Math.floor(baseExp * (Math.pow(level, 1.75) + 3 * level));
  }

  calculateTotalGainedExp(playerData: PlayerData, defeatedDigimons: Digimon[]) {
    const totalExp = defeatedDigimons.reduce(
      (acc, digimon) => acc + this.calculateExpGiven(digimon),
      0
    );

    this.updatePlayerDigimonsExp(playerData, totalExp);
    this.updatePlayerExp(playerData, totalExp);

    return {
      playerData,
      totalExp,
    };
  }

  improveDigimonStats(digimon: Digimon) {
    const rankMultiplier = this.rankMultiplier[digimon.rank];
    const levelMultiplier = digimon.level * 0.1;
    const statCapByRank: Record<string, number> = {
      Mega: 99999,
      Ultimate: 80000,
      Champion: 60000,
      Rookie: 30000,
      'In-Training': 15000,
      Fresh: 5000,
    };

    const cappedStatIncrease = (baseStat: number, maxStat: number) => {
      const increase = Math.floor(
        baseStat * 0.02 + levelMultiplier + rankMultiplier
      );
      const statCap = statCapByRank[digimon.rank];
      const newStat = Math.min(
        baseStat + Math.max(1, increase),
        Math.min(maxStat, statCap)
      );
      return newStat;
    };

    digimon.atk = cappedStatIncrease(digimon.atk, this.maxOtherStats);
    digimon.def = cappedStatIncrease(digimon.def, this.maxOtherStats);
    digimon.speed = cappedStatIncrease(digimon.speed, this.maxOtherStats);

    digimon.maxHp = cappedStatIncrease(digimon.maxHp, this.maxHpMp);
    digimon.currentHp = digimon.maxHp;

    digimon.maxMp = cappedStatIncrease(digimon.maxMp, this.maxHpMp);
    digimon.currentMp = digimon.maxMp;
  }

  private updatePlayerDigimonsExp(playerData: PlayerData, totalExp: number) {
    playerData.digimonList.forEach((playerDigimon) => {
      if (!playerDigimon || playerDigimon.currentHp <= 0) return;
      if (playerDigimon.level >= this.maxLevel) return;

      playerDigimon.exp = Math.floor((playerDigimon.exp || 0) + totalExp);
      playerDigimon.totalExp = Math.floor(
        (playerDigimon.totalExp || 0) + totalExp
      );

      this.levelUpDigimon(playerDigimon);
    });
  }

  private levelUpDigimon(digimon: Digimon) {
    if (digimon.level >= this.maxLevel) return;
    if (!digimon.exp) digimon.exp = 0;

    let expForNextLevel = this.calculateRequiredExpForLevel(digimon.level);

    while (digimon.exp >= expForNextLevel && digimon.level < this.maxLevel) {
      digimon.exp -= expForNextLevel;
      digimon.level++;

      if (digimon.level >= this.maxLevel) {
        digimon.level = this.maxLevel;
        digimon.exp = 0;
        break;
      }

      expForNextLevel = this.calculateRequiredExpForLevel(digimon.level);

      this.improveDigimonStats(digimon);
    }
  }

  private updatePlayerExp(playerData: PlayerData, totalExp: number) {
    const playerMaxLevel = 200;
    if (playerData.level >= playerMaxLevel) return;

    playerData.exp += totalExp;
    playerData.totalExp += playerData.exp;

    let expForNextLevel = this.calculateRequiredExpForPlayerLevel(
      playerData.level
    );

    while (playerData.exp >= expForNextLevel) {
      playerData.exp -= expForNextLevel;
      playerData.level++;

      if (playerData.level >= playerMaxLevel) {
        playerData.level = playerMaxLevel;
        playerData.exp = 0;
        break;
      }

      expForNextLevel = this.calculateRequiredExpForPlayerLevel(
        playerData.level
      );

      if (playerData.exp < 0) {
        playerData.exp = 0;
      }
    }
  }

  calculateRequiredExpForPlayerLevel(
    level: number,
    baseExp: number = 300
  ): number {
    return Math.floor(baseExp * (Math.pow(level, 1.7) + 3 * level));
  }

  levelUpDigimonToLevel(digimon: Digimon, level: number) {
    if (level <= digimon.level) return digimon;

    while (digimon.level < level) {
      const expForNextLevel = this.calculateRequiredExpForLevel(digimon.level);

      if (!digimon.exp) digimon.exp = 0;
      digimon.exp += expForNextLevel;
      this.levelUpDigimon(digimon);
    }

    return digimon;
  }
}
