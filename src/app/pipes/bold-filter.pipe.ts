import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'qzmBoldFilter',
  standalone: true,
})
export class BoldFilterPipe implements PipeTransform {

  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(value: string, filter: string | null) {
    // If no value, return empty string
    if(!value) return '';

    // If no filter, return value
    if(!filter) return value;

    // Else make entered characters bold
    const indexBefore = value.toLowerCase().indexOf(filter.toLowerCase());
    const indexAfter = indexBefore + filter.length;
    const valueBeforeFilter = value.substring(0, indexBefore);
    const valueFilter = value.substring(indexBefore, indexAfter);
    const valueAfterFilter = value.substring(indexAfter, value.length);

    // Note: <b> not visible enough so use of span with bigger font-size + bold
    return this.sanitizer.bypassSecurityTrustHtml(
      `${valueBeforeFilter}<span style="font-size:1.1rem;font-weight:bolder;">${valueFilter}</span>${valueAfterFilter}`
    );
  }

}