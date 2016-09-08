import { Component, Input } from '@angular/core';
import { ObjectService } from '../services/object.service';

@Component({
  selector: 'tile-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.css']
})
export class TitleTileComponent {
  @Input() storage: string;
  @Input() field: string;
  @Input() removable: string = 'false';

  constructor(
    public object: ObjectService
  ) {
  }

  get title() :string {
    return this.object.value.title;
  }

}
