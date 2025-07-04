import { Component, computed, effect, inject, signal } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { CommonModule } from '@angular/common';
import { EvolutionRouteComponent } from '../evolution-route/evolution-route.component';
import { ButtonComponent } from '../button/button.component';
import { ModalService } from '../modal/modal.service';
import { EvolutionTreeModalComponent } from '../evolution-tree-modal/evolution-tree-modal.component';
import { BaseDigimon } from '../../../core/interfaces/digimon.interface';
import { AudioEffects } from '../../../core/enums/audio-tracks.enum';
import { AudioService } from '../../../services/audio.service';

@Component({
  standalone: true,
  selector: 'app-digimon-details-modal',
  templateUrl: './digimon-details-modal.component.html',
  styleUrl: './digimon-details-modal.component.scss',
  imports: [
    ModalComponent,
    CommonModule,
    EvolutionRouteComponent,
    ButtonComponent,
    EvolutionTreeModalComponent,
  ],
})
export class DigimonDetailsModalComponent {
  digimonDetailsModalId = 'digimon-details-modal';
  evolutionTreeModalId = 'evolution-tree-modal';

  globalState = inject(GlobalStateDataSource);
  modalService = inject(ModalService);
  audioService = inject(AudioService);

  digimonDetailedAge = computed(() => {
    if (!this.globalState.selectedDigimonOnDetailsAccessor) return;

    return this.formatAge(
      this.calculateDetailedAge(
        this.globalState.selectedDigimonOnDetailsAccessor.birthDate ??
          new Date()
      )
    );
  });

  neededExpForNextLevel = computed(() =>
    this.globalState.getDigimonNeededExpForNextLevel()
  );

  evolutionRoute = signal<BaseDigimon[]>([]);

  constructor() {
    effect(
      () => {
        this.globalState.selectedDigimonOnDetailsAccessor;
        const evolutionList = this.globalState.getDigimonCurrentEvolutionRoute(
          this.globalState.selectedDigimonOnDetailsAccessor!
        );

        if (!evolutionList) {
          this.evolutionRoute.set([]);
          return;
        }

        this.evolutionRoute.set(evolutionList);
      }
    );
  }

  calculateDetailedAge(birthDate: Date): {
    years: number;
    months: number;
    days: number;
    hours: number;
  } {
    const currentDate = new Date();
    const birth = new Date(birthDate);

    let years = currentDate.getFullYear() - birth.getFullYear();
    let months = currentDate.getMonth() - birth.getMonth();
    let days = currentDate.getDate() - birth.getDate();
    let hours = currentDate.getHours() - birth.getHours();

    const HOURS_IN_A_DAY = 24;
    const MONTHS_IN_A_YEAR = 12;

    if (hours < 0) {
      hours += HOURS_IN_A_DAY;
      days--;
    }

    if (days < 0) {
      const previousMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      );
      days += previousMonth.getDate();
      months--;
    }

    if (months < 0) {
      months += MONTHS_IN_A_YEAR;
      years--;
    }

    return { years, months, days, hours };
  }

  formatAge(age: {
    years: number;
    months: number;
    days: number;
    hours: number;
  }): string {
    const parts = [];

    if (age.years > 0) {
      parts.push(`${age.years} year${age.years > 1 ? 's' : ''}`);
    }
    if (age.months > 0) {
      parts.push(`${age.months} month${age.months > 1 ? 's' : ''}`);
    }
    if (age.days > 0) {
      parts.push(`${age.days} day${age.days > 1 ? 's' : ''}`);
    }
    if (age.hours > 0) {
      parts.push(`${age.hours} hour${age.hours > 1 ? 's' : ''}`);
    }

    return parts.join(', ') || 'less than an hour';
  }

  openEvolutionTreeModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.evolutionTreeModalId);
  }
}
