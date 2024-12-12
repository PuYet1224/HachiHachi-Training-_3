// filter.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private selectedStatuses = new BehaviorSubject<string[]>([
    'Đang soạn thảo',
    'Gửi duyệt',
    'Đã duyệt',
    'Ngừng áp dụng'
  ]);
  selectedStatuses$ = this.selectedStatuses.asObservable();

  private searchText = new BehaviorSubject<string>('');
  searchText$ = this.searchText.asObservable();

  private resetSubject = new Subject<void>();
  reset$ = this.resetSubject.asObservable();

  updateSelectedStatuses(statuses: string[]) { 
    this.selectedStatuses.next(statuses);
  }

  updateSearchText(text: string) {
    this.searchText.next(text);
  }

  resetAll() {
    this.selectedStatuses.next([]);
    this.searchText.next('');
    this.resetSubject.next();
  }

  constructor() {}
}
