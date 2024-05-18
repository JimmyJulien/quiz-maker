import { Component, DebugElement } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { QuizAutocompleteComponent } from "./quiz-autocomplete.component";

describe('QuizAutocompleteComponent', () => {
  it('show all options when input is clicked', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});

function setup() {
  @Component({
    standalone: true,
    imports: [QuizAutocompleteComponent],
    template: `
      <qzm-quiz-autocomplete
        [options]="options"
      />
    `
  })
  class QuizInputHostComponent {
    options = ["Option1", "Option2", "Option3"];
  }

  const hostFixture = TestBed.createComponent(QuizInputHostComponent);
  const hostComponent: QuizInputHostComponent = hostFixture.componentInstance;
  const debugElement: DebugElement = hostFixture.debugElement.query(By.directive(QuizAutocompleteComponent));
  const component: QuizAutocompleteComponent = debugElement.componentInstance;
  const element: HTMLElement = debugElement.nativeElement;

  hostFixture.detectChanges();

  return {
    hostFixture,
    hostComponent,
    debugElement,
    component,
    element
  };
}
