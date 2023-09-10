import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

/**
 * Check if the control value exists, that is to say if the value is in the existingValues
 * @param existingValues the existing values used for the check
 * @returns 
 */
export function existingValidator(existingValues: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if(!existingValues || !control.value) return null;
    return existingValues.includes(control.value) ? null : { error: 'Non existing value' }
  }
}