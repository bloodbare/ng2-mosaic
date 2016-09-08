import { Injectable } from '@angular/core';

@Injectable()
export class LayoutService {

  public layout: any;

  constructor() {
    this.layout = {
      'content': `
        <div data-layout="./@@page-site-layout">
          <div name="content">
            <div layout="row left-justify">
              <div self="size-1of3 md-half sm-full" [dragula]='"first-bag"'>
                <tile-title storage="model" field="title" removable="true"></tile-title>
              </div>
            </div>
            <div layout="row left-justify">
              <div [dragula]='"first-bag"'>
                <tile-description storage="model" field="description" ></tile-description>
              </div>
            </div>
            <div layout="row left-justify">
              <div [dragula]='"first-bag"'>
                <tile-html storage="model" field="text" ></tile-html>
              </div>
            </div>
            <div layout="row left-justify">
              <div [dragula]='"first-bag"'>
                <tile-html storage="tile" field="tile1"></tile-html>
              </div>
            </div>
          </div>
        </div>`,
      'site': ``
    };
  }

}
