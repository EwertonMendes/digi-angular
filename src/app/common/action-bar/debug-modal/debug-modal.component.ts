import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { DigimonSelectionModalComponent } from '../../../shared/components/digimon-selection-modal/digimon-selection-modal.component';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { DigimonService } from '../../../services/digimon.service';
import { BaseDigimon } from '../../../core/interfaces/digimon.interface';

import { FormsModule } from '@angular/forms';
import { EvolutionTreeModalComponent } from 'app/shared/components/evolution-tree-modal/evolution-tree-modal.component';
import { Subject, takeUntil } from 'rxjs';
import { CheckboxComponent } from 'app/shared/components/checkbox/checkbox.component';

@Component({
  selector: 'app-debug-modal',
  standalone: true,
  imports: [
    ModalComponent,
    ButtonComponent,
    DigimonSelectionModalComponent,
    FormsModule,
    EvolutionTreeModalComponent,
    CheckboxComponent
  ],
  templateUrl: './debug-modal.component.html',
  styleUrl: './debug-modal.component.scss',
})
export class DebugModalComponent {
  debugModalId = 'debug-modal';
  giveSelectedDigimonModalId = 'give-selected-digimon-modal-debug';
  seeEvolutionTreeModalId = 'see-evolution-tree-modal-debug';
  evolutionTreeModalId = 'evolution-tree-modal-debug';

  selectedEvolutionLineDigimon = signal<BaseDigimon>({} as BaseDigimon);
  selectableDigimonList = signal<BaseDigimon[]>([]);
  selectedLevel = 1;
  totalDigimonAmount = 0;
  generateEvolutionLine = false;
  $OnDestroy = new Subject<void>();

  globalState = inject(GlobalStateDataSource);
  toastService = inject(ToastService);
  modalService = inject(ModalService);
  digimonService = inject(DigimonService);
  changeDectorRef = inject(ChangeDetectorRef);

  tools = [
    { name: 'Give Random Digimon', action: this.giveRandomDigimon.bind(this) },
    {
      name: 'Give Certain Digimon',
      action: this.openGivenCertainDigimonModal.bind(this),
    },
    { name: 'Reset Storage', action: this.resetStorage.bind(this) },
    { name: 'See Evolution Lines', action: this.openSeeEvolutionLinesDigimonModal.bind(this) },
  ];

  onOpen() {
    if (this.selectableDigimonList().length !== 0) return;
    this.digimonService.baseDigimonData$.pipe(takeUntil(this.$OnDestroy)).subscribe((data) => {
      this.selectableDigimonList.set(
        data.sort((a, b) => a.name.localeCompare(b.name))
      );
      this.totalDigimonAmount = data.length;
    });
  }

  onClose() {
    this.selectableDigimonList.set([]);
    this.$OnDestroy.next();
    this.$OnDestroy.complete();
  }

  giveRandomDigimon() {
    const digimon = this.globalState.generateRandomDigimon();
    this.globalState.addDigimonToStorage(digimon);
    this.toastService.showToast(
      `${digimon.name} was added to storage!`,
      'success'
    );
  }

  giveSelectedDigimon(digimon: BaseDigimon) {
    const newDigimon = this.globalState.generateDigimonBySeed(
      digimon.seed,
      this.selectedLevel,
      this.generateEvolutionLine
    );

    this.globalState.addDigimonToStorage(newDigimon);

    this.toastService.showToast(
      `${digimon.name} (Lv. ${this.selectedLevel}) was added to storage!`,
      'success'
    );

    this.modalService.close(this.giveSelectedDigimonModalId);
  }

  openEvolutionTreeModal(digimon: BaseDigimon) {
    this.selectedEvolutionLineDigimon.set(digimon);
    this.changeDectorRef.detectChanges();
    this.modalService.open(this.evolutionTreeModalId);
  }

  async refreshDigimonList() {
    await this.digimonService.readBaseDigimonDatabase();
    this.changeDectorRef.detectChanges();
  }

  validateLevel(value: number): void {
    this.selectedLevel = Math.max(1, Math.min(value, 100));
  }

  resetStorage() {
    this.globalState.resetStorage();
    this.toastService.showToast('Storage reset!', 'success');
  }

  openGivenCertainDigimonModal() {
    this.modalService.open(this.giveSelectedDigimonModalId);
  }

  openSeeEvolutionLinesDigimonModal() {
    this.modalService.open(this.seeEvolutionTreeModalId);
  }
}
