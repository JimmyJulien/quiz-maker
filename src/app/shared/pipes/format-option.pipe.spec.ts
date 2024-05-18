import { TestBed } from '@angular/core/testing';
import { FormatOptionPipe } from './format-option.pipe';

function setup() {
  TestBed.configureTestingModule({
    providers: [
      FormatOptionPipe
    ]
  });

  const pipe = TestBed.inject(FormatOptionPipe);

  return {
    pipe
  };
}

describe('FormatOptionPipe', () => {
  it('should return Undefined option if option is null', () => {
    const { pipe } = setup();

    const result = pipe.transform(null);

    expect(result).toBe('Undefined option');
  });

  it('should return option if formatFn is null', () => {
    const { pipe } = setup();

    const option = 'option';

    const result = pipe.transform(option);

    expect(result).toBe(option);
  });

  it('should return formatted option if formatFn is not null', () => {
    const { pipe } = setup();

    const option = 'option';

    const formatFn = (option: string) => option + 'formatted';

    const result = pipe.transform(option, formatFn);

    expect(result).toBe(formatFn(option));
  });
});
