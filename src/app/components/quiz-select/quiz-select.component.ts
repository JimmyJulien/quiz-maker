import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

// TODO upgrade select with options
@Component({
  selector: 'qzm-quiz-select',
  templateUrl: './quiz-select.component.html',
  styleUrl: './quiz-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuizSelectComponent),
      multi: true
    }
  ]
})
export class QuizSelectComponent<T> implements ControlValueAccessor {
  
  /** Quiz select options */
  options = input.required<T[] | null>();

  /** Selected option */
  selectedOption = signal<T | null>(null);

  /** Quiz select placeholder */
  placeholder = input<string | null>(null);

  /** Quiz select disabled state */
  disabled = model<boolean>(false);

  /** Option formatting function */
  optionFormatFn = input<((value: T | null) => string | null) | null>(null);
  
  /** Indicates if quiz select options are visible */
  areOptionsVisible = signal<boolean>(false);

  /** Quiz select mouse over listener */
  @HostListener('mouseover') onMouseover() {
    if(!this.areOptionsVisible() && !this.disabled()) {
      this.showOptions(true);
    }
  }

  /** Quiz select mouse leave listener */
  @HostListener('mouseleave') onMouseleave() {
    if(this.areOptionsVisible() && !this.disabled()) {
      this.showOptions(false);
    }
  }

  /** Quiz select form control */
  control = new FormControl<string | null>(null);
  
  /** On change quiz select method (used for ControlValueAccessor implementation) */
  onChange: (value: T | null) => void = () => {};

  /** On touched quiz select method (used for ControlValueAccessor implementation) */
  onTouched: () => void = () => {};

  /**
   * Show options if quiz input is not disabled when user focus on input
   */
  onInputFocus(): void {
    if(!this.disabled()) this.showOptions(true);
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
  onOptionClick(option: T) {
    // Set selected option
    this.selectedOption.set(option);

    // Set option input
    const optionFormatFn = this.optionFormatFn();
    
    if(optionFormatFn) {
      this.control.setValue(optionFormatFn(option));
    }

    //Emit value change
    this.onChange(this.selectedOption())

    // Hide options
    this.showOptions(false);
  }

  /**
   * Show options if show is true, hide them else
   * @param show show boolean
   */
  showOptions(show: boolean) {
    this.areOptionsVisible.set(show);
  }

  /**
   * Synchronize control value when write (ControlValueAccessor implementation)
   * @param newValue the new control value
   */
  writeValue(newValue: T): void {
    const optionFormatFn = this.optionFormatFn();

    if(optionFormatFn) {
      this.control.setValue(optionFormatFn(newValue));
    }
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
    this.disabled.set(isDisabled);
  }

}
