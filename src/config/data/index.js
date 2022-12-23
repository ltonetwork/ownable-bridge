"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
exports.__esModule = true;
exports.config = exports.schema = void 0;
var schema_1 = require("./schema");
__createBinding(exports, schema_1, "default", "schema");
var development_1 = require("./development");
var development_2 = require("./development");
var development_3 = require("./development");
var development_4 = require("./development");
exports.config = {
    test: development_1["default"],
    development: development_2["default"],
    staging: development_3["default"],
    production: development_4["default"]
};
