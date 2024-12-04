import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'my-angular-app';
  isDisabled = false; 
  rowsPerPage = 25;
  rowCount = 100; 
  currentPage = 1;
  statuses: string[] = [];

  handleSearch(query: string): void {
    console.log('Search query:', query);
  }

  handleReset(): void {
    console.log('Reset filters');
  }

  handleChangePage(page: number): void {
    this.currentPage = page;
    console.log('Changed to page:', page);
  }

  handleChangeRowsPerPage(rows: number): void {
    this.rowsPerPage = rows;
    this.currentPage = 1; 
    console.log('Rows per page:', rows);
  }

}
