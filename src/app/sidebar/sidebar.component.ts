import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isRating: boolean = true;
  isHighlighted: boolean = false;

  toggleRating(): void {
    this.isRating = !this.isRating;
    if (!this.isRating) this.isHighlighted = false;
  }

  toggleQuestion(): void {
    this.isHighlighted = !this.isHighlighted;
  }
}
