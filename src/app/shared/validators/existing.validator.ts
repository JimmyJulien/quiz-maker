import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function existingValidator(existingValues: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if(!existingValues) return null;
    return existingValues.includes(control.value) ? null : { error: 'Non existing value' }
  }
}