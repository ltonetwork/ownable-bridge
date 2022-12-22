export default {
  env: {
    doc: 'The application environment.',
    format: ['production', 'staging', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    doc: 'The port the application runs on',
    default: 80,
    env: 'PORT',
  },
  lto: {
    node: {
      default: 'https://testnet.lto.network',
      env: 'LTO_NODE',
    },
  },
  eth: {
    seed: {
      default: '',
      env: 'ETH_SEED',
    },
  },
  infura: {
    key: {
      default: '',
      env: 'INFURA_KEY',
    },
  },
  log: {
    level: {
      default: '',
      env: 'LOG_LEVEL',
    },
  },
  ssl: {
    enabled: {
      default: false,
      env: 'SSL_ENABLED',
    },
  },
};
