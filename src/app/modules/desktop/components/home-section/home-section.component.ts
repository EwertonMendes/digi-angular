import { Component, inject } from '@angular/core';
import { DigiStatusCardComponent } from '../../../../shared/components/digi-status-card/digi-status-card.component';
import { GlobalStateDataSource } from '../../../../state/global-state.datasource';
import { Digimon } from '../../../../core/interfaces/digimon.interface';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DigimonListLocation } from '../../../../core/enums/digimon-list-location.enum';
import { PlayerData } from '../../../../core/interfaces/player-data.interface';
import { AudioService } from '../../../../services/audio.service';
import { AudioEffects } from '../../../../core/enums/audio-tracks.enum';

@Component({
  selector: 'app-home-section',
  standalone: true,
  imports: [DigiStatusCardComponent, DragDropModule],
  templateUrl: './home-section.component.html',
  styleUrl: './home-section.component.scss',
})
export class HomeSectionComponent {
  digimonDetailsModalId = 'digimon-details-modal';
  globalState = inject(GlobalStateDataSource);
  modalService = inject(ModalService);
  audioService = inject(AudioService);

  teamListId = 'team-list';
  inTrainingListId = 'in-training-digimon-list';
  bitFarmingListId = 'bit-farming-digimon-list';
  hospitalListId = 'hospital-digimon-list';

  listLocations: Record<string, string> = {
    'in-training-digimon-list': DigimonListLocation.IN_TRAINING,
    'bit-farming-digimon-list': DigimonListLocation.BIT_FARM,
    'team-list': DigimonListLocation.TEAM,
    'hospital-digimon-list': DigimonListLocation.HOSPITAL,
  };

  removeDigimonFromLocation(
    event: MouseEvent,
    digimon: Digimon,
    location: string
  ): void {
    event.preventDefault();
    if (!digimon.id) return;
    this.audioService.playAudio(AudioEffects.CLICK_ALTERNATIVE);
    this.globalState.addDigimonToStorage(digimon, location);
  }

  openDigimonDetailsModal(digimon: Digimon): void {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.globalState.setSelectedDigimonOnDetailsAccessor(digimon);
    this.modalService.open(this.digimonDetailsModalId);
  }

  drop(event: CdkDragDrop<PlayerData>) {
    const { previousContainer, container, previousIndex, currentIndex } = event;

    if (previousContainer === container) {
      this.handleSameContainerDrop(container.id, previousIndex, currentIndex);
      return;
    }

    this.handleDifferentContainerDrop(
      previousContainer.id,
      container.id,
      previousIndex,
      currentIndex
    );
  }

  private handleSameContainerDrop(
    containerId: string,
    previousIndex: number,
    currentIndex: number
  ) {
    const handlers = {
      [this.teamListId]: () =>
        moveItemInArray(
          this.globalState.playerDataAcessor.digimonList,
          previousIndex,
          currentIndex
        ),
      [this.hospitalListId]: () =>
        moveItemInArray(
          this.globalState.playerDataAcessor.hospitalDigimonList,
          previousIndex,
          currentIndex
        ),
    };

    const handler = handlers[containerId];
    if (handler) {
      handler();
    }
  }

  private handleDifferentContainerDrop(
    previousContainerId: string,
    containerId: string,
    previousIndex: number,
    currentIndex: number
  ) {
    const digimon = this.getDigimonFromPreviousContainer(
      previousContainerId,
      previousIndex
    );

    const action = this.listLocations[previousContainerId];

    const handlers = {
      [this.teamListId]: () => {
        this.globalState.addDigimonToList(digimon, action);
        moveItemInArray(
          this.globalState.playerDataAcessor.digimonList,
          this.globalState.playerDataAcessor.digimonList.length - 1,
          currentIndex
        );
      },
      [this.hospitalListId]: () => {
        this.globalState.addDigimonToHospital(digimon, action),
          moveItemInArray(
            this.globalState.playerDataAcessor.hospitalDigimonList,
            this.globalState.playerDataAcessor.hospitalDigimonList.length - 1,
            currentIndex
          );
      },
    };

    const handler = handlers[containerId];
    if (handler) {
      handler();
    }
  }

  private getDigimonFromPreviousContainer(
    containerId: string,
    index: number
  ): Digimon {
    const lists = {
      [this.inTrainingListId]:
        this.globalState.playerDataAcessor.inTrainingDigimonList,
      [this.bitFarmingListId]:
        this.globalState.playerDataAcessor.bitFarmDigimonList,
      [this.teamListId]: this.globalState.playerDataAcessor.digimonList,
      [this.hospitalListId]:
        this.globalState.playerDataAcessor.hospitalDigimonList,
    };

    const list = lists[containerId];
    if (list) {
      return list[index];
    }

    throw new Error('Invalid container ID');
  }
}
