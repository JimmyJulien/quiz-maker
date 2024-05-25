import { Component, DebugElement } from "@angular/core";
import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { QuizSelectComponent } from "./quiz-select.component";

type SetupConfig = {
  options: unknown[];
  optionFormatFn: Function | null;
  placeholder: string;
  disabled: boolean;
  loading: boolean;
  selectedOption: unknown;
};

function setup(config?: Partial<SetupConfig>) {
  @Component({
    standalone: true,
    imports: [QuizSelectComponent, ReactiveFormsModule],
    template: `
      <qzm-quiz-select
        [options]="options"
        [optionFormatFn]="optionFormatFn"
        [placeholder]="placeholder"
        [formControl]="control"
      />
    `
  })
  class QuizSelectHostComponent {
    options = config?.options ?? [];
    optionFormatFn = config?.optionFormatFn ?? null;
    placeholder = config?.placeholder ?? 'Select an option';

    control = new FormControl({
      value: config?.selectedOption ?? null,
      disabled: config?.disabled?? false
    });
  }

  const hostFixture = TestBed.createComponent(QuizSelectHostComponent);
  const debugElement: DebugElement = hostFixture.debugElement.query(By.directive(QuizSelectComponent));
  const component: QuizSelectComponent<string> = debugElement.componentInstance;
  const element: HTMLElement = debugElement.nativeElement;

  hostFixture.detectChanges();

  return {
    hostFixture,
    debugElement,
    component,
    element,
  };
}

