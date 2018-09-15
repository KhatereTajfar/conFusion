
import {Component, OnInit, Input, Inject} from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Params, ActivatedRoute} from '@angular/router';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {
    @Input()
    dish = Dish;
    dishIds: number[];
    prev: number;
    next: number;
  constructor(private location: Location,
    private dishservice: DishService,
    private route: ActivatedRoute,
    @Inject('BaseURL') private BaseURL) { }

    ngOnInit() {
      this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
      this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(+params['id'])))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
    }

    setPrevNext(dishId: number) {
      const index = this.dishIds.indexOf(dishId);
      this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
      this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }

  goBack(): void {
    this.location.back();
  }
}
