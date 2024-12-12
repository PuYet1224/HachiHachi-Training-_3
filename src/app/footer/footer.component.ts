import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnChanges {
  @Input() rowsPerPage: number = 25;
  @Input() rowCount: number = 0;
  @Input() currentPage: number = 1; 
  @Input() disabled: boolean = false; 

  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  totalPages: number = 1;
  groupSize: number = 3; 
  left_arrow = 'assets/left-chevron.png';
  right_arrow = 'assets/right-chevron.png';

  ngOnChanges(): void {
    this.calculateTotalPages();
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.rowCount / this.rowsPerPage);
    if (this.totalPages < 1) {
      this.totalPages = 1;
    }
  }

  onItemsPerPageChangeSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newRowsPerPage = Number(target.value);
    this.itemsPerPageChange.emit(newRowsPerPage);
  }

  handleFirst() {
    if (this.currentPage > 1) {
      this.pageChange.emit(1);
    }
  }

  handleLast() {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.totalPages);
    }
  }

  handlePrev() {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  handleNext() {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  handleEllipsis(type: 'left' | 'right') {
    const groupNumber = Math.floor((this.currentPage - 1) / this.groupSize) + 1;
    const firstPageInGroup = (groupNumber - 1) * this.groupSize + 1;
    const lastPageInGroup = Math.min(firstPageInGroup + this.groupSize - 1, this.totalPages);

    let targetPage = 1;
    if (type === 'left') {
      targetPage = firstPageInGroup - 1;
      this.pageChange.emit(targetPage >= 1 ? targetPage : 1);
    } else {
      targetPage = lastPageInGroup + 1;
      this.pageChange.emit(targetPage <= this.totalPages ? targetPage : this.totalPages);
    }
  }

  getPageNumbers(currentPage: number, totalPages: number, groupSize: number): (number | string)[] {
    const pages: (number | string)[] = [];
    const groupNumber = Math.floor((currentPage - 1) / groupSize) + 1;
    const firstPageInGroup = (groupNumber - 1) * groupSize + 1;
    const lastPageInGroup = Math.min(firstPageInGroup + groupSize - 1, totalPages);

    if (firstPageInGroup > 1) {
      pages.push('left-ellipsis');
    }

    for (let i = firstPageInGroup; i <= lastPageInGroup; i++) {
      pages.push(i);
    }

    if (lastPageInGroup < totalPages) {
      pages.push('right-ellipsis');
    }

    return pages;
  }

  get pages() {
    return this.getPageNumbers(this.currentPage, this.totalPages, this.groupSize);
  }

  isNumberPage(page: number|string): boolean {
    return typeof page === 'number';
  }

  isLeftEllipsis(page: number|string): boolean {
    return page === 'left-ellipsis';
  }

  isRightEllipsis(page: number|string): boolean {
    return page === 'right-ellipsis';
  }

  goToPage(page: number|string) {
    if (this.isNumberPage(page)) {
      this.pageChange.emit(page as number);
    }
  }

  isActivePage(page: number|string): boolean {
    return this.isNumberPage(page) && this.currentPage === (page as number);
  }
}
