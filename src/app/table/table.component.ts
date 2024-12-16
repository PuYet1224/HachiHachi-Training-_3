import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { TabledataService } from '../tabledata.service';
import { FilterService } from '../filter.service';
import { Subscription } from 'rxjs';
import { UiStateService } from '../ui-state.service'; 
import { MatSidenav } from '@angular/material/sidenav';
import { QuestionDTO } from '../question.dto';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnDestroy {
  data: QuestionDTO[] = [];
  filterData: QuestionDTO[] = [];
  pagedData: QuestionDTO[] = [];

  itemsPerPage = 25;
  currentPage = 1;

  activeActionMenuId: string | null = null;
  isDisabled: boolean = false;

  selectedItems: QuestionDTO[] = []; 
  allSelected: boolean = false;
  visibleButtons: any = {};
  notification: { message: string; type: string } | null = null;
  isDeleteModalVisible: boolean = false;

  private subscriptions: Subscription = new Subscription();

  currentActions: any[] = [];

  currentSearchText: string = '';
  currentSelectedStatuses: string[] = [];

  @ViewChild('drawer') drawer!: MatSidenav;
  @ViewChild('firstInput') firstInput!: ElementRef;

  isEditMode: boolean = false;   
  isViewOnlyMode: boolean = false;
  isCreateMode: boolean = false; 
  submitted: boolean = false; 
  isFormVisible: boolean = false;

  editableItem: Partial<QuestionDTO> = { 
    question: '',
    id: '',
    description: '',
    type: '',
    point: '',
    duration: '',
    status: ''
  };

  constructor(
    private dataService: TabledataService,
    private filterService: FilterService,
    private uiStateService: UiStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.dataService.data$.subscribe((data: QuestionDTO[]) => {
        this.data = data;
        this.applyFilters();
      })
    );
  
    this.subscriptions.add(
      this.filterService.searchText$.subscribe((text) => {
        this.currentSearchText = text;
        this.applyFilters();
      })
    );
  
    this.subscriptions.add(
      this.filterService.selectedStatuses$.subscribe((statuses: string[]) => {
        this.currentSelectedStatuses = statuses;
        this.applyFilters();
      })
    );
  
    this.subscriptions.add(
      this.filterService.reset$.subscribe(() => {
        this.resetFilters(); 
      })
    );
  
    this.subscriptions.add(
      this.uiStateService.actionBarVisibility$.subscribe((isVisible) => {
        this.isDisabled = isVisible;
      })
    );
  
    this.updateVisibleButtons();
  }
  

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  get isActionBarActive(): boolean {
    return this.selectedItems.length > 0;
  }

  updateDisplayedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedData = this.filterData.slice(startIndex, endIndex);
    if (this.pagedData.length === 0 && this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedData();
    }
  }
  

  applyFilters() {
    this.filterData = [...this.data]; 
    this.applyStatusFilter(this.currentSelectedStatuses); 
    this.applySearchFilter(this.currentSearchText); 
    const totalPages = Math.ceil(this.filterData.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, totalPages) || 1;    
    this.updateDisplayedData();
    if (this.selectedItems.length === 0) {
      this.uiStateService.setActionBarVisibility(false);
      this.isDisabled = false;
    }
    this.cdr.detectChanges();
  }
  
  resetFilters() {
    this.currentSearchText = ''; 
    this.currentSelectedStatuses = ['Đang soạn thảo', 'Trả về']; 
    this.filterData = [...this.data];
    this.currentPage = 1; 
    this.updateDisplayedData(); 
    this.applyFilters();
  }
  
  onItemsPerPageChange(itemsPerPage: number) {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.updateDisplayedData();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updateDisplayedData();
  }

  applySearchFilter(searchText: string) {
    const lowerSearchText = searchText.toLowerCase();
    this.filterData = this.filterData.filter(
      (item) =>
        item.id.toLowerCase().includes(lowerSearchText) ||
        item.question.toLowerCase().includes(lowerSearchText)
    );
  }

  applyStatusFilter(statuses: string[]) {
    if (statuses.length > 0) {
      this.filterData = this.filterData.filter((item) => {
        if (
          statuses.includes('Đang soạn thảo') &&
          (item.status === 'Đang soạn thảo' || item.status === 'Trả về')
        ) {
          return true;
        }
        if (statuses.includes('Đã duyệt') && item.status === 'Duyệt áp dụng') {
          return true;
        }
        return statuses.includes(item.status);
      });
    }
  }

  toggleSelectAll(event: any) {
    this.allSelected = event.target.checked;
    this.selectedItems = this.allSelected ? [...this.pagedData] : [];
    this.updateVisibleButtons();
    this.uiStateService.setActionBarVisibility(this.selectedItems.length > 0);
  }
  

  toggleSelectItem(item: QuestionDTO): void {
    const index = this.selectedItems.findIndex((i) => i.id === item.id);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }
    this.allSelected = this.selectedItems.length === this.pagedData.length;
    this.updateVisibleButtons();
    this.isDisabled = this.selectedItems.length > 0;
    this.uiStateService.setActionBarVisibility(this.selectedItems.length > 0);
  }
  
  

  updateVisibleButtons() {
    const statuses = this.selectedItems.map((item) => item.status);
    this.visibleButtons = {
      showView: statuses.some((status) =>
        ['Duyệt áp dụng', 'Ngừng áp dụng'].includes(status)
      ),
      showSubmit: statuses.some((status) =>
        ['Đang soạn thảo', 'Trả về'].includes(status)
      ),
      showApprove: statuses.some((status) =>
        ['Gửi duyệt', 'Ngừng áp dụng'].includes(status)
      ),
      showDisable: statuses.some((status) => status === 'Duyệt áp dụng'),
      showReturn: statuses.some((status) =>
        ['Gửi duyệt', 'Ngừng áp dụng'].includes(status)
      ),
      showDelete: statuses.some((status) =>
        [
          'Duyệt áp dụng',
          'Ngừng áp dụng',
          'Đang soạn thảo',
          'Trả về',
          'Gửi duyệt',
        ].includes(status)
      ),
    };

    const isVisible = this.selectedItems.length > 0;
    this.uiStateService.setActionBarVisibility(isVisible);
  }

  isSelected(item: QuestionDTO): boolean {
    return this.selectedItems.some((selectedItem) => selectedItem.uniqueId === item.uniqueId);
  }  

  checkAndOpenDeleteModal() {
    if (this.selectedItems.length >= 2) {
      this.isDeleteModalVisible = true;
    } else if (this.selectedItems.length === 1) {
      this.deleteSelectedItems();
    } else {
      this.showNotification('Vui lòng chọn ít nhất 1 mục để xóa!', 'error');
    }
  }

  confirmDelete(): void {
    const uniqueIds = this.selectedItems.map(item => item.uniqueId).filter(Boolean) as string[];
    if (uniqueIds.length === 0) {
      this.showNotification('Không có mục nào để xóa!', 'error');
      return;
    }
    this.dataService.deleteItems(uniqueIds);
    this.selectedItems = [];
    this.allSelected = false;
    this.isDeleteModalVisible = false;
    this.showNotification(`Đã xóa ${uniqueIds.length} mục thành công!`, 'success');
    this.applyFilters();
    this.updateVisibleButtons();
    this.uiStateService.setActionBarVisibility(false); 
  }
  

  closeDeleteModal() {
    this.isDeleteModalVisible = false;
  }

  closePopup() {
    this.selectedItems = [];
    this.allSelected = false;
    this.uiStateService.setActionBarVisibility(false); 
    this.updateVisibleButtons();
  }
  

  getClassStatus(status: string): string {
    switch (status) {
      case 'Đang soạn thảo':
        return 'draft-status';
      case 'Gửi duyệt':
        return 'submit-status';
      case 'Duyệt áp dụng':
        return 'approved-status';
      case 'Ngừng áp dụng':
        return 'disabled-status';
      case 'Trả về':
        return 'returned-status';
      default:
        return '';
    }
  }

  getActionsForStatus(status: string): any[] {
    switch (status) {
      case 'Đang soạn thảo':
        return [
          {
            label: 'Chỉnh sửa',
            icon: '../../assets/pencil.png',
            handler: (item: QuestionDTO) => this.openFormDrawer(item, 'edit')
          },
          {
            label: 'Gửi duyệt',
            icon: '../../assets/share.png',
            handler: this.submitForApprovalFromMenu.bind(this),
          },
          {
            label: 'Xóa câu hỏi',
            icon: '../../assets/delete.png',
            handler: this.deleteItem.bind(this),
          },
        ];
      case 'Gửi duyệt':
        return [
          {
            label: 'Chỉnh sửa',
            icon: '../../assets/pencil.png',
            handler: (item: QuestionDTO) => this.openFormDrawer(item, 'edit')
          },
          {
            label: 'Phê duyệt',
            icon: '../../assets/check.png',
            handler: this.approveFromMenu.bind(this),
          },
          {
            label: 'Trả về',
            icon: '../../assets/turn-back.png',
            handler: this.returnFromMenu.bind(this),
          },
        ];
      case 'Duyệt áp dụng':
        return [
          {
            label: 'Xem chi tiết',
            icon: '../../assets/view.png',
            handler: (item: QuestionDTO) => this.openFormDrawer(item, 'view')
          },
          {
            label: 'Ngừng áp dụng',
            icon: '../../assets/x-mark.png',
            handler: this.deactivateFromMenu.bind(this),
          },
        ];
      case 'Ngừng áp dụng':
        return [
          {
            label: 'Xem chi tiết',
            icon: '../../assets/view.png',
            handler: (item: QuestionDTO) => this.openFormDrawer(item, 'view')
          },
          {
            label: 'Phê duyệt',
            icon: '../../assets/check.png',
            handler: this.approveFromMenu.bind(this),
          },
          {
            label: 'Trả về',
            icon: '../../assets/turn-back.png',
            handler: this.returnFromMenu.bind(this),
          },
        ];
      case 'Trả về':
        return [
          {
            label: 'Chỉnh sửa',
            icon: '../../assets/pencil.png',
            handler: (item: QuestionDTO) => this.openFormDrawer(item, 'edit')
          },
          {
            label: 'Gửi duyệt',
            icon: '../../assets/share.png',
            handler: this.submitForApprovalFromMenu.bind(this),
          },
        ];
      default:
        return [];
    }
  }

  toggleActionMenu(uniqueKey: string) {
    if (this.activeActionMenuId === uniqueKey) {
      this.activeActionMenuId = null;
      this.currentActions = [];
    } else {
      this.activeActionMenuId = uniqueKey;
      const item = this.pagedData.find((_, index) => `item-${index}` === uniqueKey);
      if (item) {
        this.currentActions = this.getActionsForStatus(item.status);
      } else {
        this.currentActions = [];
      }
    }
  }  

  showNotification(message: string, type: string) {
    this.notification = { message, type };
    setTimeout(() => {
      this.notification = null;
    }, 3500);
  }

  submitForApproval() {
    const eligibleItems = this.selectedItems.filter((item) =>
        ['Đang soạn thảo', 'Trả về'].includes(item.status)
    );
    eligibleItems.forEach((item) => {
        item.status = 'Gửi duyệt';
        this.dataService.updateItem(item); 
    });
    if (eligibleItems.length > 0) {
        this.showNotification(`Đã gửi duyệt ${eligibleItems.length} mục thành công!`, 'success');
    } else {
        this.showNotification('Không có mục nào hợp lệ để gửi duyệt.', 'error');
    }
    this.updateVisibleButtons();
    this.applyFilters();

    this.closePopup();

}