describe('QuizSelectComponent', () => {
  describe('initial state', () => {
    it("should show an input with the placeholder 'Select an option' when component is initialized with no placeholder", () => {
      // GIVEN
      const {debugElement} = setup();

      // THEN
      const inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      expect(inputDebugElement.nativeElement.innerText).toBe('Select an option');
    });

    it("should show an input with the defined placeholder when component is initialized with a placeholder", () => {
      // GIVEN
      const placeholder = 'Select a category';
      const {debugElement} = setup({placeholder});

      // THEN
      const inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      expect(inputDebugElement.nativeElement.innerText).toBe(placeholder);
    });

    it('should not show options container when component is initialized', () => {
      // GIVEN
      const {debugElement} = setup();

      // THEN
      const optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(0);
    });
  });
  
  describe('disabled state', () => {
    it('should show an input with a disabled class', () => {
      // GIVEN
      const options = ['Option1', 'Option2'];
      const {debugElement} = setup({options, disabled: true});

      // THEN
      const inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      expect(inputDebugElement.nativeElement.classList).toContain('disabled');
    });

    it('should not show options on mouse enter', () => {
      // GIVEN
      const options = ['Option1', 'Option2'];
      const {hostFixture, debugElement} = setup({options, disabled: true});

      // WHEN
      debugElement.triggerEventHandler('mouseenter');
      hostFixture.detectChanges();

      // THEN
      const optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(0);
    });

    it('should not show options on input keydown space', () => {
      // GIVEN
      const options = ['Option1', 'Option2'];
      const {hostFixture, debugElement} = setup({options, disabled: true});

      // WHEN
      const inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      inputDebugElement.triggerEventHandler('keydown.space');
      hostFixture.detectChanges();

      // THEN
      const optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(0);
    });

    it('should not show options on input keydown enter', () => {
      // GIVEN
      const options = ['Option1', 'Option2'];
      const {hostFixture, debugElement} = setup({options, disabled: true});

      // WHEN
      const inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      inputDebugElement.triggerEventHandler('keydown.enter');
      hostFixture.detectChanges();

      // THEN
      const optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(0);
    });

    it('should not show options on input keydown arrow down', fakeAsync(() => {
      // GIVEN
      const options = ['Option1', 'Option2'];
      const {hostFixture, debugElement} = setup({options, disabled: true});

      // WHEN
      const inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      inputDebugElement.triggerEventHandler('keydown.arrowdown');
      hostFixture.detectChanges();
      tick();// necessary because setTimeout

      // THEN
      const optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(0);
    }));
  });

  describe('normal state', () => {
    it('should show options on component mouse enter', () => {
      // GIVEN
      const options = ['Option1', 'Option2'];
      const {hostFixture, debugElement} = setup({options});
  
      // WHEN
      debugElement.triggerEventHandler('mouseenter');
      hostFixture.detectChanges();
  
      // THEN
      const optiosDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optiosDebugElements.length).toBe(options.length);
    });

    it('should hide options on component mouse leave', () => {
      // Setup
      const options = ['Option1', 'Option2'];
      const {hostFixture, debugElement} = setup({options});
  
      // Mouse enter on component to show options
      debugElement.triggerEventHandler('mouseenter');
      hostFixture.detectChanges();
  
      // Check if options are shown
      let optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(options.length);
  
      // Mouse leave to hide options
      debugElement.triggerEventHandler('mouseleave');
      hostFixture.detectChanges();
  
      // Check if options are hidden
      optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(0);
    });

    it('should hide options on component Escape keydown', () => {
      // Setup
      const options = ['Option1', 'Option2'];
      const {hostFixture, debugElement} = setup({options});
  
      // Mouse enter on component to show options
      debugElement.triggerEventHandler('mouseenter');
      hostFixture.detectChanges();
  
      // Check if options are shown
      let optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(options.length);
      
      // Push Escape key to hide options
      debugElement.triggerEventHandler('keydown.escape');
      hostFixture.detectChanges();
  
      // Check if options are hidden
      optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(0);
    });

    it('should show options on input Enter keydown', () => {
      // Setup
      const options = ['Option1', 'Option2'];
      const {hostFixture, debugElement} = setup({options});
  
      // Focus on input
      const inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      inputDebugElement.triggerEventHandler('focus');
      hostFixture.detectChanges();
  
      // Check if options are hidden
      let optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(0);
  
      // Push Enter key to show options
      inputDebugElement.triggerEventHandler('keydown.enter');
      hostFixture.detectChanges();
  
      // Check if options are shown
      optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(options.length);
    });
  
    it('should hide options on input Enter keydown', () => {
      // Setup
      const options = ['Option1', 'Option2'];
      const {hostFixture, debugElement} = setup({options});
  
      // Focus on input
      const inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      inputDebugElement.triggerEventHandler('focus');
      hostFixture.detectChanges();
  
      // Check if options are hidden
      let optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(0);
  
      // Push Enter key to show options
      inputDebugElement.triggerEventHandler('keydown.enter');
      hostFixture.detectChanges();
  
      // Check if options are shown
      optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(options.length);
  
      // Push Enter key to hide options
      inputDebugElement.triggerEventHandler('keydown.enter');
      hostFixture.detectChanges();
  
      // Check if options are hidden
      optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(0);
    });

    it('should show options on input Space keydown', () => {
      // Setup
      const options = ['Option1', 'Option2'];
      const {hostFixture, debugElement} = setup({options});
  
      // Focus on input
      const inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      inputDebugElement.triggerEventHandler('focus');
      hostFixture.detectChanges();
  
      // Check if options are hidden
      let optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(0);
  
      // Push Space key to show options
      inputDebugElement.triggerEventHandler('keydown.space');
      hostFixture.detectChanges();
  
      // Check if options are shown
      optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(options.length);
    });
  
    it('should hide options on input Space keydown', () => {
      // Setup
      const options = ['Option1', 'Option2'];
      const {hostFixture, debugElement} = setup({options});
  
      // Click on input
      const inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      inputDebugElement.triggerEventHandler('click');
      hostFixture.detectChanges();
  
      // Check if options are hidden
      let optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(0);
  
      // Push Space key to show options
      inputDebugElement.triggerEventHandler('keydown.space');
      hostFixture.detectChanges();
  
      // Check if options are shown
      optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(options.length);
  
      // Push Space key to hide options
      inputDebugElement.triggerEventHandler('keydown.space');
      hostFixture.detectChanges();
  
      // Check if options are hidden
      optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(0);
    });

    it('should show options on input ArrowDown keydown', () => {
      // Setup
      const options = ['Option1', 'Option2'];
      const {hostFixture, debugElement} = setup({options});

      // Focus on input
      const inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      inputDebugElement.triggerEventHandler('keydown.arrowdown');
      hostFixture.detectChanges();

      // Check if options are hidden
      let optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements.length).toBe(options.length);
    });

    it('should show formatted options when options are objects', () => {
      // GIVEN
      const options = [
        {label: 'Option1', value: 'Value1'},
        {label: 'Option2', value: 'Value2'},
      ];
  
      const optionFormatFn = (option: {label: string, value: string}) => option.label;
  
      const {hostFixture, debugElement} = setup({options, optionFormatFn});
  
      // WHEN
      // Mouse enter on component to show options
      debugElement.triggerEventHandler('mouseenter');
      hostFixture.detectChanges();
  
      // Options should be formatted
      const optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      const formattedOptions = optionDebugElements.map(optionDebugElement => optionDebugElement.nativeElement.innerText);
  
      // THEN
      expect(formattedOptions).toEqual(['Option1', 'Option2']);
    });

    it('should apply a selected class to the selected option', () => {
      // Setup
      const options = ['Option1', 'Option2'];
      const selectedOption = options[0];
      const {hostFixture, debugElement} = setup({options, selectedOption});

      // Mouse enter component to show options
      debugElement.triggerEventHandler('mouseenter');
      hostFixture.detectChanges();

      // Check if first option has selected class
      const optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      expect(optionDebugElements[0].nativeElement.classList).toContain('selected');
    });

    it('should update input text on option click', () => {
      // GIVEN
      const options = ['Option1', 'Option2'];
      const {hostFixture, debugElement} = setup({options});
  
      // WHEN
      // Mouse enter on component to show options
      debugElement.triggerEventHandler('mouseenter');
      hostFixture.detectChanges();
  
      // Click on second option to select
      const optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      optionDebugElements[1].nativeElement.click();
      hostFixture.detectChanges();
  
      // THEN
      const inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      expect(inputDebugElement.nativeElement.innerText).toBe(options[1]);
    });

    it('should update input text on option keydown enter', fakeAsync(() => {
      // GIVEN
      const options = ['Option1', 'Option2'];
      const {hostFixture, debugElement} = setup({options});
  
      // WHEN
      // Arrow down on input to show options
      let inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      inputDebugElement.triggerEventHandler('keydown.arrowdown');
      hostFixture.detectChanges();
      tick();// necessary because setTimeout
  
      // Click on first option to select
      const optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      optionDebugElements[0].nativeElement.click();
      hostFixture.detectChanges();
  
      // THEN
      inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      expect(inputDebugElement.nativeElement.innerText).toBe(options[0]);
    }));
  
    it('should update input text with a formatted option when an object option is selected', () => {
      // GIVEN
      const options = [
        {label: 'Option1', value: 'Value1'},
        {label: 'Option2', value: 'Value2'},
      ];
  
      const optionFormatFn = (option: {label: string, value: string}) => option.label;
  
      const {hostFixture, debugElement} = setup({options, optionFormatFn});
  
      // WHEN
      // Mouse enter on component to show options
      debugElement.triggerEventHandler('mouseenter');
      hostFixture.detectChanges();
  
      // Click on first option to select
      let optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
      optionDebugElements[0].nativeElement.click();
      hostFixture.detectChanges();
  
      // THEN
      const inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
      expect(inputDebugElement.nativeElement.innerText).toBe('Option1');
    });
  });
});
