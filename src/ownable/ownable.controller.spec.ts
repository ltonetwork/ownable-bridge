import { Test, TestingModule } from '@nestjs/testing';
import { OwnableController } from './ownable.controller';

describe('OwnableController', () => {
  let controller: OwnableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OwnableController],
    }).compile();

    controller = module.get<OwnableController>(OwnableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