approveItems() {
  const eligibleItems = this.selectedItems.filter((item) =>
      ['Gửi duyệt', 'Ngừng áp dụng'].includes(item.status)
  );
  eligibleItems.forEach((item) => {
      item.status = 'Duyệt áp dụng';
      this.dataService.updateItem(item);
  });
  if (eligibleItems.length > 0) {
      this.showNotification(`Đã phê duyệt ${eligibleItems.length} mục thành công!`, 'success');
  } else {
      this.showNotification('Không có mục nào hợp lệ để phê duyệt.', 'error');
  }
  this.updateVisibleButtons();
  this.applyFilters();

  this.closePopup();
}

deactivateItems() {
  const eligibleItems = this.selectedItems.filter(
      (item) => item.status === 'Duyệt áp dụng'
  );
  eligibleItems.forEach((item) => {
      item.status = 'Ngừng áp dụng';
      this.dataService.updateItem(item); 
  });
  if (eligibleItems.length > 0) {
      this.showNotification(`Đã ngừng áp dụng ${eligibleItems.length} mục thành công!`, 'success');
  } else {
      this.showNotification('Không có mục nào hợp lệ để ngừng áp dụng.', 'error');
  }
  this.updateVisibleButtons();
  this.applyFilters();
}

returnItems() {
  const eligibleItems = this.selectedItems.filter((item) =>
      ['Gửi duyệt', 'Ngừng áp dụng'].includes(item.status)
  );
  eligibleItems.forEach((item) => {
      item.status = 'Trả về';
      this.dataService.updateItem(item); 
  });
  if (eligibleItems.length > 0) {
      this.showNotification(`Đã trả về ${eligibleItems.length} mục thành công!`, 'success');
  } else {
      this.showNotification('Không có mục nào hợp lệ để trả về.', 'error');
  }
  this.updateVisibleButtons();
  this.applyFilters();
}

