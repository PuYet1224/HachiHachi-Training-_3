import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent {
  @Input() question!: string;
  @Input() id!: string;
  @Input() type!: string;
  @Input() description!: string;
  @Input() duration!: string;
  @Input() status!: string;
}
