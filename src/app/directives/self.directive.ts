import {
  Directive,
  HostListener,
  Renderer,
  ElementRef,
  OnInit,
  AfterViewInit,
  Output,
  Input,
  EventEmitter,
  ContentChildren,
  QueryList
} from '@angular/core';

import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';

/* It maintains the resizable aspect of the self element */

/**
 * The edges that the resize event were triggered on
 */
export interface Edges {
  top?: boolean | number;
  bottom?: boolean | number;
  left?: boolean | number;
  right?: boolean | number;
  center?: boolean | number;
}


/**
 * The bounding rectangle of the resized element
 */
export interface BoundingRectangle {
  top: number;
  bottom: number;
  left: number;
  right: number;
  height?: number;
  width?: number;
}

/**
 * The `$event` object that is passed to the resize events
 */
export interface ResizeEvent {
  rectangle: BoundingRectangle;
  edges: Edges;
}

/**
 * @private
 */
interface Coordinate {
  x: number;
  y: number;
}

/**
 * @private
 */
const isNumberCloseTo: Function = (value1: number, value2: number, precision: number = 3): boolean => {
  const diff: number = Math.abs(value1 - value2);
  return diff < precision;
};

/**
 * @private
 */
const getNewBoundingSize: Function =
  (startingRect: BoundingRectangle, edges: Edges, mouseX: number, mouseY: number, startingSize: number): number => {

  const growingPixels: number = 50;
  if (edges.right && mouseX > 0) {
    // we grow right
    console.log('creixem dreta');
    return startingSize + Math.round(mouseX / growingPixels);
  }
  if (edges.left && mouseX < 0) {
    console.log('creixem esquerra');
    return startingSize + Math.round((-mouseX) / growingPixels);
  }
  if (edges.right && mouseX < 0) {
    // we decrease right
    console.log('decreixem dreta');
    return startingSize - Math.round((-mouseX) / growingPixels);
  }
  if (edges.left && mouseX > 0) {
    console.log('decreixem esquerra');
    return startingSize - Math.round(mouseX / growingPixels);
  }
};


const isWithinBoundingY: Function = ({mouseY, rect}: {mouseY: number, rect: ClientRect}) => {
  return mouseY >= rect.top && mouseY <= rect.bottom;
};

const isWithinBoundingX: Function = ({mouseX, rect}: {mouseX: number, rect: ClientRect}) => {
  return mouseX >= rect.left && mouseX <= rect.right;
};

/* To get if mouse is close to allowed edge */
const getResizeEdges: Function = ({mouseX, mouseY, elm, allowedEdges}): Edges => {
  const elmPosition: ClientRect = elm.nativeElement.getBoundingClientRect();
  const edges: Edges = {};
  if (allowedEdges.left && isNumberCloseTo(mouseX, elmPosition.left) && isWithinBoundingY({mouseY, rect: elmPosition})) {
    edges.left = true;
  }
  if (allowedEdges.right && isNumberCloseTo(mouseX, elmPosition.right) && isWithinBoundingY({mouseY, rect: elmPosition})) {
    edges.right = true;
  }
  if (allowedEdges.top && isNumberCloseTo(mouseY, elmPosition.top) && isWithinBoundingX({mouseX, rect: elmPosition})) {
    edges.top = true;
  }
  if (allowedEdges.bottom && isNumberCloseTo(mouseY, elmPosition.bottom) && isWithinBoundingX({mouseX, rect: elmPosition})) {
    edges.bottom = true;
  }
  if (allowedEdges.center && isWithinBoundingX({mouseX, rect: elmPosition}) && isWithinBoundingY({mouseY, rect: elmPosition})
      && !(edges.left === true) && !(edges.right === true) && !(edges.top === true) && !(edges.bottom === true)) {
    edges.center = true;
  }
  return edges;
};

/* get resize cursor */
const getResizeCursor: Function = (edges: Edges): string => {
  if (edges.left && edges.top) {
    return 'nw-resize';
  } else if (edges.right && edges.top) {
    return 'ne-resize';
  } else if (edges.left && edges.bottom) {
    return 'sw-resize';
  } else if (edges.right && edges.bottom) {
    return 'se-resize';
  } else if (edges.left || edges.right) {
    return 'ew-resize';
  } else if (edges.top || edges.bottom) {
    return 'ns-resize';
  } else if (edges.center) {
    return 'move';
  } else {
    return 'auto';
  }
};

/**
 * @private
 */
