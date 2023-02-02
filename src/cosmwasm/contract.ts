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
    this.sandbox.idb = mem;
  }

  private parseState(json: string): { [_: string]: any } {
    const { attributes } = JSON.parse(json) as {
      attributes: Array<{ key: string; value: any }>;
    };

    return Object.fromEntries(attributes.map((attr) => [attr.key, attr.value]));
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
    return this.parseState(result.get('state'));
  }

  async execute(msg: any, info: any): Promise<{ [_: string]: any }> {
    const result: Map<string, any> = await this.run(
      'execute_contract(msg, info, "", idb)',
      { msg, info },
    );

    this.storeState(result.get('mem'));
    return this.parseState(result.get('state'));
  }

  async query(msg: any): Promise<any> {
    const result = await this.run('query_contract_state(msg, idb)', { msg });
    const state = JSON.parse(result.get('state'));
    return JSON.parse(atob(state));
  }
}
