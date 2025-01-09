"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hot_data = void 0;
class hot_data {
    constructor() {
        // 网页title
        this.s_title = "";
        // html基础的数据
        this.s_base_html_content = "";
        // 过滤的文件
        this.set_filter_file = new Set();
        //资源缓存(全部不压缩可使用这一份)
        this.d_res_cache = {};
        //资源压缩率
        this.d_res_zip_ratio = {};
        //以下两份在输出zip的时候都要输出
        //不压缩的资源
        this.d_out_res_no_zip = {};
        //压缩并且转成base64的输出资源
        this.s_out_res_zip_base64 = "";
        // 需要提前依赖的脚本名
        this.l_pre_load_script = [];
        // 需要额外注入到 html 中（一般是为了通过机器扫描）
        this.s_unity_inject_html = "";
    }
}
exports.hot_data = hot_data;
class config {
    constructor() {
        this.version = "24x";
        //输入的目录
        this.s_input_dir = "";
        //输出的目录
        this.s_out_dir = "";
        // debug
        this.is_debug = false;
        // 混淆
        this.is_obfuscator = true;
        // 最小化css
        this.is_min_css = true;
        // 最小化代码
        this.is_min_js = true;
        this.constants = new class {
            constructor() {
                this.package_name = "super-html";
                // 注入jszip库
                this.inject_jszip_script = "jszip.js";
                // 注入通用脚本
                this.inject_common_script = "common.js";
                // 注入版本适配相关
                this.inject_version_adapter = {
                    "24x": "cocos/24x.js",
                    "34x": "cocos/34x.js"
                };
                // 需要使用string编码的资源后缀
                this.string_type_extname_set = new Set([
                    '.txt',
                    '.xml',
                    '.vsh',
                    '.fsh',
                    '.atlas',
                    '.tmx',
                    '.tsx',
                    '.json',
                    '.ExportJson',
                    '.plist',
                    '.fnt',
                    '.js',
                    ".zip"
                ]);
                // 打包，过滤的文件格式
                this.pack_filter_extname_set = new Set([
                    ".ico",
                    ".html",
                    ".css",
                ]);
            }
        };
        // 注入渠道适配相关
        this.inject_channel_adapter = [
            {
                s_name: "common",
                b_enable: true,
            },
            {
                s_name: "common_min",
                b_html_compression: true,
                b_enable: true,
            },
            {
                s_name: "applovin",
                b_enable: true,
                b_html_compression: true,
            },
            {
                s_name: "ironsource",
                b_enable: true,
                b_html_compression: true,
            },
            {
                s_name: "mintegral",
                b_enable: true,
                b_html_compression: false,
                b_out_zip: true,
            },
            {
                s_name: "unity",
                b_enable: true,
                b_html_compression: true,
            },
            {
                s_name: "google",
                b_enable: true,
                b_html_compression: true,
                b_out_zip: true,
            },
            {
                s_name: "google",
                s_config_name: "google_portrait",
                b_enable: true,
                b_html_compression: true,
                b_out_zip: true,
                s_zip_name: "portrait",
            },
            {
                s_name: "google",
                s_config_name: "google_landscape",
                b_enable: true,
                b_html_compression: true,
                b_out_zip: true,
                s_zip_name: "landscape",
            },
            {
                s_name: "facebook",
                s_config_name: "facebook",
                b_enable: true,
                b_html_compression: true,
            },
            {
                s_name: "facebook",
                s_config_name: "facebook",
                b_enable: true,
                b_html_compression: true,
                b_out_zip: true,
                b_split_res: true
            },
            {
                s_name: "pangle",
                s_config_name: "pangle",
                b_enable: true,
                b_html_compression: false,
                b_out_zip: true,
            },
            {
                s_name: "pangle",
                s_config_name: "pangle_portrait",
                b_enable: true,
                b_html_compression: false,
                b_out_zip: true,
                s_zip_name: "portrait",
            },
            {
                s_name: "pangle",
                s_config_name: "pangle_landscape",
                b_enable: true,
                b_html_compression: false,
                b_out_zip: true,
                s_zip_name: "landscape",
            },
            {
                s_name: "liftoff",
                b_enable: true,
                b_html_compression: false,
                b_out_zip: true,
            },
            {
                s_name: "moloco",
                b_enable: true,
                b_html_compression: true,
            },
            {
                s_name: "tiktok",
                b_enable: true,
                b_html_compression: false,
                b_out_zip: true,
            },
            {
                s_name: "vungle",
                b_enable: true,
                b_html_compression: false,
                b_out_zip: true,
            },
            {
                s_name: "bigo",
                b_enable: true,
                b_html_compression: false,
                b_out_zip: true,
            },
            {
                s_name: "kwai",
                b_enable: true,
                b_html_compression: false,
                b_out_zip: true,
            },
        ];
        this.d_hot = new hot_data();
    }
}
;
exports.default = new config();
