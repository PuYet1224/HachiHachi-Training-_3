import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-action-popup',
  templateUrl: './action-popup.component.html',
  styleUrls: ['./action-popup.component.scss']
})
export class ActionPopupComponent {
  @Input() selectedCount!: number;
  @Input() statuses!: string[];

  @Output() onSend = new EventEmitter<void>();
  @Output() onApprove = new EventEmitter<void>();
  @Output() onHide = new EventEmitter<void>();
  @Output() onReturn = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();

  canShowSend(): boolean {
    return this.statuses.some(status => ["Đang soạn thảo", "Trả về"].includes(status));
  }

  canShowApprove(): boolean {
    return this.statuses.some(status => ["Gửi duyệt", "Ngừng áp dụng"].includes(status));
  }

  canShowHide(): boolean {
    return this.statuses.includes("Duyệt áp dụng");
  }

  canShowReturn(): boolean {
    return this.statuses.some(status => ["Gửi duyệt", "Ngừng áp dụng"].includes(status));
  }
}
