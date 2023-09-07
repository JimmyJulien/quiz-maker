import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription, combineLatest, map, of, tap } from 'rxjs';
import { BoldFilterPipe } from '../../pipes/bold-filter.pipe';

@Component({
  selector: 'qzm-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BoldFilterPipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})
export class DropdownComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @Input()
  options: string[] | null = null;

  @Input()
  placeholder: string | null = null;

  @Input()
  disabled = false;

  @HostListener('mouseover')
  onMouseover() {
    if(!this.areOptionsVisible) {
      this.showOptions(true);
    }
  }

  @HostListener('mouseleave')
  onMouseleave() {
    if(this.areOptionsVisible) {
      this.showOptions(false);
    }
  }

  @HostListener('keydown.Escape')
  onEscape() {
    this.showOptions(false);
  }

  control = new FormControl<string | null>(null);

  filterOption$ = new BehaviorSubject<string | null>(null);

  filteredOptions$!: Observable<string[] | null>;

  areOptionsVisible = false;

  onChange: (value: string | null) => void = () => {};

  onTouched: () => void = () => {};

  subscription = new Subscription();

  ngOnInit(): void {
    this.defineFilteredOptions();
    this.updateOnCategoryChange();
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
   * Update filter option on category change
   */
  private updateOnCategoryChange() {
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
   * Synchronize control value when write
   * @param newValue the new control value
   */
  writeValue(newValue: string): void {
    this.control.setValue(newValue);
  }

  /**
   * Register value change
   * @param fn change function
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Register touched event
   * @param fn touched function
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Define disabled state
   * @param isDisabled boolean to define if the control is disabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

}
