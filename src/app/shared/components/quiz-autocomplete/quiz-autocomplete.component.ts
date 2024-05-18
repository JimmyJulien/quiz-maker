import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, forwardRef, input, signal, viewChild, viewChildren } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { BoldFilterPipe } from 'src/app/shared/pipes/bold-filter.pipe';

@Component({
  selector: 'qzm-quiz-autocomplete',
  templateUrl: './quiz-autocomplete.component.html',
  styleUrl: './quiz-autocomplete.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    BoldFilterPipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuizAutocompleteComponent),
      multi: true
    }
  ]
})
export class QuizAutocompleteComponent implements ControlValueAccessor {

  options = input<string[]>([]);

  placeholder = input<string>('');

  loading = input<boolean>(false);

  disabled = signal<boolean>(false);

  areOptionsVisible = signal<boolean>(false);

  filterOption = signal<string | null>(null);

  optionsAfterFilter = computed(() => {
    return this.#filterOptions();
  });

  atLeastOneOptionAfterFilter = computed(() => {
    return this.optionsAfterFilter().length > 0;
  });

  inputRef = viewChild<ElementRef<HTMLInputElement>>('input');

  optionRefs = viewChildren<ElementRef<HTMLElement>>('option');

  /** On change quiz input method (used for ControlValueAccessor implementation) */
  onChange: (value: string | null) => void = () => {};

  /** On touched quiz input method (used for ControlValueAccessor implementation) */
  onTouched: () => void = () => {};

  #filterOptions(): string[] {
    const options = this.options();
    const selectedOption = this.filterOption();

    // Handle case when no options
    if(!options) return [];

    // Filter without case-sensitivity
    return options.filter(option => selectedOption ? 
      option.toLowerCase().includes(selectedOption.toLowerCase()) : true
    );
  }

  /** Quiz input mouse over listener */
  @HostListener('mouseenter')
  onComponentMouseEnter(): void {
    if(!this.disabled() && !this.loading()) {
      this.showOptions(true);
    }
  }

  /** Quiz input mouse leave listener */
  @HostListener('mouseleave')
  onComponentMouseleave(): void {
    if(!this.disabled() && !this.loading()) {
      this.showOptions(false);
    }
  }

  /**
   * Show options if quiz input is not disabled when user enter a value in the quiz input
   */
  onInput(): void {
    const inputValue: string = this.inputRef()?.nativeElement.value || '';

    this.filterOption.set(inputValue);

    this.onChange(inputValue);

    setTimeout(() => {
      this.showOptions(
        !this.disabled() && !this.loading() && this.atLeastOneOptionAfterFilter()
      );
    });
  }

  onInputArrowDown(): void {
    this.#focusFirstOption();
  }

  #focusFirstOption(): void {
    this.showOptions(true);

    setTimeout(() => {
      this.optionRefs()[0]?.nativeElement.focus();
    });
  }

  onInputArrowUp(): void {
    this.#focusFirstOption();
  }

  onOptionArrowDown(optionIndex: number): void {
    this.#focusNextOption(optionIndex);
  }

  #focusNextOption(actualOptionIndex: number): void {
    const nextElement = this.optionRefs()[actualOptionIndex + 1];

    if(nextElement) {
      nextElement.nativeElement.focus();
    }
  }

  onOptionArrowUp(optionIndex: number): void {
    this.#focusPreviousOption(optionIndex);
  }

  #focusPreviousOption(actualOptionIndex: number): void {
    const previousElement = this.optionRefs()[actualOptionIndex - 1];

    if(previousElement) {
      previousElement.nativeElement.focus();
    }
  }

  onOptionEscape(): void {
    this.showOptions(false);
    this.inputRef()?.nativeElement.focus();
  }

  onOptionClick(option: string) {
    this.writeValue(option);
    this.filterOption.set(option);
    this.onChange(option);
    this.showOptions(false);
  }

  showOptions(show: boolean) {
    this.areOptionsVisible.set(show);
  }

  /**
   * Synchronize control value when write
   * (ControlValueAccessor implementation)
   * @param newValue the new control value
   */
  writeValue(newValue: string): void {
    this.inputRef()!.nativeElement.value = newValue;
  }

  /**
   * Register value change
   * (ControlValueAccessor implementation)
   * @param fn change function
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Register touched event
   * (ControlValueAccessor implementation)
   * @param fn touched function
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Define disabled state
   * (ControlValueAccessor implementation)
   * @param isDisabled boolean to define if the control is disabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

}