const getEdgesDiff: Function = ({edges, initialRectangle, newRectangle}): Edges => {

  const edgesDiff: Edges = {};
  Object.keys(edges).forEach((edge: string) => {
    edgesDiff[edge] = newRectangle[edge] - initialRectangle[edge];
  });
  return edgesDiff;

};

const gridSizes = [
  'size-1of5',
  'size-1of4',
  'size-1of3',
  'size-2of5',
  'size-1of2',
  'size-3of5',
  'size-2of3',
  'size-3of4',
  'size-4of5',
  'size-1of1'
]


@Directive({
  selector: '[grid-item]'
})
export class SelfDirective implements OnInit {

    default_border: string = '1px solid transparent'
    startingSize: number;

    @Input('self') flaConfiguration: string;

    @Input() resizeEdges: Edges = {bottom: false, right: true, top: false, left: true, center: true};

    @Input() enableGhostResize: boolean = true;

    @Input() resizeSnapGrid: Edges = {left: 50, right: 50};


    /**
     * Called when the mouse is pressed and a resize event is about to begin. `$event` is a `ResizeEvent` object.
     */
    @Output() resizeStart: EventEmitter<Object> = new EventEmitter(false);

    /**
     * Called as the mouse is dragged after a resize event has begun. `$event` is a `ResizeEvent` object.
     */
    @Output() resize: EventEmitter<Object> = new EventEmitter(false);

    /**
     * Called after the mouse is released after a resize event. `$event` is a `ResizeEvent` object.
     */
    @Output() resizeEnd: EventEmitter<Object> = new EventEmitter(false);

    /**
     * @private
     */
    public mouseup: Subject<any> = new Subject();

    /**
     * @private
     */
    public mousedown: Subject<any> = new Subject();

    /**
     * @private
     */
    public mousemove: Subject<any> = new Subject();

    /**
     * @private
     */
    constructor(private renderer: Renderer, public elm: ElementRef) {}

