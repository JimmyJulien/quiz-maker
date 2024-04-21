import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { resultGuard } from './result.guard';

describe('resultGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => resultGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
