import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuService } from '../menu.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-headerwide',
  templateUrl: './headerwide.component.html',
  styleUrls: ['./headerwide.component.scss']
})
export class HeaderwideComponent implements OnInit, OnDestroy {
  selectedMainMenu: string | null = null;
  activeHyphenLine: number | null = null;
  private subscriptions: Subscription = new Subscription();
  
  isHyphenDropdownOpen: boolean = false;
  
  constructor(private menuService: MenuService) {}
  
  ngOnInit() {
    this.subscriptions.add(
      this.menuService.selectedMainMenu$.subscribe((menu) => {
        this.selectedMainMenu = menu;
      })
    );
  }
  
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  
  onHyphenLineClick(id: number) {
    if (this.activeHyphenLine === id) {
      this.activeHyphenLine = null;
      this.isHyphenDropdownOpen = false;
    } else {
      this.activeHyphenLine = id;
      this.isHyphenDropdownOpen = true;
      this.menuService.selectMainMenu(null); 
    }
  }
  
  onNhanSuClick() {
    this.activeHyphenLine = null; 
    this.menuService.selectMainMenu('nhanSu');
  }
  
  isHyphenActive(id: number): boolean {
    return this.activeHyphenLine === id;
  }
  
  isNhanSuActive(): boolean {
    return this.selectedMainMenu === 'nhanSu';
  }
}