    /**
     * @private
     */
    ngOnInit(): void {
      console.log(this.flaConfiguration);

      let currentResize: {
        edges: Edges,
        startingSize: number,
        currentSize: number,
        startingRect: BoundingRectangle,
        currentRect: BoundingRectangle,
        clonedNode?: HTMLElement
      };


      this.flaConfiguration.split(" ").forEach(config =>
        {
          if (config.indexOf('size') >= 0) {
            this.startingSize = gridSizes.indexOf(config);
            console.log(this.startingSize);
          }
        }
      )
      this.renderer.setElementStyle(this.elm.nativeElement, 'border', this.default_border);


      const removeGhostElement: Function = (): void => {
        if (currentResize.clonedNode) {
          this.elm.nativeElement.parentElement.removeChild(currentResize.clonedNode);
          this.renderer.setElementStyle(this.elm.nativeElement, 'display', 'inherit');
        }
      };

      // Set the cursor for the element
      this.mousemove.subscribe(({mouseX, mouseY}) => {
        const resizeEdges: Edges = getResizeEdges({mouseX, mouseY, elm: this.elm, allowedEdges: this.resizeEdges});
        const cursor: string = getResizeCursor(resizeEdges);
        this.renderer.setElementStyle(this.elm.nativeElement, 'cursor', cursor);
      });

      // click
      const mousedrag: Observable<any> = this.mousedown.flatMap(startCoords => {
        console.log(startCoords);
        const getDiff: Function = moveCoords => {
          return {
            mouseX: moveCoords.mouseX - startCoords.mouseX,
            mouseY: moveCoords.mouseY - startCoords.mouseY
          };
        };

        const getSnapGrid: Function = () => {
          const snapGrid: Coordinate = {x: 1, y: 1};

          if (currentResize) {
            if (this.resizeSnapGrid.left && currentResize.edges.left) {
              snapGrid.x = +this.resizeSnapGrid.left;
            } else if (this.resizeSnapGrid.right && currentResize.edges.right) {
              snapGrid.x = +this.resizeSnapGrid.right;
            }

            if (this.resizeSnapGrid.top && currentResize.edges.top) {
              snapGrid.y = +this.resizeSnapGrid.top;
            } else if (this.resizeSnapGrid.bottom && currentResize.edges.bottom) {
              snapGrid.y = +this.resizeSnapGrid.bottom;
            }
          }

          return snapGrid;
        };

        const getGrid: Function = (coords, snapGrid) => {
          return {
            x: Math.ceil(coords.mouseX / snapGrid.x),
            y: Math.ceil(coords.mouseY / snapGrid.y)
          };
        };

        return merge(
          this.mousemove.take(1).map(coords => [, coords]),
          this.mousemove.pairwise()
        ).map(([previousCoords, newCoords]) => {
          // get the difference from the new movement with two coord
          return [previousCoords ? getDiff(previousCoords) : previousCoords, getDiff(newCoords)];
        }).map(([, newCoords]) => {
          return {
            mouseX: Math.round(newCoords.mouseX),
            mouseY: Math.round(newCoords.mouseY)
          };
        }).takeUntil(merge(this.mouseup, this.mousedown));

      }).filter(() => !!currentResize);

      /* Phantom moving */
      mousedrag.map(({mouseX, mouseY}) => {
        console.log({mouseX, mouseY});
        let newBoundingSize: number =  getNewBoundingSize(currentResize.startingRect, currentResize.edges, mouseX, mouseY, currentResize.startingSize);
        if (newBoundingSize > 0 && newBoundingSize < 12) {
          return newBoundingSize;
        } else {
          return 9;
        }
      }).subscribe((newBoundingSize: number) => {
        console.log('anem a mostrar el fantasma de ' + newBoundingSize);
        if (currentResize.clonedNode) {
          console.log('mostrem el fantasma');
          this.renderer.setElementAttribute(currentResize.clonedNode, 'self', gridSizes[newBoundingSize]);
        }

        currentResize.currentSize = newBoundingSize;

      });

      // Check click on edges
      this.mousedown.map(({mouseX, mouseY, edges}) => {
        return edges || getResizeEdges({mouseX, mouseY, elm: this.elm, allowedEdges: this.resizeEdges});
      }).filter((edges: Edges) => {
        return Object.keys(edges).length > 0;
      }).subscribe((edges: Edges) => {
        console.log('Anem a creixer de debò');
        if (currentResize) {
          removeGhostElement();
        }
        const startingRect: BoundingRectangle = this.elm.nativeElement.getBoundingClientRect();
        const initialSize: number = this.startingSize;
        currentResize = {
          edges,
          startingSize: initialSize,
          currentSize: initialSize,
          startingRect,
          currentRect: startingRect
        }

        if (this.enableGhostResize) {
          currentResize.clonedNode = this.elm.nativeElement.cloneNode(true);
          this.elm.nativeElement.parentElement.appendChild(currentResize.clonedNode);
          this.renderer.setElementStyle(currentResize.clonedNode, 'background', 'black');
          this.renderer.setElementStyle(this.elm.nativeElement, 'display', 'none');
          this.renderer.setElementStyle(currentResize.clonedNode, 'user-drag', 'none');
          this.renderer.setElementStyle(currentResize.clonedNode, '-webkit-user-drag', 'none');
        }
        console.log('anem a redimensionar')
        this.resizeStart.emit({
          edges: getEdgesDiff({edges, initialRectangle: startingRect, newRectangle: startingRect}),
          rectangle: startingRect
        });
      });

      this.mouseup.subscribe(() => {
        console.log('ara siii');
        if (currentResize) {
          console.log('el que fem');
          // Change the attribute to the new one
          this.startingSize = currentResize.currentSize;
          this.renderer.setElementAttribute(this.elm.nativeElement, 'self', gridSizes[currentResize.currentSize]);
          this.resizeEnd.emit({
            edges: getEdgesDiff({
              edges: currentResize.edges,
              initialRectangle: currentResize.startingRect,
              newRectangle: currentResize.currentRect
            }),
            rectangle: currentResize.currentRect
          });
          removeGhostElement();
          currentResize = null;
        }
      });

    }

    /**
     * @private
     */
    @HostListener('document:mouseup', ['$event.clientX', '$event.clientY'])
    private onMouseup(mouseX: number, mouseY: number): void {
      this.mouseup.next({mouseX, mouseY});
    }

    /**
     * @private
     */
    @HostListener('document:mousedown', ['$event.clientX', '$event.clientY'])
    private onMousedown(mouseX: number, mouseY: number): void {
      this.mousedown.next({mouseX, mouseY});
    }

    /**
     * @private
     */
    @HostListener('document:mousemove', ['$event.clientX', '$event.clientY'])
    private onMousemove(mouseX: number, mouseY: number): void {
      this.mousemove.next({mouseX, mouseY});
    }

    @HostListener('mouseenter')
    private onMouseEnter() {
      this.highlight('1px dashed black');
    }

    @HostListener('mouseleave')
    private onMouseLeave() {
      this.highlight('0px solid transparent');
    }

    private highlight(color: string) {
      this.renderer.setElementStyle(this.elm.nativeElement, 'border', color);
    }

}
