"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = __importDefault(require("../../core/build"));
class cloud_main {
    constructor(engine_version, path_input_dir, path_out_dir, cb) {
        this.engine_version = engine_version;
        this.path_input_dir = path_input_dir;
        this.path_out_dir = path_out_dir;
        this.cb = cb;
        new build_1.default(engine_version, path_input_dir, path_out_dir, cb);
    }
}
exports.default = cloud_main;
