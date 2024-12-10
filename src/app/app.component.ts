import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';
  isActionBarVisible: boolean = false;

  onActionBarVisibilityChange(isVisible: boolean) {
    this.isActionBarVisible = isVisible;
  }
}