deleteItem(itemOrId: string | QuestionDTO): void {
  const uniqueId = typeof itemOrId === 'string' ? itemOrId : itemOrId.uniqueId;
  if (!uniqueId) {
    this.showNotification(`Không tìm thấy mục để xóa!`, 'error');
    return;
  }
  this.dataService.deleteItem(uniqueId);
  this.selectedItems = this.selectedItems.filter(item => item.uniqueId !== uniqueId);
  this.updateVisibleButtons();
  this.uiStateService.setActionBarVisibility(this.selectedItems.length > 0);
  this.isDisabled = this.selectedItems.length > 0;
  this.showNotification(`Đã xóa thành công!`, 'success');
  this.applyFilters();
}



deleteSelectedItems(): void {
  if (this.selectedItems.length === 0) {
    this.showNotification('Vui lòng chọn ít nhất 1 mục để xóa!', 'error');
    return;
  }

  const uniqueIds = this.selectedItems.map(item => item.uniqueId).filter(Boolean) as string[];

  this.dataService.deleteItems(uniqueIds);

  this.selectedItems = [];
  this.allSelected = false;

  this.showNotification(`Đã xóa ${uniqueIds.length} mục thành công!`, 'success');

  this.applyFilters();
}

  closeActionMenu() {
    this.activeActionMenuId = null;
    this.currentActions = [];
  }

  submitForApprovalFromMenu(itemOrId: string | QuestionDTO) {
    const item =
      typeof itemOrId === 'string'
        ? this.data.find((i) => i.id === itemOrId)
        : itemOrId;
    if (item && ['Đang soạn thảo', 'Trả về'].includes(item.status)) {
      item.status = 'Gửi duyệt';
      this.dataService.updateItem(item);
      this.showNotification(`Gửi duyệt câu hỏi ${item.id} thành công!`, 'success');
    } else {
      this.showNotification('Không thể gửi duyệt!', 'error');
    }
    this.updateVisibleButtons();
    this.closeActionMenu();
    this.applyFilters();
  }
  

