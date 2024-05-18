import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatOption',
  standalone: true
})
export class FormatOptionPipe<T> implements PipeTransform {

  transform(option: T | null, formatFn: Function | null = null): string {
    if(!option) {
      return 'Undefined option';
    }
    
    if(formatFn) {
      return formatFn(option);
    }

    return option.toString();
  }

}
