
import { Component, OnInit, Inject } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Params, ActivatedRoute} from '@angular/router';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/Comment';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    trigger('visibility', [
        state('shown', style({
            transform: 'scale(1.0)',
            opacity: 1
        })),
        state('hidden', style({
            transform: 'scale(0.5)',
            opacity: 0
        })),
        transition('* => *', animate('0.5s ease-in-out'))
    ])
  ]
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: number[];
  prev: number;
  next: number;
  commentForm: FormGroup;
  comment: Comment;
  dishcopy = null;
  visibility = 'shown';

  formErrors = {
    'comment': '',
    'author': ''
  };
  validationMessages = {
    'comment': {
      'required':      'Comment is required.',
      'minlength':     'Comment must be at least 2 characters long.'
    },
    'author': {
      'required':      'Name is required.',
      'minlength':     'Name must be at least 2 characters long.'
    }
  };

  constructor(private location: Location,
    private dishservice: DishService,
    private fb: FormBuilder,
    private route: ActivatedRoute, @Inject('BaseURL') private BaseURL) { }
    errMess: string;

    ngOnInit() {
      this.createForm();
      this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
      this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(+params['id']); }))
    .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
      errmess => this.errMess = <any>errmess);
    }

    setPrevNext(dishId: number) {
      const index = this.dishIds.indexOf(dishId);
      this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
      this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }

  goBack(): void {
    this.location.back();
  }
  createForm(): void {
    this.commentForm = this.fb.group({
      rating: 5,
      comment: ['', [Validators.required, Validators.minLength(2)] ],
      author: ['', [Validators.required, Validators.minLength(2)] ],
      date: ''
    });

    this.commentForm.valueChanges
    .subscribe(data => this.onValueChanged(data),
    errmess => this.errMess = <any>errmess);

    this.onValueChanged(); // (re)set validation messages
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString();
    console.log(JSON.stringify(this.comment));
    this.commentForm.reset({
      rating: 5,
      comment: '',
      author: '',
      date: ''
    });

    this.dishcopy.comments.push(this.comment);
    this.dishcopy.save()
      .subscribe(dish => { this.dish = dish; console.log(this.dish); });
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      if (this.formErrors.hasOwnProperty(field)) {
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
            this.formErrors[field] = messages[key] + ' ';
              }
            }
          }
      }// if (this.formErrors.hasOwnProperty(field))
    }// for .. this.formErrors
  }

}
