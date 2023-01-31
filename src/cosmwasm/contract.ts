import * as vm from 'vm';

export default class Contract {
  constructor(private sandbox: vm.Context) {
    this.sandbox.idb = [];
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

  private storeState(json: string) {
    const mem = JSON.parse(json);
    this.sandbox.idb = mem['state_dump'];
  }

  async init(buffer: Buffer): Promise<void> {
    await this.run('init(buffer)', { buffer });
  }

  async instantiate(msg: any, info: any): Promise<{ [_: string]: any }> {
    const result: Map<string, any> = await this.run(
      'instantiate_contract(msg, info)',
      { msg, info },
    );

    this.storeState(result.get('mem'));
    return result.get('state');
  }

  async execute(msg: any, info: any): Promise<{ [_: string]: any }> {
    const result: Map<string, any> = await this.run(
      'execute_contract(msg, info, "", idb)',
      { msg, info },
    );

    this.storeState(result.get('mem'));
    return result.get('state');
  }

  async query(msg: any): Promise<{ [_: string]: any }> {
    return await this.run('query_contract_state(msg, idb)', { msg });
  }
}
