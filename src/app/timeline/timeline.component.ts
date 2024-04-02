import { AfterViewInit, Component, OnInit } from '@angular/core';
import { data } from 'src/assets/data';
import { carouselINIT } from "src/assets/scripts/carousel";

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements AfterViewInit {

  colors = ["#885ca4", "#e69228", "#26b2e7", "#e5471e", "#FF3FA4", "#57375D", "#7B66FF"]
  timelineData = data.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  constructor() { }

  ngAfterViewInit():void {
    carouselINIT();
  }

}
