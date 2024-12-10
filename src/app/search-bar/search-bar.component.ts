import { Component } from '@angular/core';
import { FilterService } from '../filter.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  searchText: string = '';
  constructor(private filterService: FilterService) {}

  search() {
    this.filterService.updateSearchText(this.searchText);
  }

  resetSearch() {
    this.searchText = '';
    this.filterService.updateSearchText(this.searchText);
    this.filterService.resetAll();
  }

  searchOnEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.filterService.updateSearchText(this.searchText);
    }
  }
}
