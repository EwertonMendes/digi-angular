import { Component, computed, inject, input, signal } from '@angular/core';
import { Digimon } from '../../../core/interfaces/digimon.interface';
import { CommonModule } from '@angular/common';
import {
  animate,
  state,
  style,
  transition,
  trigger,
  keyframes,
} from '@angular/animations';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { pairwise, startWith } from 'rxjs';

@Component({
  selector: 'app-digi-status-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './digi-status-card.component.html',
  styleUrls: ['./digi-status-card.component.scss'],
  animations: [
    trigger('damage', [
      state('normal', style({ transform: 'translateX(0)' })),
      state('attacked', style({ transform: 'translateX(10px)' })),
      transition('normal => attacked', [
        animate('0.1s ease-in', style({ transform: 'translateX(20px)' })),
        animate('0.1s ease-out', style({ transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('fadeUp', [
      transition(':enter', [
        animate(
          '3s',
          keyframes([
            style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
            style({ opacity: 0, transform: 'translateY(-50px)', offset: 1 }),
          ])
        ),
      ]),
    ]),
  ],
})
export class DigiStatusCardComponent {
  digimon = input.required<Digimon>();
  globalState = inject(GlobalStateDataSource);
  hpChange = signal<any>({
    hpChangeValue: 0,
    changeType: 'none',
  });
  showHpChange = signal(false);

  damageState = computed(() => {
    return this.globalState.currentDefendingDigimon()?.id === this.digimon().id
      ? 'attacked'
      : 'normal';
  });

  constructor() {
    this.globalState.digimonHpChanges$
      .pipe(startWith(null), pairwise())
      .subscribe(([prev, current]) => {
        if (current?.digimonId !== this.digimon().id || !prev || !current)
          return;
        if (this.showHpChange()) {
          this.showHpChange.set(false);
        }
        setTimeout(() => {
          this.showHpChange.set(true);
          this.hpChange.set({
            hpChangeValue: current?.difference ?? 0,
            changeType:
              current.currentHp >= prev.currentHp ? 'healing' : 'damage',
          });
        }, 100);
      });
  }

  resetDamageState() {
    this.globalState.currentDefendingDigimon.set(null);
  }

  onHpChangeAnimationDone() {
    this.showHpChange.set(false);
    this.hpChange.set({
      hpChangeValue: 0,
      changeType: 'none',
    });
  }
}
