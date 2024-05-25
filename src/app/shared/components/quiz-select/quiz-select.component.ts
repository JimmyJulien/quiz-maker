import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, forwardRef, input, signal, viewChild, viewChildren } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FormatOptionPipe } from '../../pipes/format-option.pipe';

@Component({
  selector: 'qzm-quiz-select',
  templateUrl: './quiz-select.component.html',
  styleUrl: './quiz-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    FormatOptionPipe,
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
  options = input.required<T[]>();

  /** Quiz select placeholder */
  placeholder = input<string>('Select an option');

  /** Quiz select disabled state */
  disabled = signal<boolean>(false);

  /** Option formatting function */
  optionFormatFn = input<((value: T | null) => string | null) | null>(null);
  
  /** Selected option */
  selectedOption = signal<T | null>(null);

  /** Indicates if there is at least one option */
  atLeastOneOption = computed(() => {
    return this.options().length > 0;
  });

  /** Formatted selected option */
  formattedSelectedOption = computed(() => {
    const formatFn = this.optionFormatFn();

    if(formatFn) {
      return formatFn(this.selectedOption());
    }

    return this.selectedOption;
  });

  /** Indicates if quiz select options are visible */
  areOptionsVisible = signal<boolean>(false);

  /** Input reference */
  inputRef = viewChild<ElementRef<HTMLElement>>('input');

  /** List of option references */
  optionRefs = viewChildren<ElementRef<HTMLElement>>('option');

  /** On change quiz select method (used for ControlValueAccessor implementation) */
  onChange: (value: T | null) => void = () => {};

  /** On touched quiz select method (used for ControlValueAccessor implementation) */
  onTouched: () => void = () => {};

  @HostListener('mouseenter')
  onComponentMouseEnter(): void {
    if(!this.disabled()) {
      this.showOptions(true);
    }
  }

  @HostListener('mouseleave')
  onComponentMouseLeave(): void {
    this.showOptions(false);
  }

  @HostListener('keydown.escape')
  onComponentKeydownEscape(): void {
    this.showOptions(false);
    this.inputRef()?.nativeElement.focus();
  }

  onInputKeydownEnter(): void {
    if(!this.disabled()) {
      this.showOptions(!this.areOptionsVisible());
    }
  }

  onInputKeydownSpace(): void {
    if(!this.disabled()) {
      this.showOptions(!this.areOptionsVisible());
    }
  }

  onInputArrowDown(): void {
    if(!this.disabled()) {
      this.showOptions(true);
      setTimeout(() => {
        this.optionRefs()[0].nativeElement.focus();
      });
    }
  }

  onOptionArrowDown(optionIndex: number): void {
    const nextElement = this.optionRefs()[optionIndex + 1];

    if(nextElement) {
      nextElement.nativeElement.focus();
    }
  }

  onOptionArrowUp(optionIndex: number): void {
    const previousElement = this.optionRefs()[optionIndex - 1];

    if(previousElement) {
      previousElement.nativeElement.focus();
    }
  }

  /**
   * Select an option
   * @param option option selected
   */
  onOptionClick(option: T) {
    // Set selected option
    this.writeValue(option);

    // Emit value change
    this.onChange(option)

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
    this.selectedOption.set(newValue);
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
