import { Component, computed, inject } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';

@Component({
  selector: 'app-player-info-modal',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './player-info-modal.component.html',
  styleUrl: './player-info-modal.component.scss',
})
export class PlayerInfoModalComponent {
  playerInfoModalId = 'player-info-modal';

  globalState = inject(GlobalStateDataSource);

  neededExpForNextLevel = computed(() => {
    return this.globalState.getNeededExpForNextLevel(
      this.globalState.playerDataAcessor
    );
  });
}
