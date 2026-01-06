import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent {
  

  @Input() id = 'confirmModal'; 
  
  @Input() title = 'Confirmar';
  
  @Input() body = '¿Estás seguro de que quieres realizar esta acción?';
  
  @Input() closeButtonText = 'Cancelar';

  @Input() confirmButtonText = 'Confirmar';
  
  @Input() confirmButtonClass = 'btn-danger';


  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  isOpen = false;

  constructor() { }

  onConfirmClick(): void {
    this.confirm.emit();
    this.closeModal();
  }

  open(): void {
    this.isOpen = true;
  }

  closeModal(): void {
    this.isOpen = false;
    this.close.emit();
  }
}