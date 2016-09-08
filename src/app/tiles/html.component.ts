import { Component, Input } from '@angular/core';
import { ObjectService } from '../services/object.service';

@Component({
  selector: 'tile-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.css']
})
export class HtmlTileComponent {

  @Input() storage: string;
  @Input() field: string;
  @Input() removable: string = 'false';

  constructor(
    public object: ObjectService
  ) {
  }

  get text(): string {
    if (this.storage === 'model') {
      return this.object.value[this.field].data;
    } else if (this.storage === 'tile') {
      return this.object.value.tiles[this.field].content;
    }
  }

}
