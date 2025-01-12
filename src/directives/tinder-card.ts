import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Renderer2,
  Input,
  Output,
  OnInit,
  OnDestroy
}
from '@angular/core';


@Directive({
  selector: '[tinder-card]',
  host: {
    class: 'card-heap'
  }
})
export class TinderCardDirective implements OnInit, OnDestroy {
  _overlay: any;
  @Input('tinder-card')
  set overlay(value: any) {
    this._overlay = value || {};
  }
  _callLike: EventEmitter<any>;
  @Input('callLike')
  set callLike(value: EventEmitter<any>) {
    this._callLike = value || new EventEmitter<any>();
    this.initCallLike();
  }

  @Input() fixed: boolean;
  @Input() orientation: string = 'xy';

  @Output() onLike: EventEmitter<any> = new EventEmitter();

  like: boolean;

  element: HTMLElement;
  overlayElement: HTMLElement;

  constructor(protected el: ElementRef, protected renderer: Renderer2) {
    this.element = el.nativeElement;
  }

  onReleaseLikeCb(event: any) {
    this.like = event.like;
    let el = this.element;
    let x = (el.offsetWidth + el.clientWidth) * ((!!event.like ? 1 : -1) || 0);
    let rotate = (x * 20) / el.clientWidth;

    if (this._overlay) {
      let overlayElm = <HTMLElement>this.element.querySelector('.tinder-overlay');
      this.renderer.setStyle(overlayElm, "transition", "transform 0.6s ease");
      this.renderer.setStyle(overlayElm, "opacity", "0.5");
    }
  }

  onSwipeLikeCb(event: any) {
    if (this._overlay) {
      let overlayElm = <HTMLElement>this.element.querySelector('.tinder-overlay');
      this.renderer.setStyle(overlayElm, "transition", "opacity 0s ease");
      let opacity = (event.distance < 0 ? event.distance * -1 : event.distance) * 0.5 / this.element.offsetWidth;
      this.renderer.setStyle(overlayElm, "opacity", opacity.toString());
    }
  }

  destroy(delay: number = 0) {
    setTimeout(() => {
      this.element.remove();
    }, 200);
  }

  @HostListener('onSwipe', ['$event'])
  onSwipe(event: any) {
    let like = (this.orientation === "y" && event.deltaY < 0) ||
      (this.orientation !== "y" && event.deltaX > 0);
    let opacity = (event.distance < 0 ? event.distance * -1 : event.distance) * 0.5 / this.element.offsetWidth;
    if (!!this._overlay) {
      this.renderer.setStyle(this.overlayElement, "transition", "opacity 0s ease");
      this.renderer.setStyle(this.overlayElement, "opacity", opacity.toString());
      this.renderer.setStyle(this.overlayElement, "background-color", this._overlay[like ? "like" : "dislike"].backgroundColor);
    }
    this.translate({
      x: event.deltaX,
      y: event.deltaY,
      rotate: ((event.deltaX * 20) / this.element.clientWidth)
    });
  }

  @HostListener('onAbort', ['$event'])
  onAbort(event: any) {
    if (!!this._overlay) {
      this.renderer.setStyle(this.overlayElement, "transition", "opacity 0.2s ease");
      this.renderer.setStyle(this.overlayElement, "opacity", "0");
    }
  }

  @HostListener('onRelease', ['$event'])
  onRelease(event: any) {
    let like = (this.orientation === "y" && event.deltaY < 0) ||
      (this.orientation !== "y" && event.deltaX > 0);
    if (this._callLike) {
      this._callLike.emit({ like });
    }
    if (this.onLike) {
      this.onLike.emit({ like });
    }
  }

  translate(params: any) {
    if (!this.fixed) {
      this.renderer.setStyle(this.element, "transition", "transform " + (params.time || 0) + "s ease");
      this.renderer.setStyle(this.element, "webkitTransform", "translate3d(" +
        (params.x && (!this.orientation || this.orientation.indexOf("x") != -1) ? (params.x) : 0) +
        "px, " +
        (params.y && (!this.orientation || this.orientation.indexOf("y") != -1) ? (params.y) : 0) +
        "px, 0) rotate(" +
        params.rotate +
        "deg)");
    }
  }

  initOverlay() {
    if (!!this._overlay) {
      this.overlayElement = document.createElement("div");
      this.overlayElement.className += " card-overlay";
      this.element.appendChild(this.overlayElement);
      this.renderer.setStyle(this.overlayElement, "transform", "translateZ(0)");
      this.renderer.setStyle(this.overlayElement, "opacity", "0");
      this.renderer.setStyle(this.overlayElement, "border-radius", "2px");
      this.renderer.setStyle(this.overlayElement, "position", "absolute");
      this.renderer.setStyle(this.overlayElement, "width", "100%");
      this.renderer.setStyle(this.overlayElement, "height", "100%");
      this.renderer.setStyle(this.overlayElement, "top", "0");
      this.renderer.setStyle(this.overlayElement, "left", "0");
      this.renderer.setStyle(this.overlayElement, "display", "flex");
      this.renderer.setStyle(this.overlayElement, "align-items", "center");
      this.renderer.setStyle(this.overlayElement, "justify-content", "center");
      this.renderer.setStyle(this.overlayElement, "overflow", "hidden");
      this.renderer.setStyle(this.overlayElement, "color", "white");
    }
  }

  ngOnInit() {
    this.initOverlay();

    this._overlay = this._overlay || {};
    this.orientation = this.orientation || "xy";
    this._callLike = this._callLike || new EventEmitter();
    this.initCallLike();
  }

  initCallLike() {
    this._callLike.subscribe((params: any) => {
      let el = this.element;
      let x = (el.offsetWidth + el.clientWidth) * (params.like ? 1 : -1);
      let y = (el.offsetHeight + el.clientHeight) * (params.like ? -1 : 1);
      this.translate({
        x: x,
        y: y,
        rotate: (x * 20) / el.clientWidth,
        time: 0.8
      });
      this.renderer.setStyle(this.overlayElement, "transition", "opacity 0.4s ease");
      this.renderer.setStyle(this.overlayElement, "opacity", "0.5");
      this.renderer.setStyle(this.overlayElement, "background-color", this._overlay[params.like ? "like" : "dislike"].backgroundColor);
      this.destroy(200);
    });
  }

  ngOnDestroy() {
    if (this._callLike) {
      this._callLike.unsubscribe();
    }
  }
}
