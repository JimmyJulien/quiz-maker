import { TestBed } from "@angular/core/testing";
import { DomSanitizer } from "@angular/platform-browser";
import { BoldFilterPipe } from "./bold-filter.pipe";

function setup() {
  const domSanitizerSpy = jasmine.createSpyObj<DomSanitizer>("DomSanitizer", ["bypassSecurityTrustHtml"]);

  TestBed.configureTestingModule({
    providers: [
      BoldFilterPipe,
      { provide: DomSanitizer, useValue: domSanitizerSpy }
    ],
  });

  const pipe = TestBed.inject(BoldFilterPipe);

  return {
    pipe,
    domSanitizerSpy
  };
}

describe('BoldFilterPipe', () => {
  it('should return empty string if value is empty', () => {
    const { pipe } = setup();

    const result = pipe.transform('', null);

    expect(result).toBe('');
  });

  it('should return value unchanged if filter is empty', () => {
    const { pipe } = setup();

    const value = 'value';

    const result = pipe.transform(value, null);

    expect(result).toBe(value);
  });

  it('should return value with filter characters bold', () => {
    const { pipe, domSanitizerSpy } = setup();

    const value = 'value';

    const filter = 'al';

    pipe.transform(value, filter);

    expect(domSanitizerSpy.bypassSecurityTrustHtml).toHaveBeenCalledOnceWith(
      'v<span style="font-size:1.1rem;font-weight:bolder;">al</span>ue'
    );
  });
});
