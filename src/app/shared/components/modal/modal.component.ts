import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  Input,
  OnDestroy,
  OnInit,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { ModalService } from './modal.service';
import { AudioService } from '../../../services/audio.service';
import { AudioEffects } from '../../../core/enums/audio-tracks.enum';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) id!: string;
  isUnique = input<boolean>(false);
  closable = input<boolean>(true);
  element: HTMLElement;

  openEvent = output<void>();
  closeEvent = output<void>();

  modalService = inject(ModalService);
  audioService = inject(AudioService);
  elementRef = inject(ElementRef<HTMLElement>);

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    this.close(true);
  }

  constructor() {
    this.element = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.modalService.add(this);
  }

  ngOnDestroy(): void {
    this.modalService.remove(this.id);
  }

  open(): void {
    this.element.style.display = 'block';
    this.openEvent.emit();
  }

  close(playClickSound: boolean = false): void {
    if (!this.closable()) return;
    if (this.modalService.getLastOpenModal() !== this) return;
    this.modalService.removeLastOpenModal();
    if (playClickSound) {
      this.audioService.playAudio(AudioEffects.CLICK_ALTERNATIVE);
    }
    this.element.style.display = 'none';
    this.closeEvent.emit();
  }
}
