import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardComponent } from './components/card';
import { TinderCardDirective } from './directives/tinder-card';

import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import * as Hammer from 'hammerjs';

export class HammerConfig extends HammerGestureConfig {
  overrides = <any>{
    pan: { direction: Hammer.DIRECTION_ALL },
    swipe: { direction: Hammer.DIRECTION_VERTICAL },
  }
}

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    CardComponent,
    TinderCardDirective
  ],
  exports: [
    CardComponent,
    TinderCardDirective
  ],
  providers: [{
    provide: HAMMER_GESTURE_CONFIG,
    useClass: HammerConfig
  }]
})
export class SwipeCardsModule { }

export { CardComponent } from './components/card';
export { TinderCardDirective } from './directives/tinder-card';
