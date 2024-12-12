import { Component, OnInit, OnDestroy } from '@angular/core';
import { FilterService } from '../filter.service';
import { TabledataService } from '../tabledata.service';
import { UiStateService } from '../ui-state.service'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent implements OnInit, OnDestroy {
  public items = ['Đang soạn thảo', 'Gửi duyệt', 'Đã duyệt', 'Ngừng áp dụng'];
  public selectedStatuses: string[] = ['Đang soạn thảo'];
  public isFormVisible: boolean = false;

  public newItem = {
    id: '',
    question: '',
    description: 'Thương hiệu',
    duration: '30s',
    status: 'Đang soạn thảo',
    type: 'Dạng câu một lựa chọn',
    point: '', 
  };

  public isDisabled: boolean = false; 

  private subscriptions: Subscription = new Subscription();

  constructor(
    private filterService: FilterService,
    private tableDataService: TabledataService,
    private uiStateService: UiStateService 
  ) {
    this.filterService.updateSelectedStatues(this.selectedStatuses);
  }

  ngOnInit() {
    this.filterService.reset$.subscribe(() => {
      this.resetFilters();
    });

    this.subscriptions.add(
      this.uiStateService.actionBarVisibility$.subscribe((isVisible) => {
        this.isDisabled = isVisible;
      })
    );
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
    this.filterService.updateSelectedStatues(this.selectedStatuses);
  }

  isChecked(status: string): boolean {
    return this.selectedStatuses.includes(status);
  }

  resetFilters() {
    this.selectedStatuses = ['Đang soạn thảo'];
    this.filterService.updateSelectedStatues(this.selectedStatuses);
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
    this.tableDataService.addItem({ ...this.newItem }); 
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
}
