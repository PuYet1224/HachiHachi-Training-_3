import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Header2Component } from '../header2/header2.component';
import { FilterBarComponent } from '../filter-bar/filter-bar.component';
import { CustomPaginationComponent } from '../custom-pagination/custom-pagination.component';
import { ActionPopupComponent } from '../action-popup/action-popup.component';
import { NotificationComponent } from '../notification/notification.component';
import data from '../../assets/data'; 

interface DataItem {
  _uniqueId: number;
  question: string;
  id: string;
  type: string;
  description: string;
  duration: string;
  status: string;
}

interface ActionMessages {
  [key: string]: string;
  send: string;
  approve: string;
  hide: string;
  return: string;
  delete: string;
  deleteError: string;
  edit: string;
  view: string;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {
  allData: DataItem[] = [];
  deleteTargetIds: Set<number> = new Set();
  filteredData: DataItem[] = [];
  selectedRowIds: Set<number> = new Set();
  openDropdown: number | null = null;
  selectedStatuses: string[] = ['Đang soạn thảo'];
  searchText: string = '';
  notification: { message: string; type: 'error' | 'success' } | null = null;
  showDeleteConfirm: boolean = false;
  currentPage: number = 1;
  rowsPerPage: number = 25;
  isActionPopupOpen: boolean = false;
  rowCount: number = 0;

  actionMessages: ActionMessages = {
    send: 'Gửi duyệt thành công',
    approve: 'Áp dụng thành công',
    hide: 'Ngừng áp dụng thành công',
    return: 'Trả về thành công',
    delete: 'Xóa thành công',
    deleteError: 'Đã xảy ra lỗi khi xóa, không được phép xóa câu hỏi này',
    edit: 'Chỉnh sửa thành công',
    view: 'Xem chi tiết thành công',
  };

  statusButtonsMap: { [key: string]: string[] } = {
    'Đang soạn thảo': ['Chỉnh sửa', 'Gửi duyệt', 'Xóa'],
    'Gửi duyệt': ['Chỉnh sửa', 'Phê duyệt', 'Trả về'],
    'Duyệt áp dụng': ['Xem chi tiết', 'Ngừng hiển thị'],
    'Ngừng áp dụng': ['Xem chi tiết', 'Phê duyệt', 'Trả về'],
    'Trả về': ['Chỉnh sửa', 'Gửi duyệt'],
  };

  buttonActionMap: { [key: string]: string } = {
    'Chỉnh sửa': 'edit',
    'Gửi duyệt': 'send',
    'Phê duyệt': 'approve',
    'Xem chi tiết': 'view',
    'Ngừng hiển thị': 'hide',
    'Trả về': 'return',
    'Xóa': 'delete',
  };

  @ViewChild(Header2Component) header2Ref!: Header2Component;

  constructor() {
    this.allData = data.map((item: any, index: number) => ({ ...item, _uniqueId: index }));
    this.filteredData = this.allData;
  }

  get deleteTargetIdsArray(): number[] {
    return Array.from(this.deleteTargetIds);
  }

  get selectedStatusesForActionPopup(): string[] {
    return this.filteredData
      .filter(item => this.selectedRowIds.has(item._uniqueId))
      .map(item => item.status);
  }

  ngOnInit(): void {
    this.applyFilters();
  }

  ngAfterViewInit(): void {
    document.addEventListener('mousedown', this.handleClickOutside.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousedown', this.handleClickOutside.bind(this));
  }

  showNotification(message: string, type: 'error' | 'success'): void {
    this.notification = { message, type };
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

  paginatedData(): DataItem[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredData.slice(start, end);
  }

  handleDeleteConfirm(): void {
    this.allData = this.allData.filter(item => !this.deleteTargetIds.has(item._uniqueId));
    this.showNotification(this.actionMessages.delete, 'success');
    this.selectedRowIds.forEach(id => this.deleteTargetIds.delete(id));
    this.selectedRowIds = new Set(this.selectedRowIds);
    this.showDeleteConfirm = false;
    this.applyFilters();
  }

  handleDeleteCancel(): void {
    this.showDeleteConfirm = false;
    this.selectedRowIds = new Set();
  }

  handleDelete(): void {
    if (this.selectedRowIds.size > 0) {
      this.deleteTargetIds = new Set(this.selectedRowIds);
      this.showDeleteConfirm = true;
    }
  }

  handleDropdownAction(action: string, itemUniqueId: number): void {
    const item = this.allData.find(item => item._uniqueId === itemUniqueId);
    if (!item) return;

    if ((action === 'send' || action === 'approve') && (!item.type || item.type.trim() === '')) {
      this.showNotification('Không thể thực hiện hành động vì câu hỏi chưa đầy đủ thông tin', 'error');
    } else if (action === 'delete' && (!item.type || item.type.trim() === '')) {
      this.showNotification(this.actionMessages['deleteError'], 'error');
    } else if (action === 'edit') {
      this.showNotification(this.actionMessages['edit'], 'success');
    } else if (action === 'view') {
      this.showNotification(this.actionMessages['view'], 'success');
    } else if (action === 'delete') {
      this.deleteTargetIds = new Set([itemUniqueId]);
      this.showDeleteConfirm = true;
      return;
    } else {
      const newStatus = this.getNewStatus(action);
      this.allData = this.allData.map(i => i._uniqueId === itemUniqueId ? { ...i, status: newStatus } : i);
      this.showNotification(this.actionMessages[action] || 'Thao tác thành công', 'success');
    }
    this.openDropdown = null;
    this.applyFilters();
  }

  handleAction(action: string): void {
    const selectedItems = this.allData.filter(item => this.selectedRowIds.has(item._uniqueId));

    const statusMap: { [key: string]: string[] } = {
      send: ['Đang soạn thảo', 'Trả về'],
      approve: ['Gửi duyệt', 'Ngừng áp dụng'],
      hide: ['Duyệt áp dụng'],
      return: ['Gửi duyệt', 'Ngừng áp dụng'],
    };

    const invalidItems = selectedItems.filter(item => !statusMap[action].includes(item.status));
    const incompleteItems = selectedItems.filter(item => (!item.type || item.type.trim() === '') && (action === 'send' || action === 'approve'));

    if (invalidItems.length || incompleteItems.length) {
      this.showNotification('Không thể thực hiện hành động với một số câu hỏi', 'error');
      return;
    }

    const newStatus = this.getNewStatus(action);

    this.allData = this.allData.map(item => this.selectedRowIds.has(item._uniqueId) ? { ...item, status: newStatus } : item);
    this.showNotification(this.actionMessages[action] || 'Thao tác thành công', 'success');
    this.selectedRowIds = new Set();
    this.applyFilters();
  }

  getNewStatus(action: string): string {
    switch (action) {
      case 'send':
        return 'Gửi duyệt';
      case 'approve':
        return 'Duyệt áp dụng';
      case 'hide':
        return 'Ngừng áp dụng';
      case 'return':
        return 'Trả về';
      default:
        return '';
    }
  }

  handleFilterChange(statuses: string[]): void {
    this.selectedStatuses = statuses;
    this.applyFilters();
  }

  handleSearch(text: string): void {
    this.searchText = text;
    this.applyFilters();
  }

  handleResetFilters(): void {
    this.selectedStatuses = ['Đang soạn thảo'];
    this.searchText = '';
    this.header2Ref.resetFilters();
    this.applyFilters();
  }

  applyFilters(): void {
    let statusesToFilter = this.selectedStatuses;
    if (this.selectedStatuses.includes('Đang soạn thảo')) {
      statusesToFilter = [...new Set([...statusesToFilter, 'Trả về'])];
    }
    this.filteredData = this.allData.filter(item =>
      (statusesToFilter.length === 0 || statusesToFilter.includes(item.status)) &&
      (item.question.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item.id.toLowerCase().includes(this.searchText.toLowerCase()))
    );
    this.rowCount = this.filteredData.length;
    this.currentPage = 1;
    this.selectedRowIds = new Set();
  }

  handleSelectAll(event: any): void {
    const newSelectedRowIds = new Set(this.selectedRowIds);
    if (event.target.checked) {
      this.paginatedData().forEach(row => newSelectedRowIds.add(row._uniqueId));
    } else {
      this.paginatedData().forEach(row => newSelectedRowIds.delete(row._uniqueId));
    }
    this.selectedRowIds = newSelectedRowIds;
  }

  handleRowSelect(event: any, row: DataItem): void {
    const newSelectedRowIds = new Set(this.selectedRowIds);
    if (event.target.checked) {
      newSelectedRowIds.add(row._uniqueId);
    } else {
      newSelectedRowIds.delete(row._uniqueId);
    }
    this.selectedRowIds = newSelectedRowIds;
  }

  isRowSelected(row: DataItem): boolean {
    return this.selectedRowIds.has(row._uniqueId);
  }

  get areAllRowsSelected(): boolean {
    return this.paginatedData().length > 0 && this.paginatedData().every(row => this.selectedRowIds.has(row._uniqueId));
  }

  getStatusColor(status: string): string {
    return {
      'Đang soạn thảo': '#000',
      'Gửi duyệt': '#007bff',
      'Duyệt áp dụng': '#1A6634',
      'Ngừng áp dụng': '#FF0000',
      'Trả về': '#9E9E00',
    }[status] || '#000';
  }

  toggleDropdown(uniqueId: number): void {
    this.openDropdown = this.openDropdown === uniqueId ? null : uniqueId;
  }

  handleChangePage(page: number): void {
    this.currentPage = page;
  }

  handleChangeRowsPerPage(newPerPage: number): void {
    this.rowsPerPage = newPerPage;
    this.currentPage = 1;
    this.selectedRowIds = new Set();
  }

  handleClickOutside(event: any): void {
    if (!event.target.closest('.option-button-container')) {
      this.openDropdown = null;
    }
  }

  handleClose(): void {
    this.selectedRowIds = new Set();
    this.isActionPopupOpen = false;
  }

  getQuestionById(id: number): string {
    const item = this.allData.find(item => item._uniqueId === id);
    return item ? item.question : '';
  }
}