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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const mimeType = __importStar(require("mime-types"));
class platform {
    /** 读取文件 */
    read_file_toString(filePath) {
        return fs.readFileSync(filePath, { encoding: "utf-8" }).toString();
    }
    read_file_base64(filePath) {
        let data = fs.readFileSync(filePath);
        return `data:${mimeType.lookup(filePath)};base64,${data.toString("base64")}`;
    }
    read_file(filePath) {
        let data = fs.readFileSync(filePath);
        return data;
    }
    /** 获得目录下多种格式文件 */
    get_dir_all_file_ext(s_dir_path, filter_extname_set, b_filter) {
        let files = [];
        let dir_list = fs.readdirSync(s_dir_path);
        dir_list.forEach((file) => {
            let file_path = path_1.default.join(s_dir_path, file);
            if (fs.statSync(file_path).isDirectory()) {
                files = files.concat(this.get_dir_all_file_ext(file_path, filter_extname_set, b_filter));
            }
            else {
                let file_ext = path_1.default.extname(file_path);
                if (b_filter == filter_extname_set.has(file_ext)) {
                    files.push(file_path);
                }
            }
        });
        return files;
    }
    /** 获得目录下文件的后缀名 */
    get_dir_all_file_ext_name(dir) {
        let files = [];
        let dir_list = fs.readdirSync(dir);
        dir_list.forEach((file) => {
            let file_path = path_1.default.join(dir, file);
            if (fs.statSync(file_path).isDirectory()) {
                files = files.concat(this.get_dir_all_file_ext_name(file_path));
            }
            else {
                let file_ext = path_1.default.extname(file_path);
                files.push(file_ext);
            }
        });
        return files;
    }
    // 安全的创建文件夹
    mkdirSync(s_dir_path) {
        // 判断文件夹是否存在
        if (fs.existsSync(s_dir_path)) {
            return;
        }
        // 递归创建父目录
        const s_parent_dir = path_1.default.dirname(s_dir_path);
        if (!fs.existsSync(s_parent_dir)) {
            this.mkdirSync(s_parent_dir);
        }
        // 创建文件夹
        fs.mkdirSync(s_dir_path);
        // console.log(`mkdirSync ${s_dir_path} created successfully.`);
    }
    //安全的写入文件
    writeFileSync(s_path, content) {
        const s_parent_dir = path_1.default.dirname(s_path);
        this.mkdirSync(s_parent_dir);
        fs.writeFileSync(s_path, content);
    }
    /** 获取目录下所有文件 */
    get_dir_all_file(dir) {
        let files = [];
        let dir_list = fs.readdirSync(dir);
        dir_list.forEach((file) => {
            let file_path = path_1.default.join(dir, file);
            if (fs.statSync(file_path).isDirectory()) {
                files = files.concat(this.get_dir_all_file(file_path));
            }
            else {
                files.push(file_path);
            }
        });
        return files;
    }
    join(...p) {
        return path_1.default.join(...p);
    }
    extname(p) {
        return path_1.default.extname(p);
    }
}
exports.default = new platform();
