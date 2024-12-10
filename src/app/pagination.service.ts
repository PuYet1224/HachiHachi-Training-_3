import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaginationService {
  private itemsPerPageSource = new BehaviorSubject<number>(25); 
  private currentPageSource = new BehaviorSubject<number>(1); 

  itemsPerPage$ = this.itemsPerPageSource.asObservable();
  currentPage$ = this.currentPageSource.asObservable();

  setItemsPerPage(itemsPerPage: number) {
    this.itemsPerPageSource.next(itemsPerPage);
  }

  setCurrentPage(page: number) {
    this.currentPageSource.next(page);
  }
}
