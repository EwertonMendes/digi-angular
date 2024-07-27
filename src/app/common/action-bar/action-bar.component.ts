import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { DigiStatusCardComponent } from '../../shared/components/digi-status-card/digi-status-card.component';
import { GlobalStateDataSource } from '../../state/global-state.datasource';
import { ModalService } from '../../shared/components/modal/modal.service';
import { Digimon } from '../../core/interfaces/digimon.interface';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [ButtonComponent, ModalComponent, DigiStatusCardComponent],
  templateUrl: './action-bar.component.html',
  styleUrl: './action-bar.component.scss',
})
export class ActionBarComponent {
  digimonStorageModalId = 'digimon-storage-modal';
  digimonDetailsModalId = 'digimon-details-modal';

  globalState = inject(GlobalStateDataSource);
  modalService = inject(ModalService);

  openDigimonStorageModal() {
    this.modalService.open(this.digimonStorageModalId);
  }

  openDigimonDetailsModal(digimon: Digimon) {
    this.globalState.selectedDigimonOnDetails.set(digimon);
    this.modalService.open(this.digimonDetailsModalId);
  }

  addDigimonToTeam(digimon: Digimon) {
    this.globalState.addDigimonToList(digimon);
  }

  addDigimonToTraining(digimon: Digimon) {
    this.globalState.addDigimonToTraining(digimon);
  }

  addDigimonToFarm(digimon: Digimon) {
    this.globalState.addDigimonToFarm(digimon);
  }
}
