import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss']
})
export class FilterBarComponent implements OnDestroy {
  @Input() isDisabled!: boolean;
  @Output() onSearch = new EventEmitter<string>();
  @Output() onReset = new EventEmitter<void>();

  searchText: string = '';
  private searchSubject: Subject<string> = new Subject<string>();
  private subscription: Subscription;

  constructor() {
    this.subscription = this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe((query) => {
      this.onSearch.emit(query.trim());
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSearchTextChange(value: string): void {
    this.searchText = value;
    this.searchSubject.next(this.searchText);
  }

  resetSearch(): void {
    this.searchText = '';
    this.onSearch.emit('');
    this.onReset.emit();
  }
}
