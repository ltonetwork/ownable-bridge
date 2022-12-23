"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var crypto_1 = require("crypto");
var base58 = require("bs58");
// sh256 multihash, compatible with IPFS
function multihash(data) {
    var hashSum = crypto_1["default"].createHash('sha256');
    hashSum.update(data);
    var hash = hashSum.digest();
    return base58.encode(new Uint8Array(__spreadArray([0x12, hash.length], hash, true)));
}
exports["default"] = multihash;
