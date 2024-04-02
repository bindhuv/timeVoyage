import { Component, Input, OnInit, TemplateRef, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent implements OnInit {
  @Input() title: any;
  @Input() description:any;
  @Input() data:any;

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  openVerticallyCentered(content: TemplateRef<any>) {
		this.modalService.open(content, { centered: true });
	}

}
