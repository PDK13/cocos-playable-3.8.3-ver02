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
const config_1 = __importDefault(require("../config/config"));
const utils_1 = __importDefault(require("../common/utils"));
const platform_1 = __importDefault(require("../common/platform"));
const jszip = __importStar(require("jszip"));
const clean_css = require("clean-css");
const cheerio = __importStar(require("cheerio"));
class res_handler {
    // 读取html
    create_html() {
        const s_dir_path = config_1.default.s_input_dir;
        const s_html_path = platform_1.default.join(s_dir_path, "index.html");
        // html
        let s_html_content = platform_1.default.read_file_toString(s_html_path);
        //获得title
        config_1.default.d_hot.s_title = this._get_title(s_html_content);
        //替换css
        s_html_content = this._replace_css(s_html_content);
        //替换 脚本
        s_html_content = this._replace_script(s_html_content);
        //删除无用
        s_html_content = this._remove_html(s_html_content);
        config_1.default.d_hot.s_base_html_content = s_html_content;
    }
    _get_title(s_html_content) {
        const $ = cheerio.load(s_html_content);
        var title = $('title').text();
        title = title.replace("Cocos Creator | ", "");
        return title || "";
    }
    _remove_html(s_html_content) {
        const $ = cheerio.load(s_html_content);
        $('link[rel="icon"]').each((index, element) => {
            $(element).remove();
        });
        s_html_content = $.html();
        //删除注释
        s_html_content = s_html_content.replace(/ *<!--.*-->/g, "");
        //正则删除空行 
        s_html_content = s_html_content.replace(/^\s*\n/gm, '');
        return s_html_content;
    }
    _replace_css(s_html_content) {
        const s_dir_path = config_1.default.s_input_dir;
        const $ = cheerio.load(s_html_content);
        $('link[rel="stylesheet"]').each((index, element) => {
            const href = $(element).attr('href');
            if (href) {
                const s_file_path = platform_1.default.join(s_dir_path, href);
                let s_content = platform_1.default.read_file_toString(s_file_path);
                //提取html中的css文件
                var reg = /url\((.*)\)/;
                try {
                    const list = reg.exec(s_content);
                    if (list && list[1]) {
                        const trim = list[1].trim();
                        const s_url_path = platform_1.default.join(s_dir_path, trim);
                        const base64 = platform_1.default.read_file_base64(s_url_path);
                        config_1.default.d_hot.set_filter_file.add(s_url_path);
                        s_content = s_content.replace(trim, base64);
                    }
                }
                catch (error) {
                    utils_1.default.log("no find css", error);
                }
                if (config_1.default.is_min_css) {
                    s_content = new clean_css().minify(s_content).styles;
                }
                $('head').append(`<style>${s_content}</style>\n`);
                config_1.default.d_hot.set_filter_file.add(s_file_path);
                $(element).remove();
            }
        });
        return $.html();
    }
    _replace_script(s_html_content) {
        const $ = cheerio.load(s_html_content);
        const s_dir_path = config_1.default.s_input_dir;
        $('script').each((index, element) => {
            if (!$(element).attr("super-html")) {
                const src = $(element).attr('src');
                if (src) {
                    const s_file_path = platform_1.default.join(s_dir_path, src);
                    let s_content = this.read_js(s_file_path);
                    let s_type = $(element).attr("type") || "";
                    if (s_type && s_file_path.endsWith(".json")) {
                        // 34x 版本需要注入一个json
                        s_type = `type="${s_type}"`;
                        //转义一下，压缩
                        s_content = JSON.stringify(JSON.parse(s_content));
                        $('body').append(`<script ${s_type}>${s_content}</script>\n`);
                        config_1.default.d_hot.set_filter_file.add(s_file_path);
                    }
                    else {
                        config_1.default.d_hot.l_pre_load_script.push(src);
                    }
                }
                // script 标签直接内容是脚本的，是启动脚本，在各个引擎中单独处理了
                $(element).remove();
            }
        });
        return $.html();
    }
    // 提取需要注入到html的文本
    extract_inject_html(s_content, reg) {
        const matches = s_content.match(reg);
        if (matches && matches.length > 0) {
            if (config_1.default.d_hot.s_unity_inject_html) {
                //如果已经存在，进行换行
                config_1.default.d_hot.s_unity_inject_html += "\n";
            }
            config_1.default.d_hot.s_unity_inject_html += `<!-- ${matches[0]} -->`;
        }
    }
    /** 计算压缩率 */
    create_res_cache() {
        const s_input_dir = config_1.default.s_input_dir;
        const l_path = platform_1.default.get_dir_all_file_ext(s_input_dir, config_1.default.constants.pack_filter_extname_set, false);
        let d_res_cache = {};
        for (let i = 0; i < l_path.length; i++) {
            let s_file_path = l_path[i];
            //如果存在wasm文件，中断打包并报错
            if (s_file_path.endsWith(".wasm")) {
                let s_err = "---- super-html error ----";
                s_err += ("\n error file : " + s_file_path);
                s_err += "\n zh : 发现wasm文件, 请使用引擎>=3.8.3版本，构建面板选择AsmJS";
                s_err += "\n en : Discovered wasm file, please use an engine version >=3.8.3, and select AsmJS in the build panel.";
                s_err += "\n---- super-html error ----";
                console.error(s_err);
                throw new Error("Wasm files are not supported ");
            }
            if (config_1.default.d_hot.set_filter_file.has(s_file_path)) {
                continue;
            }
            s_file_path = s_file_path.replace(/\\/g, "/");
            // 注意,存储时删除BASE_PATH前置
            let s_relative_path = s_file_path.replace(new RegExp(`[.]*${s_input_dir}/`), "");
            let s_value = "";
            if (platform_1.default.extname(s_file_path) == ".js") {
                s_value = this.read_js(s_file_path);
                // unity 需要提取 商店地址 回想了一下，有可能寄了
                //const google_play = "https://play.google.com/store/apps/details?id=com.unity3d.auicreativetestapp";
                //const appstore = "https://apps.apple.com/us/app/ad-testing/id1463016906";
                this.extract_inject_html(s_value, /https:\/\/play.google.com\/store\/apps[a-zA-Z0-9.\/?=\-_]*/);
                this.extract_inject_html(s_value, /https:\/\/apps.apple.com\/[a-zA-Z0-9.\/=\-_]*/);
            }
            else if (config_1.default.constants.string_type_extname_set.has(platform_1.default.extname(s_file_path))) {
                s_value = platform_1.default.read_file_toString(s_file_path);
            }
            else {
                s_value = platform_1.default.read_file_base64(s_file_path);
            }
            d_res_cache[s_relative_path] = s_value;
        }
        config_1.default.d_hot.d_res_cache = d_res_cache;
    }
    /** 将js文件转化为html文件内容(包括压缩过程) */
    read_js(s_file_path) {
        let js = platform_1.default.read_file_toString(s_file_path);
        if (!s_file_path.endsWith(".js")) {
            return js;
        }
        while (true) {
            if (config_1.default.version == "34x") {
                //如果是项目自己去请求资源等，不做替换
                if (s_file_path.indexOf("bundle.js") == -1) {
                    js = js.replace(/new XMLHttpRequest/g, "new _XMLLocalRequest");
                }
                js = js.replace(/[A-Za-z$0-9]*\.createElement\(['"]script['"]\)/g, "_createLocalJSElement()");
                js = js.replace(/new URL/g, "new _SUPER_URL");
            }
            if (js.length > 1024 * 500) {
                break;
            }
            if (s_file_path.indexOf("min.js") != -1) {
                break;
            }
            if (config_1.default.is_obfuscator) {
                // 已知 polyfills.bundle.js 中有 <\/script> 会被混淆成 </script> 造成在html中识别成占位符，html无法运行
                if (js.indexOf("/script>") == -1) {
                    utils_1.default.debug("obfuscator", s_file_path, js.length);
                    js = utils_1.default.obfuscate(js);
                }
                else {
                    utils_1.default.debug("skip obfuscator", s_file_path, js.length);
                }
            }
            else {
                if (config_1.default.is_min_js) {
                    const i_len = js.length;
                    js = utils_1.default.min_script(js);
                    utils_1.default.debug("minify", s_file_path, js.length, i_len);
                }
            }
            break;
        }
        return js;
    }
    /** 计算压缩率 */
    async call_zip_ratio() {
        const d_hot = config_1.default.d_hot;
        return new Promise((resolve, reject) => {
            let i_task = 0;
            const d_res_mapping = d_hot.d_res_cache;
            for (let s_relative_path in d_res_mapping) {
                i_task++;
                var zips = new jszip.default();
                const s_value = d_res_mapping[s_relative_path];
                zips.file(s_relative_path, s_value, { compression: "DEFLATE" });
                zips.generateAsync({ type: "nodebuffer" }).then((content) => {
                    let str_base64 = Buffer.from(content).toString("base64");
                    let ratio = Number((str_base64.length / s_value.length).toFixed(2));
                    d_hot.d_res_zip_ratio[s_relative_path] = {
                        key: s_relative_path,
                        ratio: ratio,
                        org_size: s_value.length,
                        zip_size: str_base64.length,
                        cut_size: s_value.length - str_base64.length,
                        enable_zip: ratio < 1,
                        value: s_value
                    };
                    i_task--;
                    if (i_task <= 0) {
                        resolve({});
                    }
                });
            }
            ;
        });
    }
    // 生成处理好的资源
    async build_res() {
        const d_hot = config_1.default.d_hot;
        await new Promise(async (resolve, reject) => {
            var zips = new jszip.default();
            const d_res_mapping = d_hot.d_res_cache;
            for (let s_relative_path in d_res_mapping) {
                const s_value = d_res_mapping[s_relative_path];
                const data = d_hot.d_res_zip_ratio[s_relative_path];
                if (!data.enable_zip) {
                    d_hot.d_out_res_no_zip[s_relative_path] = s_value;
                }
                else {
                    await zips.file(s_relative_path, s_value, { compression: "DEFLATE" });
                }
            }
            ;
            if (Object.keys(zips.files).length) {
                zips.generateAsync({ type: "nodebuffer" }).then((content) => {
                    let str_base64 = Buffer.from(content).toString("base64");
                    d_hot.s_out_res_zip_base64 = str_base64;
                    resolve({});
                });
            }
            else {
                resolve({});
            }
        });
    }
}
exports.default = new res_handler();
