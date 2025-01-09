"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../core/config/config"));
const cache_1 = __importDefault(require("./cache"));
const build_1 = __importDefault(require("../../core/build"));
const path_1 = __importDefault(require("path"));
class cocos_main {
    constructor(s_version, s_input_dir, cb) {
        this.s_version = s_version;
        this.s_input_dir = s_input_dir;
        this.cb = cb;
        config_1.default.is_obfuscator = cache_1.default.get().enable_obfuscator;
        const path_out_dir = path_1.default.join(s_input_dir, "../", "super-html");
        new build_1.default(s_version, s_input_dir, path_out_dir, cb);
    }
}
exports.default = cocos_main;
