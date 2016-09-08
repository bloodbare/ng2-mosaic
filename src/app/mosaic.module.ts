import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { removeNgStyles, createNewHosts } from '@angularclass/hmr';
import { CommonModule } from '@angular/common';

import { TILES } from './tiles';
import { HtmlTileComponent } from './tiles/html.component';
import { DragulaModule } from 'ng2-dragula';
import { MosaicEditorComponent } from './mosaic.component';

import { ObjectService } from './services/object.service';
import { LayoutService } from './services/layout.service';
import { ConfigurationService } from './services/configuration.service';
import { MosaicState, InteralStateType } from './services/state.service';

import { ENV_PROVIDERS } from './environment';

import { MOSAIC_RESOLVER_PROVIDERS } from './mosaic.resolver';

import { provideComponentOutletModule } from './mosaic.component';

// Application wide providers
const APP_PROVIDERS = [
  MosaicState,
  ConfigurationService,
  LayoutService,
  ObjectService
];

type StoreType = {
  state: InteralStateType,
  disposeOldHosts: () => void
};

@NgModule({
  declarations: [
    MosaicEditorComponent,
    // TILES,
    // HtmlTileComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    DragulaModule,
    CommonModule
  ],
  providers: [
    APP_PROVIDERS,
    ENV_PROVIDERS,
    provideComponentOutletModule({
      imports: [MosaicModule, DragulaModule]
    })
  ],
  bootstrap: [MosaicEditorComponent]
})

export class MosaicModule {

  constructor(public appRef: ApplicationRef, public appState: MosaicState) {}
 hmrOnInit(store: StoreType) {
   if (!store || !store.state) return;
   console.log('HMR store', store);
   this.appState._state = store.state;
   this.appRef.tick();
   delete store.state;
 }
 hmrOnDestroy(store: StoreType) {
   const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
   // recreate elements
   const state = this.appState._state;
   store.state = state;
   store.disposeOldHosts = createNewHosts(cmpLocation);
   // remove styles
   removeNgStyles();
 }
 hmrAfterDestroy(store: StoreType) {
   // display new elements
   store.disposeOldHosts();
   delete store.disposeOldHosts;
 }
}
