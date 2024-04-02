import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TimelineComponent } from './timeline/timeline.component';
import { EventCardComponent } from './event-card/event-card.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    TimelineComponent,
    EventCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
