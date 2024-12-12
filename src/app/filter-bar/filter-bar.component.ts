import { Component, OnInit, OnDestroy } from '@angular/core';
import { FilterService } from '../filter.service';
import { TabledataService } from '../tabledata.service';
import { UiStateService } from '../ui-state.service'; 
import { Subscription } from 'rxjs';
import { QuestionDTO } from '../question.dto';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent implements OnInit, OnDestroy {
  public items = ['Đang soạn thảo', 'Gửi duyệt', 'Đã duyệt', 'Ngừng áp dụng'];
  public selectedStatuses: string[] = ['Đang soạn thảo'];
  public isFormVisible: boolean = false;

  public newItem: Partial<QuestionDTO> = {
    id: '',
    question: '',
    description: 'Thương hiệu',
    duration: '30s',
    status: 'Đang soạn thảo',
    type: 'Dạng câu một lựa chọn',
    point: '', 
  };

  public isDisabled: boolean = false;
  public notification: { message: string; type: string } | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private filterService: FilterService,
    private tableDataService: TabledataService,
    private uiStateService: UiStateService 
  ) {
    this.filterService.updateSelectedStatuses(this.selectedStatuses);
  }

  ngOnInit() {
    this.subscriptions.add(
      this.uiStateService.actionBarVisibility$.subscribe((isVisible) => {
        this.isDisabled = isVisible;
      })
    );
  
    this.filterService.reset$.subscribe(() => {
      this.resetFilters();
    });
  }
  

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  toggleStatus(status: string) {
    if (this.selectedStatuses.includes(status)) {
      this.selectedStatuses = this.selectedStatuses.filter((s) => s !== status);
    } else {
      this.selectedStatuses.push(status);
    }
    this.filterService.updateSelectedStatuses(this.selectedStatuses); 
  }

  isChecked(status: string): boolean {
    return this.selectedStatuses.includes(status);
  }

  resetFilters() {
    this.selectedStatuses = ['Đang soạn thảo'];
    this.filterService.updateSelectedStatuses(this.selectedStatuses);
  }

  openAddNewForm() {
    if (!this.isDisabled) { 
      this.isFormVisible = true;
    }
  }

  closeForm() {
    this.isFormVisible = false;
    this.resetForm();
  }

  addNewItem() {
    const maxId = this.tableDataService
      .getData()
      .reduce((max, item) => Math.max(max, parseInt(item.id.replace('Q', ''))), 0);
    const id = `Q${maxId + 1}`;
    this.newItem.id = id;
    this.tableDataService.addItem({ ...this.newItem } as QuestionDTO);
    this.showNotification('Thêm câu hỏi thành công!', 'success');
    this.isFormVisible = false;
    this.resetForm();
  }
  

  public resetForm() {
    this.newItem = {
      id: '',
      question: '',
      description: 'Thương hiệu',
      duration: '30s',
      status: 'Đang soạn thảo',
      type: 'Dạng câu một lựa chọn',
      point: '',
    };
  }

  showNotification(message: string, type: string) {
    this.notification = { message, type };
    setTimeout(() => {
      this.notification = null;
    }, 3500); 
  }
}
