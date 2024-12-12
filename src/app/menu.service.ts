import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private selectedMainMenuSubject = new BehaviorSubject<string | null>(null);
  selectedMainMenu$ = this.selectedMainMenuSubject.asObservable();

  private selectedSubMenuSubject = new BehaviorSubject<string | null>(null);
  selectedSubMenu$ = this.selectedSubMenuSubject.asObservable();

  selectMainMenu(menu: string | null) {
    this.selectedMainMenuSubject.next(menu);
    if (!menu) {
      this.selectedSubMenuSubject.next(null);
    }
  }

  selectSubMenu(subMenu: string | null) {
    this.selectedSubMenuSubject.next(subMenu);
  }
}