import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { TabledataService } from '../tabledata.service';
import { FilterService } from '../filter.service';
import { Subscription } from 'rxjs';
import { UiStateService } from '../ui-state.service'; 
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnDestroy {
  data: any[] = [];
  // listSelected: TabledataService[] = [];
  filterData: any[] = [];
  pagedData: any[] = [];

  itemsPerPage = 25;
  currentPage = 1;

  activeActionMenuId: string | null = null;
  isDisabled: boolean = false;

  selectedItems: any[] = [];
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

  editableItem: any = {
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
    this.data = this.dataService.getData();
    this.filterData = [...this.data];
    this.updateDisplayedData();

    this.subscriptions.add(
      this.filterService.searchText$.subscribe((text) => {
        this.currentSearchText = text;
        this.applyFilters();
      })
    );

    this.subscriptions.add(
      this.filterService.selectedStatues$.subscribe((statuses: string[]) => {
        this.currentSelectedStatuses = statuses;
        this.applyFilters();
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

  updateDisplayedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedData = this.filterData.slice(startIndex, endIndex);
  }

  applyFilters() {
    this.filterData = [...this.data];
    this.applyStatusFilter(this.currentSelectedStatuses);
    this.applySearchFilter(this.currentSearchText);
    this.currentPage = 1;
    this.updateDisplayedData();
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
  }

  toggleSelectItem(item: any) {
    const index = this.selectedItems.findIndex((i) => i.id === item.id);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }
    this.allSelected = this.selectedItems.length === this.pagedData.length;
    this.updateVisibleButtons();
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

  isSelected(item: any): boolean {
    return this.selectedItems.some((i) => i.id === item.id);
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

  confirmDelete() {
    this.data = this.data.filter(
      (item) => !this.selectedItems.some((selected) => selected.id === item.id)
    );
    this.selectedItems = [];
    this.allSelected = false;
    this.isDeleteModalVisible = false;
    this.showNotification('Đã xóa các mục thành công!', 'success');

    this.applyFilters();
  }

  closeDeleteModal() {
    this.isDeleteModalVisible = false;
  }

  closePopup() {
    this.selectedItems = [];
    this.allSelected = false;
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
            handler: (item: any) => this.openFormDrawer(item, 'edit')
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
            handler: (item: any) => this.openFormDrawer(item, 'edit')
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
            handler: (item: any) => this.openFormDrawer(item, 'view')
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
            handler: (item: any) => this.openFormDrawer(item, 'view')
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
            handler: (item: any) => this.openFormDrawer(item, 'edit')
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

  toggleActionMenu(id: string) {
    if (this.activeActionMenuId === id) {
      this.activeActionMenuId = null;
      this.currentActions = [];
    } else {
      this.activeActionMenuId = id;
      const item = this.data.find((i) => i.id === id);
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
    if (eligibleItems.length === this.selectedItems.length) {
      eligibleItems.forEach((item) => {
        item.status = 'Gửi duyệt';
      });
      this.showNotification('Gửi duyệt thành công!', 'success');
      this.selectedItems = [];
      this.updateVisibleButtons();
      this.applyFilters();
    } else {
      this.showNotification('Không thể gửi duyệt các mục đã chọn.', 'error');
    }
  }

  approveItems() {
    const eligibleItems = this.selectedItems.filter((item) =>
      ['Gửi duyệt', 'Ngừng áp dụng'].includes(item.status)
    );
    if (eligibleItems.length === this.selectedItems.length) {
      eligibleItems.forEach((item) => {
        item.status = 'Duyệt áp dụng';
      });
      this.showNotification('Phê duyệt thành công!', 'success');
      this.selectedItems = [];
      this.updateVisibleButtons();
      this.applyFilters();
    } else {
      this.showNotification('Không thể phê duyệt các mục đã chọn.', 'error');
    }
  }

  deactivateItems() {
    const eligibleItems = this.selectedItems.filter(
      (item) => item.status === 'Duyệt áp dụng'
    );
    if (eligibleItems.length === this.selectedItems.length) {
      eligibleItems.forEach((item) => {
        item.status = 'Ngừng áp dụng';
      });
      this.showNotification('Ngưng áp dụng thành công!', 'success');
      this.selectedItems = [];
      this.updateVisibleButtons();
      this.applyFilters();
    } else {
      this.showNotification(
        'Không thể ngưng áp dụng các mục đã chọn.',
        'error'
      );
    }
  }

  returnItems() {
    const eligibleItems = this.selectedItems.filter((item) =>
      ['Gửi duyệt', 'Ngừng áp dụng'].includes(item.status)
    );
    if (eligibleItems.length === this.selectedItems.length) {
      eligibleItems.forEach((item) => {
        item.status = 'Trả về';
      });
      this.showNotification('Trả về thành công!', 'success');
      this.selectedItems = [];
      this.updateVisibleButtons();
      this.applyFilters();
    } else {
      this.showNotification('Không thể trả về các mục đã chọn.', 'error');
    }
  }

  deleteItem(itemOrId: any) {
    let item: { id: string; type?: string };
        if (typeof itemOrId === 'string') {
      item = this.data.find(i => i.id === itemOrId);
    } else {
      item = itemOrId;
    }

    if (!item || !item.id) {
      this.showNotification(`Không tìm thấy câu hỏi để xóa!`, 'error');
      this.closeActionMenu();
      return;
    }

    if (!item.type) {
      this.showNotification(
        `Không thể xóa câu hỏi ${item.id} vì thiếu thông tin loại câu hỏi!`,
        'error'
      );
      this.closeActionMenu();
      return;
    }
    this.data = this.data.filter((i) => i.id !== item.id);
    this.selectedItems = this.selectedItems.filter((i) => i.id !== item.id);
    this.showNotification(`Đã xóa câu hỏi ${item.id} thành công!`, 'success');
    this.closeActionMenu();
    this.updateVisibleButtons();
    this.applyFilters();
  }

  deleteSelectedItems() {
    const invalidItems = this.selectedItems.filter((item) => !item.type);
    if (invalidItems.length > 0) {
      this.showNotification(
        `Không thể xóa ${invalidItems.length} mục vì thiếu thông tin loại câu hỏi!`,
        'error'
      );
      return;
    }

    this.data = this.data.filter(
      (item) => !this.selectedItems.some((selected) => selected.id === item.id)
    );

    this.selectedItems = [];
    this.allSelected = false;
    this.showNotification('Đã xóa các câu hỏi thành công!', 'success');
    this.closeActionMenu();
    this.updateVisibleButtons();
    this.applyFilters();
  }

  closeActionMenu() {
    this.activeActionMenuId = null;
    this.currentActions = [];
  }

  submitForApprovalFromMenu(item: any) {
    if (['Đang soạn thảo', 'Trả về'].includes(item.status)) {
      item.status = 'Gửi duyệt';
      this.showNotification(`Gửi duyệt thành công!`, 'success');
      this.updateVisibleButtons();
      this.closeActionMenu();
      this.applyFilters();
    } else {
      this.showNotification(`Không thể gửi duyệt mục đã chọn!`, 'error');
      this.closeActionMenu();
    }
  }

  approveFromMenu(item: any) {
    if (['Gửi duyệt', 'Ngừng áp dụng'].includes(item.status)) {
      item.status = 'Duyệt áp dụng';
      this.showNotification(`Phê duyệt thành công!`, 'success');
      this.updateVisibleButtons();
      this.closeActionMenu();
      this.applyFilters();
      this.cdr.detectChanges(); 
    } else {
      this.showNotification(`Không thể phê duyệt mục đã chọn!`, 'error');
      this.closeActionMenu();
    }
  }

  deactivateFromMenu(item: any) {
    if (item.status === 'Duyệt áp dụng') {
      item.status = 'Ngừng áp dụng';
      this.showNotification(`Ngưng áp dụng thành công!`, 'success');
      this.updateVisibleButtons();
      this.closeActionMenu();
      this.applyFilters();
    } else {
      this.showNotification(`Không thể ngừng áp dụng mục đã chọn!`, 'error');
      this.closeActionMenu();
    }
  }

  returnFromMenu(item: any) {
    if (['Gửi duyệt', 'Ngừng áp dụng'].includes(item.status)) {
      item.status = 'Trả về';
      this.showNotification(`Trả về thành công!`, 'success');
      this.updateVisibleButtons();
      this.closeActionMenu();
      this.applyFilters();
    } else {
      this.showNotification(`Không thể trả về mục đã chọn!`, 'error');
      this.closeActionMenu();
    }
  }

  canShowActionMenu(item: any): boolean {
    return !this.isDisabled;
  }

  openFormDrawer(item: any, mode: 'view' | 'edit' | 'create' = 'view') {
    this.submitted = false;
    this.isEditMode = (mode === 'edit');
    this.isCreateMode = (mode === 'create');
    this.isViewOnlyMode = false;

    this.isFormVisible = true; // Mở drawer

    if (mode === 'create') {
      this.editableItem = {
        question: '',
        id: '',
        description: '',
        type: '',
        point: '',
        duration: '',
        status: 'Đang soạn thảo'
      };
    } else {
      const currentItem = this.dataService.getItemById(item.id);
      if (currentItem) {
        this.editableItem = {
          question: currentItem.question,
          id: currentItem.id,
          description: currentItem.description,
          type: currentItem.type,
          point: currentItem.point,
          duration: currentItem.duration,
          status: currentItem.status
        };

        if (['Duyệt áp dụng', 'Ngừng áp dụng'].includes(currentItem.status)) {
          this.isViewOnlyMode = true;
        }
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

    const formValue = this.editableItem;
    console.log('Form Submitted:', formValue);

    if (this.isCreateMode) {
      const exists = this.data.some(item => item.id === formValue.id);
      if (exists) {
        this.showNotification('Mã câu hỏi đã tồn tại!', 'error');
        return;
      }
      this.data.push({ ...formValue });
      this.showNotification('Thêm mới câu hỏi thành công!', 'success');
    } else if (this.isEditMode && !this.isViewOnlyMode) {
      const dataIndex = this.data.findIndex(item => item.id === formValue.id);
      if (dataIndex > -1) {
        this.data[dataIndex] = { ...formValue };
      }
      this.showNotification('Cập nhật câu hỏi thành công!', 'success');
    }

    this.applyFilters();
    this.closeDetailForm();
  }

  // Thêm các method còn thiếu
  viewDetails(itemId: string) {
    const item = this.data.find(i => i.id === itemId);
    if (item) {
      this.openFormDrawer(item, 'view');
    } else {
      this.showNotification('Không tìm thấy dữ liệu chi tiết!', 'error');
    }
  }

  editItem(itemId: string) {
    const item = this.data.find(i => i.id === itemId);
    if (item) {
      this.openFormDrawer(item, 'edit');
    } else {
      this.showNotification('Không tìm thấy câu hỏi để chỉnh sửa!', 'error');
    }
  }

  updateItem(form: any) {
    this.onSubmit(form);
  }
}
