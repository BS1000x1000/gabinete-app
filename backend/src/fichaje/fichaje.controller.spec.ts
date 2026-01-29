import { Test, TestingModule } from '@nestjs/testing';
import { FichajeController } from './fichaje.controller';

describe('FichajeController', () => {
  let controller: FichajeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FichajeController],
    }).compile();

    controller = module.get<FichajeController>(FichajeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
