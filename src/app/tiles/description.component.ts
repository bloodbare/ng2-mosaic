import { Component, Input } from '@angular/core';
import { ObjectService } from '../services/object.service';

@Component({
  selector: 'tile-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css']
})
export class DescriptionTileComponent {

  @Input() storage: string;
  @Input() field: string;
  @Input() removable: string = 'false';

  constructor(
    public object: ObjectService
  ) {
  }

  get description(): string {
    return this.object.value.description;
  }
}
