import { Component, OnInit, OnDestroy } from '@angular/core';
import { FilterService } from '../filter.service';
import { UiStateService } from '../ui-state.service'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  searchText: string = '';
  isDisabled: boolean = false; 
  private subscriptions: Subscription = new Subscription();

  constructor(
    private filterService: FilterService,
    private uiStateService: UiStateService 
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.uiStateService.actionBarVisibility$.subscribe((isVisible) => {
        this.isDisabled = isVisible;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  search() {
    if (!this.isDisabled) { 
      this.filterService.updateSearchText(this.searchText);
    }
  }

  resetSearch() {
    if (!this.isDisabled) { 
      this.searchText = '';
      this.filterService.updateSearchText(this.searchText);
      this.filterService.resetAll();
    }
  }

  searchOnEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.isDisabled) { 
      this.filterService.updateSearchText(this.searchText);
    }
  }
}
