import { Injectable } from '@angular/core';

@Injectable()
export class LayoutService {

  public layout: any;

  constructor() {
    this.layout = {
      'content': `
        <div data-layout="./@@page-site-layout">
          <div data-panel="content">
            <div layout="rows left-justify" grid>
              <div self="size-1of3 md-half sm-full" grid-item>
                <tile-title storage="model" field="title" removable="true"></tile-title>
              </div>
            </div>
            <div layout="rows left-justify" grid>
              <div self="size-1of3 md-half sm-full" grid-item>
                <tile-description storage="model" field="description" ></tile-description>
              </div>
            </div>
            <div layout="rows left-justify" grid>
              <div self="size-1of3 md-half sm-full" grid-item>
                <tile-html storage="model" field="text" ></tile-html>
              </div>
            </div>
            <div layout="rows left-justify" grid>
              <div self="size-1of3 md-half sm-full" grid-item>
                <tile-html storage="tile" field="tile1"></tile-html>
              </div>
            </div>
          </div>
        </div>`,
      'site': ``
    };
  }

}
