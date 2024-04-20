import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'qzm-quizz-select',
  templateUrl: './quizz-select.component.html',
  styleUrl: './quizz-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuizzSelectComponent),
      multi: true
    }
  ]
})
export class QuizzSelectComponent<T> implements ControlValueAccessor {
  
  /** Quizz select options */
  @Input() options: T[] | null = null;

  /** Selected option */
  @Input() selectedOption : T | null = null;

  /** Quizz select placeholder */
  @Input() placeholder: string | null = null;

  /** Quizz select disabled state */
  @Input() disabled: boolean | null = false;

  /** Option formatting function */
  @Input() optionFormatFn: (value: T | null) => string | null = (value) => value as string;
  
  /** Quizz select mouse over listener */
  @HostListener('mouseover') onMouseover() {
    if(!this.areOptionsVisible && !this.disabled) {
      this.showOptions(true);
    }
  }

  /** Quizz select mouse leave listener */
  @HostListener('mouseleave') onMouseleave() {
    if(this.areOptionsVisible && !this.disabled) {
      this.showOptions(false);
    }
  }

  /** Quizz select form control */
  control = new FormControl<string | null>(null);

  /** Indicates if quizz select options are visible */
  areOptionsVisible = false;
  
  /** On change quizz select method (used for ControlValueAccessor implementation) */
  onChange: (value: T | null) => void = () => {};

  /** On touched quizz select method (used for ControlValueAccessor implementation) */
  onTouched: () => void = () => {};

  /**
   * Show options if quizz input is not disabled when user focus on input
   */
  onInputFocus(): void {
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
  onOptionClick(option: T) {
    // Set selected option
    this.selectedOption = option;

    // Set option input
    this.control.setValue(this.optionFormatFn(option));

    //Emit value change
    this.onChange(this.selectedOption)

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
  writeValue(newValue: T): void {
    this.control.setValue(this.optionFormatFn(newValue));
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
