import crypto from 'crypto';
import * as base58 from 'bs58';

// sh256 multihash, compatible with IPFS
export default function multihash(data: crypto.BinaryLike): string {
  const hashSum = crypto.createHash('sha256');
  hashSum.update(data);
  const hash = hashSum.digest();

  return base58.encode(new Uint8Array([0x12, hash.length, ...hash]));
}
