import { Test, TestingModule } from '@nestjs/testing';
import { CosmWasmService } from './cosmwasm.service';
import * as assert from 'assert';
import Contract from './contract';

describe('CosmWasmService', () => {
  let service: CosmWasmService;
  let contract: Contract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CosmWasmService],
    }).compile();

    service = module.get<CosmWasmService>(CosmWasmService);
  });

  beforeEach(async () => {
    contract = await service.load(
      __dirname + '/_test/ownable.js',
      __dirname + '/_test/ownable_bg.wasm',
    );
  });

  it('instantiates the smart contract', async () => {
    const result = await contract.instantiate(
      { ownable_id: "88pDRu52FpsU3kKHwdvPV21RMkBqVqNnthjfdCesTHQhLnUpanw49n6b2PzGnEy" },
      { sender: 'some_account', funds: [] },
    );
    assert.equal(result.method, 'instantiate');
    assert.equal(result.owner, 'some_account');
    assert.equal(result.current_amount, '100');

    const state = await contract.query({ get_ownable_config: {} });
    assert.equal(state.owner, 'some_account');
    assert.equal(state.current_amount, '100');
    assert.equal(state.color, result.color);
  });

  it('executes a message on the smart contract', async () => {
    await contract.instantiate(
      { ownable_id: "88pDRu52FpsU3kKHwdvPV21RMkBqVqNnthjfdCesTHQhLnUpanw49n6b2PzGnEy" },
      { sender: 'some_account', funds: [] },
    );

    const result = await contract.execute(
      { consume: { amount: 42 } },
      { sender: 'some_account', funds: [] },
    );
    assert.equal(result.method, 'try_consume');
    assert.equal(result.new_amount, 58);

    const state = await contract.query({ get_ownable_config: {} });
    assert.equal(state.owner, 'some_account');
    assert.equal(state.current_amount, 58);
  });
});
