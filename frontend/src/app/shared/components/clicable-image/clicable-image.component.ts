import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clicable-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded w-25 h-25 flex items-center justify-center cursor-pointer">
      <img [src]="imgUrl" [alt]="altText" [width]="width" [height]="height" />
    </div>
  `,
  styleUrls: ['./clicable-image.component.scss']
})
export class ClicableComponent {
  @Input() imgUrl: string = '';
  @Input() altText: string = '';
  @Input() width: number = 20;
  @Input() height: number = 20;
}