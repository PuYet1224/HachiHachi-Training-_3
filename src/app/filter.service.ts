import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private selectedStatues = new BehaviorSubject<string[]>(['Đang soạn thảo']);
  selectedStatues$ = this.selectedStatues.asObservable();

  private searchText = new BehaviorSubject<string>('');
  searchText$ = this.searchText.asObservable();

  private resetSubject = new Subject<void>();
  reset$ = this.resetSubject.asObservable();

  updateSelectedStatues(statues: string[]) {
    this.selectedStatues.next(statues);
  }

  updateSearchText(text: string) {
    this.searchText.next(text);
  }

  resetAll() {
    this.resetSubject.next();
  }

  constructor() {}
}
