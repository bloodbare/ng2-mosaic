import {
  Component,
  ComponentMetadata,
  ComponentFactoryResolver,
  ComponentRef,
  Compiler,
  Directive,
  Inject,
  Input,
  NgModule,
  NgModuleMetadataType,
  Type,
  ViewContainerRef,
  ReflectiveInjector
} from '@angular/core';

import { TILES } from './tiles';
import {LayoutService} from './services/layout.service';

import {OpaqueToken} from '@angular/core';

/**
 * @internal
 */
export const COMPONENT_OUTLET_MODULE = new OpaqueToken('COMPONENT_OUTLET_MODULE');


/**
 * Setup for ComponentOutlet
 *
 * ```ts
 * @NgModule({
 *   providers: [
 *     provideComponentOutletModule({
 *       imports: [CommonModule]
 *     })
 *   ],
 *   declarations: [ComponentOutlet]
 * })
 * class AppModule {}
 * ```
 */
export function provideComponentOutletModule(metadata: NgModuleMetadataType): any[] {
    return [
        { provide: COMPONENT_OUTLET_MODULE, useValue: metadata }
    ];
}

@Component({
  selector: 'mosaic-editor',
  templateUrl: 'mosaic.component.html',
  styleUrls: ['mosaic.component.css']
})
export class MosaicEditorComponent {
  template: string;
  selector: string;
  component: ComponentRef<any>;
  context: any;

  constructor(
    public layout: LayoutService,
    @Inject(COMPONENT_OUTLET_MODULE) private moduleMeta: NgModuleMetadataType,
    private vcRef: ViewContainerRef,
    private compiler: Compiler) {
    }

  ngOnInit() {
      this.template = this.layout.layout.content;
      this.selector = 'layout';
      this.renderTemplate();
    }

    renderTemplate() {
      const cmpType = this._createDynamicComponent();
    const moduleType = this._createDynamicModule(cmpType);
    const injector = ReflectiveInjector.fromResolvedProviders([], this.vcRef.parentInjector);
    this.compiler.compileModuleAndAllComponentsAsync<any>(moduleType)
      .then(factory => {
        let cmpFactory: any;
        for (let i = factory.componentFactories.length - 1; i >= 0; i--) {
          if (factory.componentFactories[i].selector === this.selector) {
            cmpFactory = factory.componentFactories[i];
            break;
          }
        }
        return cmpFactory;
      })
      .then(cmpFactory => {
        if (cmpFactory) {
          this.vcRef.clear();
          this.component = this.vcRef.createComponent(cmpFactory, 0, injector);
          this.component.changeDetectorRef.detectChanges();
        }
      });
    }

    private _createDynamicComponent(): Type<any> {
      this.context = this.context || {};

      const metadata = new ComponentMetadata({
        selector: this.selector,
        template: this.template,
      });

      const cmpClass = class _ { };
      cmpClass.prototype = this.context;
      return Component(metadata)(cmpClass);
    }

    private _createDynamicModule(componentType: Type<any>) {
      const declarations = this.moduleMeta.declarations || [];
      declarations.push(componentType);
      declarations.push(TILES);
      const moduleMeta: NgModuleMetadataType = {
        imports: this.moduleMeta.imports,
        providers: this.moduleMeta.providers,
        declarations: declarations
      };
      return NgModule(moduleMeta)(class _ { })
    }

}
