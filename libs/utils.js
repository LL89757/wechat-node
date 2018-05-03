/*
 * @Author: li.lv 
 * @Date: 2018-04-12 15:00:21 
 * @Last Modified by: li.lv
 * @Last Modified time: 2018-05-03 14:26:42
 * @Description: 通用工具方法 
 */

const crypto = require('crypto');
const xml2js = require("xml2js");


var utils = {
    guid: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    //获取随机字符串
    getNonceStr: function () {
        return this.guid().replace(/-/g, "");
    },
    //MD5加密
    md5Encrypt: function (str) {
        var md5 = crypto.createHash("md5");
        md5.update(str);
        var str = md5.digest('hex');
        var s = str.toUpperCase();
        return s;
    },
    //json转xml
    toXml: function (json) {
        const builder = new xml2js.Builder(),
            xml = builder.buildObject(json);
        return xml;
    },
    //xml转json
    parseXml: async function (xml, fn) {
        return new Promise(function (resolve, reject) {
            const parser = new xml2js.Parser({
                trim: true,
                explicitArray: false,
                explicitRoot: false
            });
            parser.parseString(xml, fn || function (err, result) {
                var obj = {
                    err: err,
                    result: result
                }
                if (!err) {
                    resolve(result);
                } else {
                    resolve(err);
                }
            });
            return parser;
        })
    },
    //获取签名
    getSign: function (param, payKey) {
        var signStr = Object.keys(param).filter(function (key) {
            return param[key] !== undefined && param[key] !== "" && ["sign"].indexOf(key) < 0;
        }).sort().map(function (key) {
            return key + "=" + param[key];
        }).join("&");
        signStr += "&key=" + payKey;
        return this.md5Encrypt(signStr);
    },
    //获取退款通知加密信息
    getRefundData: function (encryptdata) {
        var result,
            decipher,
            cryptkey = utils.md5Encrypt(this.payKey).toLowerCase();
        encryptdata = new Buffer(encryptdata, 'base64').toString('hex');
        decipher = crypto.createDecipheriv('aes-256-ecb', cryptkey, '');
        result = decipher.update(encryptdata, 'hex', 'utf8');
        result += decipher.final('utf8');
        return result;
    },
    //获取微信推送数据
    getWechatData: async function (req) {
        return new Promise(function (resolve, reject) {
            var data = "";
            req.on("data", function (res) {
                data += res;
                resolve(data);
            })
            // ctx.req.on("end", async function () {
            //     resolve(data);
            // })
        })
    },
    assign: function () {
        var model = arguments[0];
        if (arguments.length == 1) {
            return model;
        }
        for (var i = 1, l = arguments.length; i < l; i++) {
            for (var key in arguments[i]) {
                model[key] = arguments[i][key];
            }
        }
        return model;
    }


}


module.exports = utils;