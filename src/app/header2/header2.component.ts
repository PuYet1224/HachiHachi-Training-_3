import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-header2',
  templateUrl: './header2.component.html',
  styleUrls: ['./header2.component.scss']
})
export class Header2Component implements AfterViewInit {
  @Input() isDisabled!: boolean;
  @Output() onFilterChange = new EventEmitter<string[]>();
  @Output() onSearch = new EventEmitter<string>();

  searchText: string = '';

  items: string[] = ["Đang soạn thảo", "Gửi duyệt", "Đã duyệt", "Ngừng áp dụng"];
  checkedStates: boolean[] = [true, false, false, false];
  isOverflowing: boolean = false;

  @ViewChild('header2') header2!: ElementRef;

  ngAfterViewInit(): void {
    this.checkOverflow();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkOverflow();
  }

  handleCheckboxChange(index: number): void {
    if (this.isDisabled) return;
    this.checkedStates[index] = !this.checkedStates[index];
    const selectedStatuses = this.items.filter((_, i) => this.checkedStates[i]);
    this.onFilterChange.emit(selectedStatuses);
  }

  resetFilters(): void {
    this.checkedStates = [true, false, false, false];
    const selectedStatuses = this.items.filter((_, i) => this.checkedStates[i]);
    this.onFilterChange.emit(selectedStatuses);
  }

  onSearchTextChange(event: any): void {
  }

  checkOverflow(): void {
    if (this.header2) {
      const element = this.header2.nativeElement;
      this.isOverflowing = element.scrollWidth > element.clientWidth;
    }
  }
}
