import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { TabledataService } from '../tabledata.service';
import { FilterService } from '../filter.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnDestroy {
  data: any[] = [];
  filterData: any[] = [];
  pagedData: any[] = [];

  itemsPerPage = 25;
  currentPage = 1;

  activeActionMenuId: string | null = null;
  selectedItem: any | null = null; 
  isFormVisible: boolean = false; 
  isEditMode: boolean = false; 
  editableItem: any | null = null;

  selectedItems: any[] = [];
  allSelected: boolean = false;
  visibleButtons: any = {};
  notification: { message: string; type: string } | null = null;
  isDeleteModalVisible: boolean = false;

  @Output() actionBarVisibilityChange = new EventEmitter<boolean>();

  private subscriptions: Subscription = new Subscription();

  constructor(
    private dataService: TabledataService,
    private filterService: FilterService
  ) {}

  ngOnInit() {
    this.data = this.dataService.getData();
    this.filterData = [...this.data]; 
    this.updateDisplayedData();

    this.subscriptions.add(
      this.filterService.searchText$.subscribe((text) => {
        this.applySearchFilter(text);
      })
    );

    this.subscriptions.add(
      this.filterService.selectedStatues$.subscribe((statuses: string[]) => {
        this.applyStatusFilter(statuses);
      })
    );

    this.updateVisibleButtons();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Getter để kiểm tra xem action-bar có đang hoạt động
  get isActionBarActive(): boolean {
    return this.selectedItems.length > 0;
  }

  updateDisplayedData() {
    console.log('itemsPerPage:', this.itemsPerPage, 'currentPage:', this.currentPage, 'filterData length:', this.filterData.length);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedData = this.filterData.slice(startIndex, endIndex);
    console.log('pagedData length:', this.pagedData.length);
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
    this.filterData = this.data.filter(
      (item) =>
        item.id.toLowerCase().includes(lowerSearchText) ||
        item.question.toLowerCase().includes(lowerSearchText)
    );
    this.currentPage = 1;
    this.updateDisplayedData();
  }

  applyStatusFilter(statuses: string[]) {
    if (statuses.length > 0) {
      this.filterData = this.data.filter((item) => {
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
    } else {
      this.filterData = [...this.data];
    }
    this.currentPage = 1;
    this.updateDisplayedData();
  }

  closeDeleteModal() {
    this.isDeleteModalVisible = false;
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

    this.emitActionBarVisibility();
  }

  emitActionBarVisibility() {
    const isVisible = this.selectedItems.length > 0;
    this.actionBarVisibilityChange.emit(isVisible);
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
    this.filterData = this.filterData.filter(
      (item) => !this.selectedItems.some((selected) => selected.id === item.id)
    );
    this.selectedItems = [];
    this.allSelected = false;
    this.isDeleteModalVisible = false;
    this.showNotification('Đã xóa các mục thành công!', 'success');
    this.updateDisplayedData();
  }

  closePopup() {
    this.selectedItems = [];
    this.allSelected = false;
    this.updateVisibleButtons();
  }

  getClassStatus(status: string) {
    switch (status) {
      case 'Gửi duyệt':
        return 'status-send';
      case 'Duyệt áp dụng':
        return 'status-approved';
      case 'Ngừng áp dụng':
        return 'status-stopped';
      case 'Trả về':
        return 'status-returned';
      default:
        return '';
    }
  }

  toggleActionMenu(id: string) {
    this.activeActionMenuId = this.activeActionMenuId === id ? null : id;
  }

  viewDetails(id: string) {
    this.editableItem = this.dataService.getItemById(id);
    if (this.editableItem) {
      this.isEditMode = false;
      this.isFormVisible = true;
    } else {
      this.showNotification('Không tìm thấy câu hỏi!', 'error');
    }
    this.closeActionMenu();
  }

  closeDetailForm() {
    this.isFormVisible = false;
    this.selectedItem = null;
  }

  editItem(id: string) {
    const item = this.dataService.getItemById(id);
    if (item) {
      this.editableItem = { ...item };
      this.isEditMode = true;
      this.isFormVisible = true;
    } else {
      this.showNotification('Không tìm thấy câu hỏi!', 'error');
    }
    this.closeActionMenu();
  }

  updateItem() {
    if (this.editableItem) {
      const dataIndex = this.data.findIndex(
        (item) => item.id === this.editableItem.id
      );

      const filterDataIndex = this.filterData.findIndex(
        (item) => item.id === this.editableItem.id
      );

      if (dataIndex > -1) {
        this.data[dataIndex] = { ...this.editableItem };
      }

      if (filterDataIndex > -1) {
        this.filterData[filterDataIndex] = { ...this.editableItem };
      }

      this.closeDetailForm();
      this.showNotification('Cập nhật câu hỏi thành công!', 'success');
      this.updateDisplayedData();
    }
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
    } else {
      this.showNotification('Không thể gửi duyệt các mục đã chọn.', 'error');
    }
    this.updateDisplayedData();
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
    } else {
      this.showNotification('Không thể phê duyệt các mục đã chọn.', 'error');
    }
    this.updateDisplayedData();
  }

  deactivateItems() {
    const eligibleItems = this.selectedItems.filter(
      (item) => item.status === 'Duyệt áp dụng'
    );

    if (eligibleItems.length === this.selectedItems.length) {
      this.filterData = this.filterData.filter(
        (item) => !this.selectedItems.includes(item)
      );
      this.selectedItems = [];
      this.showNotification('Ngưng hiển thị thành công!', 'success');
      this.updateVisibleButtons();
    } else {
      this.showNotification(
        'Không thể ngưng hiển thị các mục đã chọn.',
        'error'
      );
    }
    this.updateDisplayedData();
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
    } else {
      this.showNotification('Không thể trả về các mục đã chọn.', 'error');
    }
    this.updateDisplayedData();
  }

  deleteItem(id: string) {
    const item = this.dataService.getItemById(id);

    if (!item || !item.type) {
      this.showNotification(
        `Không thể xóa câu hỏi ${id} vì thiếu thông tin loại câu hỏi!`,
        'error'
      );
      this.closeActionMenu();
      return;
    }

    this.filterData = this.filterData.filter((i) => i.id !== id);
    this.selectedItems = this.selectedItems.filter((i) => i.id !== id);
    this.showNotification(`Đã xóa câu hỏi ${id} thành công!`, 'success');
    this.updateVisibleButtons();
    this.closeActionMenu();
    this.updateDisplayedData();
  }

  closeActionMenu() {
    this.activeActionMenuId = null;
  }

  showNotification(message: string, type: string) {
    this.notification = { message, type };
    setTimeout(() => {
      this.notification = null;
    }, 3500);
  }

  submitForApprovalFromMenu(item: any) {
    if (['Đang soạn thảo', 'Trả về'].includes(item.status)) {
      item.status = 'Gửi duyệt';
      this.showNotification(`Gửi duyệt thành công !`, 'success');
      this.updateVisibleButtons();
    } else {
      this.showNotification(`Không thể gửi duyệt mục đã chọn !`, 'error');
    }
    this.closeActionMenu();
    this.updateDisplayedData();
  }

  approveFromMenu(item: any) {
    if (['Gửi duyệt', 'Ngừng áp dụng'].includes(item.status)) {
      item.status = 'Duyệt áp dụng';
      this.showNotification(`Phê duyệt thành công !`, 'success');
      this.updateVisibleButtons();
    } else {
      this.showNotification(`Không thể phê duyệt mục đã chọn !`, 'error');
    }
    this.closeActionMenu();
    this.updateDisplayedData();
  }

  deactivateFromMenu(item: any) {
    if (item.status === 'Duyệt áp dụng') {
      this.filterData = this.filterData.filter((i) => i.id !== item.id);
      this.showNotification(`Ngưng hiển thị thành công !`, 'success');
      this.updateVisibleButtons();
    } else {
      this.showNotification(`Không thể ngừng hiển thị mục đã chọn !`, 'error');
    }
    this.closeActionMenu();
    this.updateDisplayedData();
  }

  returnFromMenu(item: any) {
    if (['Gửi duyệt', 'Ngừng áp dụng'].includes(item.status)) {
      item.status = 'Trả về';
      this.showNotification(`Trả về thành công !`, 'success');
      this.updateVisibleButtons();
    } else {
      this.showNotification(`Không thể trả về mục đã chọn !`, 'error');
    }
    this.closeActionMenu();
    this.updateDisplayedData();
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

    this.filterData = this.filterData.filter(
      (item) => !this.selectedItems.some((selected) => selected.id === item.id)
    );

    this.selectedItems = [];
    this.allSelected = false;
    this.showNotification('Đã xóa các câu hỏi thành công!', 'success');
    this.updateVisibleButtons();
    this.closeActionMenu();
    this.updateDisplayedData();
  }
}
