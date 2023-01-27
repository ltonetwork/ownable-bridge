import * as vm from 'vm';

export default class Contract {
  public readonly state: { [_: string]: any } = {};
  private readonly idb = {};

  constructor(private sandbox: vm.Context) {
    this.sandbox.idb = this.idb;
  }

  private run(call: string, context: { [_: string]: any }): any {
    for (const key in context) {
      this.sandbox[key] = context[key];
    }

    let result: any;

    try {
      vm.runInContext('result = ' + call, this.sandbox);
      result = this.sandbox.result;
    } finally {
      for (const key in context) {
        delete this.sandbox[key];
      }
      delete this.sandbox.result;
    }

    return result;
  }

  async init(buffer: Buffer): Promise<void> {
    await this.run(
      'new Promise(resolve => { contract.initSync(buffer); resolve(); })',
      { buffer },
    );
  }

  async instantiate(msg: any, info: any) {
    const context = { msg, info };
    return await this.run('contract.instantiate_contract(msg, info)', context);
  }

  async execute(msg: any, info: any, id: string) {
    return await this.run(
      'contract.execute_contract(msg, info, ownable_id, idb)',
      { msg, info, ownable_id: id },
    );
  }

  async query(msg: any) {
    return await this.run('contract.query_contract_state(msg, idb)', { msg });
  }
}
