import { TestBed } from '@angular/core/testing';

import { TokenizeService } from './tokenize.service';

describe('TokenizeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TokenizeService = TestBed.get(TokenizeService);
    expect(service).toBeTruthy();
  });
});
