import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor'
})
export class StatusColorPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'Đang soạn thảo':
        return 'draft-status';
      case 'Gửi duyệt':
        return 'submit-status';
      case 'Duyệt áp dụng':
        return 'approved-status';
      case 'Ngừng áp dụng':
        return 'stopped-status';
      case 'Trả về':
        return 'returned-status';
      default:
        return '';
    }
  }
}
