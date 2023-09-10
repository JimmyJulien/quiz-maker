import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription, combineLatest, map, of, tap } from 'rxjs';
import { BoldFilterPipe } from 'src/app/pipes/bold-filter.pipe';

@Component({
  selector: 'qzm-quizz-input',
  templateUrl: './quizz-input.component.html',
  styleUrls: ['./quizz-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BoldFilterPipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuizzInputComponent),
      multi: true
    }
  ]
})
export class QuizzInputComponent implements OnInit, OnDestroy, ControlValueAccessor {

  /** Quizz input options */
  @Input() options: string[] | null = null;

  /** Quizz input placeholder */
  @Input() placeholder: string | null = null;

  /** Quizz input disabled state */
  @Input() disabled = false;

  /** Quizz input mouse over listener */
  @HostListener('mouseover') onMouseover(): void {
    if(!this.areOptionsVisible && !this.disabled) {
      this.showOptions(true);
    }
  }

  /** Quizz input mouse leave listener */
  @HostListener('mouseleave') onMouseleave(): void {
    if(this.areOptionsVisible && !this.disabled) {
      this.showOptions(false);
    }
  }

  /** Quizz input form control */
  control = new FormControl<string | null>(null);

  /** Quizz input actual filter option */
  filterOption$ = new BehaviorSubject<string | null>(null);

  /** Quizz input actual filtered options */
  filteredOptions$!: Observable<string[] | null>;

  /** Indicates if quizz input options are visible */
  areOptionsVisible = false;

  /** On change quizz input method (used for ControlValueAccessor implementation) */
  onChange: (value: string | null) => void = () => {};

  /** On touched quizz input method (used for ControlValueAccessor implementation) */
  onTouched: () => void = () => {};

  /** Main subscription used ton unsubscribe when component is detroyed */
  subscription = new Subscription();

  ngOnInit(): void {
    this.defineFilteredOptions();
    this.updateOnValueChange();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Define filtered options of custom dropdown
   */
  private defineFilteredOptions() {
    this.filteredOptions$ = combineLatest([
      of(this.options),
      this.filterOption$,
    ])
    .pipe(
      map(([options, optionSaisie]) => {
        // Handle case when no options
        if(!options) return null;
  
        // Filter without case-sensitivity
        return options.filter(option => optionSaisie ? 
          option.toLowerCase().includes(optionSaisie.toLowerCase()) : true
        );
      })
    );
  }

  /**
   * Update filter option on value change
   */
  private updateOnValueChange() {
    this.subscription.add(
      this.control.valueChanges
      .pipe(
        tap(value => {
          // Update filter option
          this.filterOption$.next(value);
  
          // Apply onChange method
          this.onChange(value);
        })
      )
      .subscribe()
    );
  }

  /**
   * Show options if quizz input is not disabled when user focus on input
   */
  onInputFocus(): void {
    if(!this.disabled) this.showOptions(true);
  }

  /**
   * Show options if quizz input is not disabled when user enter a value in the quizz input
   */
  onInputInput(): void {
    if(!this.disabled) this.showOptions(true);
  }

  /**
   * Hide options when user blur input
   */
  onInputBlur(): void {
    this.showOptions(false);
  }

  /**
   * Hide options when user press Tab key on the last option
   * @param isLastOption indicates if the option is the last one
   */
  onOptionsTabKeydown(isLastOption: boolean): void {
    if(isLastOption) this.showOptions(false);
  }

  /**
   * Select an option
   * @param option option selected
   */
  onOptionClick(option: string) {
    // Set option input
    this.control.setValue(option);

    // Hide options
    this.showOptions(false);
  }

  /**
   * Show options if show is true, hide them else
   * @param show show boolean
   */
  showOptions(show: boolean) {
    this.areOptionsVisible = show;
  }

  /**
   * Synchronize control value when write (ControlValueAccessor implementation)
   * @param newValue the new control value
   */
  writeValue(newValue: string): void {
    this.control.setValue(newValue);
  }

  /**
   * Register value change (ControlValueAccessor implementation)
   * @param fn change function
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Register touched event (ControlValueAccessor implementation)
   * @param fn touched function
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Define disabled state (ControlValueAccessor implementation)
   * @param isDisabled boolean to define if the control is disabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

}
