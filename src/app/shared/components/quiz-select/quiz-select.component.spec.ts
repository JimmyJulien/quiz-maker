import { Component, DebugElement } from "@angular/core";
import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { QuizSelectComponent } from "./quiz-select.component";

describe('QuizSelectComponent', () => {
  it('should not show options container when no options are defined', () => {
    // GIVEN
    const {hostFixture, debugElement} = setup();

    // WHEN
    debugElement.triggerEventHandler('mouseenter');
    hostFixture.detectChanges();

    // THEN
    const optionsContainerElement = debugElement.query(By.css('[data-testid="options"]'));
    expect(optionsContainerElement).toBeNull();
  });

  it('should update input text when an option is clicked (component mouse enter + click)', () => {
    // GIVEN
    const options = ['Options1', 'Options2'];
    const {hostFixture, debugElement} = setup(options);

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

  it('should update input text when an option is clicked (input arrow down + click)', fakeAsync(() => {
    // GIVEN
    const options = ['Options1', 'Options2'];
    const {hostFixture, debugElement} = setup(options);

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

  it('should update input text when an option is clicked (input arrow up + click)', fakeAsync(() => {
    // GIVEN
    const options = ['Options1', 'Options2'];
    const {hostFixture, debugElement} = setup(options);

    // WHEN
    // Arrow up on input to show options
    let inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
    inputDebugElement.triggerEventHandler('keydown.arrowup');
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

  it('should update input text when an option is clicked (component mouse enter + option keydown enter)', fakeAsync(() => {
    // GIVEN
    const options = ['Options1', 'Options2'];
    const {hostFixture, debugElement} = setup(options);

    // WHEN
    // Mouse enter on component to show options
    debugElement.triggerEventHandler('mouseenter');
    hostFixture.detectChanges();

    // Enter on first option to select
    const firstOptionDebugElement = debugElement.query(By.css('[data-testid="option"]'));
    firstOptionDebugElement.triggerEventHandler('keydown.enter');
    hostFixture.detectChanges();

    // THEN
    const inputDebugElement = debugElement.query(By.css('[data-testid="input"]'));
    expect(inputDebugElement.nativeElement.innerText).toBe(options[0]);
  }));

  it('should have selected class when an option is selected', () => {
    // GIVEN
    const options = ['Options1', 'Options2'];
    const {hostFixture, debugElement} = setup(options);

    // WHEN
    // Mouse enter on component to show options
    debugElement.triggerEventHandler('mouseenter');
    hostFixture.detectChanges();

    // Click on second option to select
    let optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
    optionDebugElements[1].nativeElement.click();
    hostFixture.detectChanges();

    // Mouse enter on component to show options
    debugElement.triggerEventHandler('mouseenter');
    hostFixture.detectChanges();

    // THEN
    optionDebugElements = debugElement.queryAll(By.css('[data-testid="option"]'));
    expect(optionDebugElements[1].nativeElement.classList).toContain('selected');
  });
});

function setup(options: string[] = []) {
  @Component({
    standalone: true,
    imports: [QuizSelectComponent],
    template: `
      <qzm-quiz-select
        [options]="options"
      />
    `
  })
  class QuizSelectHostComponent {
    options = options;
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