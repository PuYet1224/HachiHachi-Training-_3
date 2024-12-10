import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isEvaluationOpen = false;       
  isQuestionBankOpen = false;     
  isQuestionBankSelected = false; 

  toggleEvaluation() {
    this.isEvaluationOpen = !this.isEvaluationOpen;
    if (!this.isEvaluationOpen) {
      this.isQuestionBankOpen = false;
      this.isQuestionBankSelected = false;
    }
  }

  toggleQuestionBank() {
    this.isQuestionBankOpen = !this.isQuestionBankOpen;
    if (!this.isQuestionBankOpen) {
      this.isQuestionBankSelected = false;
    }
  }

  selectQuestionBank() {
    this.isQuestionBankSelected = !this.isQuestionBankSelected;
  }
}
