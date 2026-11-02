import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth';
import { Icon } from '../../../core/icons';
import { Dialog } from '../../dialog';
import { SITE } from '../../../core/site';

@Component({
  selector: 'app-edit-guide-modal',
  standalone: true,
  imports: [CommonModule, Icon, Dialog],
  templateUrl: './edit-guide-modal.component.html',
  styleUrl: './edit-guide-modal.component.scss',
})
export class EditGuideModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly close = output<void>();

  protected readonly auth = inject(AuthService);
  protected readonly site = SITE;

  onClose() {
    this.close.emit();
  }
}
