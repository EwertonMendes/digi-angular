import { Injectable } from '@angular/core';
import { Digimon } from '../core/interfaces/digimon.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class DigimonService {
  baseDigimonData!: Digimon[];

  constructor() {
    this.initializeBaseDigimonData();
  }

  private async initializeBaseDigimonData() {
    this.baseDigimonData = await fetch('database/base-digimon-list.json').then(
      (res) => res.json()
    );
  }

  getBaseDigimonDataBySeed(seed: string) {
    return this.baseDigimonData.find((digimon) => digimon.seed === seed);
  }

  getBaseDigimonDataById(id: string) {
    return this.baseDigimonData.find((digimon) => digimon.seed === id);
  }

  generateRandomDigimon() {
    const randomDigimonIndex = Math.floor(
      Math.random() * this.baseDigimonData.length
    );
    const newDigimon = this.baseDigimonData[randomDigimonIndex];

    newDigimon.id = uuidv4();

    return newDigimon;
  }
}
