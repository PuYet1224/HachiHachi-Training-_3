// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuService } from './menu.service';
import { UiStateService } from './ui-state.service'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';
  isActionBarVisible: boolean = false;
  showFilterBar: boolean = false;
  showSearchBar: boolean = false;
  showTable: boolean = false;

  rowsPerPage: number = 25;
  rowCount: number = 0;
  currentPage: number = 1;

  notification: { message: string; type: string } | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private menuService: MenuService, 
    private uiStateService: UiStateService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.menuService.selectedSubMenu$.subscribe((subMenu) => {
        if (subMenu === 'nganHangCauHoi') {
          this.showFilterBar = true;
          this.showSearchBar = true;
          this.showTable = true;
        } else {
          this.showFilterBar = false;
          this.showSearchBar = false;
          this.showTable = false;
        }
      })
    );

    this.subscriptions.add(
      this.uiStateService.actionBarVisibility$.subscribe((isVisible) => {
        this.isActionBarVisible = isVisible;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Các phương thức khác nếu cần
}
