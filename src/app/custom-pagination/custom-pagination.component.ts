// src/app/custom-pagination/custom-pagination.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-custom-pagination',
  templateUrl: './custom-pagination.component.html',
  styleUrls: ['./custom-pagination.component.scss']
})
export class CustomPaginationComponent {
  @Input() rowsPerPage!: number;
  @Input() rowCount!: number;
  @Input() currentPage!: number;
  
  @Output() onChangePage = new EventEmitter<number>();
  @Output() onChangeRowsPerPage = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.rowCount / this.rowsPerPage);
  }

  groupSize: number = 3;

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const groupNumber = Math.floor((this.currentPage - 1) / this.groupSize) + 1;
    const firstPageInGroup = (groupNumber - 1) * this.groupSize + 1;
    const lastPageInGroup = Math.min(firstPageInGroup + this.groupSize - 1, this.totalPages);

    if (firstPageInGroup > 1) {
      pages.push('left-ellipsis');
    }

    for (let i = firstPageInGroup; i <= lastPageInGroup; i++) {
      pages.push(i);
    }

    if (lastPageInGroup < this.totalPages) {
      pages.push('right-ellipsis');
    }

    return pages;
  }

  handleFirst(): void {
    if (this.currentPage > 1) {
      this.onChangePage.emit(1);
    }
  }

  handleLast(): void {
    if (this.currentPage < this.totalPages) {
      this.onChangePage.emit(this.totalPages);
    }
  }

  handlePrev(): void {
    if (this.currentPage > 1) {
      this.onChangePage.emit(this.currentPage - 1);
    }
  }

  handleNext(): void {
    if (this.currentPage < this.totalPages) {
      this.onChangePage.emit(this.currentPage + 1);
    }
  }

  handleEllipsis(type: string): void {
    if (type === 'left') {
      const targetPage = Math.max(this.currentPage - this.groupSize, 1);
      this.onChangePage.emit(targetPage);
    } else if (type === 'right') {
      const targetPage = Math.min(this.currentPage + this.groupSize, this.totalPages);
      this.onChangePage.emit(targetPage);
    }
  }

  changeRowsPerPage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value ? +selectElement.value : this.rowsPerPage;
    this.onChangeRowsPerPage.emit(value);
  }

  pageButtonClick(page: number | string): void {
    if (typeof page === 'number') {
      this.onChangePage.emit(page);
    } else if (page === 'left-ellipsis' || page === 'right-ellipsis') {
      const type = page === 'left-ellipsis' ? 'left' : 'right';
      this.handleEllipsis(type);
    }
  }
}
