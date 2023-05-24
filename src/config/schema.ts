export default {
  env: {
    format: ['production', 'staging', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    default: 80,
    env: 'PORT',
  },
  account: {
    seed: {
      default: '',
      env: 'ACCOUNT_SEED',
    },
  },
  accept: {
    unlockNFT: {
      default: true,
      env: 'UNLOCK_NFT',
    },
    webhook: {
      default: '',
      env: 'ACCEPT_WEBHOOK',
    },
  },
  lto: {
    node: {
      default: 'https://testnet.lto.network',
      env: 'LTO_NODE',
    },
    networkId: {
      default: 'T',
      env: 'LTO_NETWORK_ID',
    },
  },
  eth: {
    providers: {
      etherscan: {
        default: '',
        env: 'ETHERSCAN_KEY',
      },
      infura: {
        default: '',
        env: 'INFURA_KEY',
      },
      alchemy: {
        default: '',
        env: 'ALCHEMY_KEY',
      },
      pocket: {
        default: '',
        env: 'POCKET_KEY',
      },
      ankr: {
        default: '',
        env: 'ANKR_KEY',
      },
    },
    networks: {
      default: [
        {
          id: 5,
          name: 'goerli',
          provider: 'infura' as 'jsonrpc' | 'etherscan' | 'infura' | 'alchemy' | 'cloudflare' | 'pocket' | 'ankr',
          url: '',
        },
      ],
      format: 'typed-array',
      children: {
        id: {
          default: 0,
        },
        name: {
          default: '',
        },
        provider: {
          format: ['jsonrpc', 'etherscan', 'infura', 'alchemy', 'cloudflare', 'pocket', 'ankr'],
          default: 'jsonrpc',
        },
        url: {
          default: '',
        },
      },
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
  ipfs: {
    start: {
      default: true,
      env: 'IPFS_START',
    },
  },
  path: {
    packages: {
      default: 'storage/packages',
      env: 'PACKAGES_PATH',
    },
    chains: {
      default: 'storage/chains',
      env: 'CHAINS_PATH',
    },
  },
  verify: {
    integrity: {
      default: true,
      env: 'VERIFY_INTEGRITY',
    },
    signer: {
      default: true,
      env: 'VERIFY_SIGNER',
    },
    chainId: {
      default: true,
      env: 'VERIFY_CHAIN_ID',
    },
  },
};
