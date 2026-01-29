import { Test, TestingModule } from '@nestjs/testing';
import { FichajeService } from './fichaje.service';

describe('FichajeService', () => {
  let service: FichajeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FichajeService],
    }).compile();

    service = module.get<FichajeService>(FichajeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