approveFromMenu(item: QuestionDTO) { 
  if (['Gửi duyệt', 'Ngừng áp dụng'].includes(item.status)) {
    item.status = 'Duyệt áp dụng';
    this.dataService.updateItem(item); 
    this.showNotification(`Phê duyệt thành công!`, 'success');
  } 
  this.updateVisibleButtons();
  this.closeActionMenu();
  this.applyFilters();
  this.cdr.detectChanges();
}

deactivateFromMenu(item: QuestionDTO) { 
  if (item.status === 'Duyệt áp dụng') {
    item.status = 'Ngừng áp dụng';
    this.dataService.updateItem(item); 
    this.showNotification(`Ngưng áp dụng thành công!`, 'success');
  }
  this.updateVisibleButtons();
  this.closeActionMenu();
  this.applyFilters();
}

returnFromMenu(item: QuestionDTO) { 
  if (['Gửi duyệt', 'Ngừng áp dụng'].includes(item.status)) {
    item.status = 'Trả về';
    this.dataService.updateItem(item); 
    this.showNotification(`Trả về thành công!`, 'success');
  }
  this.updateVisibleButtons();
  this.closeActionMenu();
  this.applyFilters();
}

  canShowActionMenu(item: QuestionDTO): boolean { 
    return !this.isDisabled;
  }

  openFormDrawer(item: QuestionDTO, mode: 'view' | 'edit' | 'create' = 'view') {
    this.submitted = false;
    this.isEditMode = (mode === 'edit');
    this.isCreateMode = (mode === 'create');
    this.isViewOnlyMode = mode === 'view';
    this.isFormVisible = true;
  
    if (mode === 'create') {
      this.editableItem = {
        question: '',
        id: '',
        description: '',
        type: '',
        point: '',
        duration: '30s',
        status: 'Đang soạn thảo'
      };
    } else {
      this.editableItem = {
        question: item.question,
        id: item.id,
        description: item.description,
        type: item.type,
        point: item.point,
        duration: item.duration,
        status: item.status
      };
  
      if (['Duyệt áp dụng', 'Ngừng áp dụng'].includes(item.status)) {
        this.isViewOnlyMode = true;
      }
    }
  }
  

  closeDetailForm() {
    this.isFormVisible = false;
    this.isEditMode = false;
    this.isViewOnlyMode = false;
    this.isCreateMode = false;
    this.editableItem = {
      question: '',
      id: '',
      description: '',
      type: '',
      point: '',
      duration: '',
      status: ''
    };
  }

  onDescriptionChange() {
    if (this.editableItem.description) {
      if (this.editableItem.type === 'Nhiều lựa chọn') {
        // logic xử lý nếu cần
      } else {
        // logic xử lý nếu cần
      }
    } else {
      this.editableItem.type = '';
      this.editableItem.point = '';
    }
  }

  onTypeChange() {
    if (this.editableItem.type === 'Nhiều lựa chọn') {
      // có thể chọn point
    } else {
      this.editableItem.point = '';
    }
  }

  getStatusOptions() {
    const currentStatus = this.editableItem.status;
    const allOptions = [
      { value: 'Đang soạn thảo', label: 'Đang soạn thảo' },
      { value: 'Gửi duyệt', label: 'Gửi duyệt' },
      { value: 'Duyệt áp dụng', label: 'Duyệt áp dụng' },
      { value: 'Ngừng áp dụng', label: 'Ngừng áp dụng' },
      { value: 'Trả về', label: 'Trả về' },
    ];

    let allowed: string[] = [];
    switch (currentStatus) {
      case 'Đang soạn thảo':
        allowed = ['Gửi duyệt'];
        break;
      case 'Gửi duyệt':
        allowed = ['Duyệt áp dụng', 'Trả về'];
        break;
      case 'Duyệt áp dụng':
        allowed = ['Ngừng áp dụng'];
        break;
      case 'Ngừng áp dụng':
        allowed = ['Duyệt áp dụng', 'Trả về'];
        break;
      case 'Trả về':
        allowed = ['Gửi duyệt'];
        break;
      default:
        allowed = [];
        break;
    }

    return allOptions.map(o => ({
      ...o,
      disabled: allowed.length > 0 && !allowed.includes(o.value)
    }));
  }

  onSubmit(form: any) {
    this.submitted = true;
    if (!this.editableItem.question || !this.editableItem.id || !this.editableItem.description || !this.editableItem.duration || !this.editableItem.status) {
      this.showNotification('Vui lòng điền đầy đủ các trường bắt buộc!', 'error');
      return;
    }

    if (this.editableItem.description && !this.editableItem.type) {
      this.showNotification('Loại câu hỏi là bắt buộc!', 'error');
      return;
    }

    if (this.editableItem.type === 'Nhiều lựa chọn' && !this.editableItem.point) {
      this.showNotification('Cách tính điểm là bắt buộc cho loại nhiều lựa chọn!', 'error');
      return;
    }

    const formValue = this.editableItem as QuestionDTO;
    console.log('Form Submitted:', formValue);

    if (this.isCreateMode) {
      const exists = this.data.some(item => item.id === formValue.id);
      if (exists) {
        this.showNotification('Mã câu hỏi đã tồn tại!', 'error');
        return;
      }
      this.dataService.addItem({ ...formValue }); // Sử dụng service để thêm
      this.showNotification('Thêm mới câu hỏi thành công!', 'success');
   
    } else if (this.isEditMode && !this.isViewOnlyMode) {
      this.dataService.updateItem(formValue); // Sử dụng service để cập nhật
      this.showNotification('Cập nhật câu hỏi thành công!', 'success');
    }

    this.applyFilters();
    this.closeDetailForm();
  }

  viewDetails(itemId: string) {
    const item = this.data.find(i => i.id === itemId);
    if (item) {
      this.openFormDrawer(item, 'view');
    } else {
      this.showNotification('Không tìm thấy dữ liệu chi tiết!', 'error');
    }
  }

  editItem(item: QuestionDTO) {
    if (!item || !item.id) {
      this.showNotification('Không tìm thấy câu hỏi để chỉnh sửa!', 'error');
      return;
    }
    this.editableItem = { ...item }; 
    this.isEditMode = true; 
    this.isFormVisible = true; 
  }
  
  updateItem(form: any) {
    this.onSubmit(form);
  }
  get selectedItemsTitle(): string {
    return this.selectedItems.map(item => item.question).join(', ');
  }
}
