import { Component } from '@angular/core';
import { MenuService } from '../menu.service'; 

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isEvaluationOpen = false;       
  isQuestionBankOpen = false;     
  isQuestionBankSelected = false; 

  constructor(private menuService: MenuService) {} 

  toggleEvaluation() {
    this.menuService.selectedMainMenu$.subscribe((menu) => {
      if (menu !== 'nhanSu') {
        this.isEvaluationOpen = false;
        this.isQuestionBankOpen = false;
        this.isQuestionBankSelected = false;
        return;
      }

      this.isEvaluationOpen = !this.isEvaluationOpen;
      if (!this.isEvaluationOpen) {
        this.isQuestionBankOpen = false;
        this.isQuestionBankSelected = false;
        this.menuService.selectSubMenu(null);
      }
    });
  }

  toggleQuestionBank() {
    this.isQuestionBankOpen = !this.isQuestionBankOpen;
    if (!this.isQuestionBankOpen) {
      this.isQuestionBankSelected = false;
      this.menuService.selectSubMenu(null); 
    }
  }

  selectQuestionBank() {
    this.isQuestionBankSelected = !this.isQuestionBankSelected;
    if (this.isQuestionBankSelected) {
      this.menuService.selectSubMenu('nganHangCauHoi'); 
    } else {
      this.menuService.selectSubMenu(null); 
    }
  }
}