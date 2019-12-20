/*
 * @Author: li.lv 
 * @Date: 2017-12-11 20:18:06 
 * @Last Modified by: li.lv
 * @Last Modified time: 2019-12-20 15:00:51
 * @Description: 微信通用方法封装库 
 */
const crypto = require("crypto");
const WXBizDataCrypt = require("./WXBizDataCrypt")
const utils = require("../libs/utils");
const wechatService = require("../libs/wechatService");


function Wechat() {
    if (arguments.length <= 0) {
        throw new Error("Wechat初始化参数错误");
        return null;
    }
    if (!(this instanceof Wechat)) {
        return new Wechat(arguments[0]);
    };

    var options = arguments[0];
    this.appId = options.appId;
    this.appSecret = options.appSecret;
    this.mch_id = options.mch_id;
    this.pfx = options.pfx;
    this.payKey = options.payKey;
}

//登录接口
Wechat.prototype.login = async function (code) {
    var result = await wechatService.login(code, this.appId, this.appSecret);
    return result;
}

//获取用户信息
Wechat.prototype.getWechatUserInfo = async function (sessionKey, encryptedData, iv) {
    const pc = new WXBizDataCrypt(this.appId, sessionKey),
        result = pc.decryptData(encryptedData, iv);
    return result;
}

//获取微信token
Wechat.prototype.getAccessToken = async function (code) {
    var result = await wechatService.getToken(this.appId, this.appSecret);
    return result;
}

//发送小程序模板消息
Wechat.prototype.sendMiniProgramTemplate = async function (token, data) {
    var result = await wechatService.sendMiniProgramTemplate(token, data);
    return result;
}

//发送公众号模板消息
Wechat.prototype.sendWechatTemplate = async function (token, data) {
    var result = await wechatService.sendWechatTemplate(token, data);
    return result;
}

//微信下单接口
Wechat.prototype.unifiedOrder = async function (options) {
    var params = utils.assign(options, {
            appid: this.appId,
            mch_id: this.mch_id
        }),
        result,
        xml,
        response;
    params.nonce_str = params.nonce_str || utils.getNonceStr();
    result;
    params.sign = await utils.getSign(params, this.payKey);
    xml = utils.toXml(params);
    response = await wechatService.unifiedorder(xml);
    result = await utils.parseXml(response.data);
    return result;
}


//获取小程序支付参数
Wechat.prototype.getMiniProgramPayParams = async function (options) {
    var result = await this.unifiedOrder(options)

    if (result.return_code != "SUCCESS" || result.result_code != "SUCCESS") {
        return result;
    }
    var payParams = {
        appId: this.appId,
        nonceStr: utils.getNonceStr(),
        package: "prepay_id=" + result.prepay_id,
        signType: "MD5",
        timeStamp: Date.now().toString()
    }
    payParams.paySign = await utils.getSign(payParams,this.payKey);
    return {
        timeStamp: payParams.timeStamp,
        nonceStr: payParams.nonceStr,
        package: payParams.package,
        signType: payParams.signType,
        paySign: payParams.paySign
    };


}


//微信退款接口
Wechat.prototype.refund = async function (options) {

    var params = utils.assign(options, {
            appid: this.appId,
            mch_id: this.mch_id
        }),
        xml,
        response,
        result,
        agentOptions;
    params.nonce_str = params.nonce_str || utils.getNonceStr();
    params.op_user_id = params.op_user_id || this.mch_id;
    params.sign = await utils.getSign(params,this.payKey);
    xml = utils.toXml(params);
    agentOptions = {
        pfx: this.pfx,
        passphrase: this.mch_id,
    };
    response = await wechatService.refund(agentOptions, xml);
    result = await utils.parseXml(response.data);
    return result;
}

//获取微信订单
Wechat.prototype.queryOrder = async function (transaction_id, out_trade_no) {
    var params = {
        appid: this.appId,
        mch_id: this.mch_id,
        out_trade_no: "",
        transaction_id: ""
    }
    params.nonce_str = params.nonce_str || utils.getNonceStr();
    if (transaction_id) {
        params.transaction_id = transaction_id;
    } else {
        params.out_trade_no = out_trade_no;
    }
    params.sign = await utils.getSign(params,this.payKey);
    var xml = utils.toXml(params),
        response = await wechatService.queryOrder(xml),
        result = await utils.parseXml(response.data);
    return result;
}

//判断订单真实性
Wechat.prototype.weChatOrderAuth = async function (transaction_id) {
    var order = await this.queryOrder(transaction_id);
    return order.return_code == "SUCCESS" && order.result_code == "SUCCESS";
}

//验证消息是否来自微信
Wechat.prototype.wechatDataAuth = async function (payData) {
    if (!payData.sign) {
        console.log("WxPayData签名存在但不合法");
        return false;
    }
    var wxSign = payData.sign,
        sign = await utils.getSign(payData,this.payKey);
    if (wxSign === sign) {
        return true;
    } else {
        return false;
    }
}


//获取微信推送通知信息
Wechat.prototype.getWechatNoticeData = async function (req) {
    var result,
        wechatDataXml = await utils.getWechatData(req),
        wechatData = await utils.parseXml(wechatDataXml);
    return result;
}

//获取微信退款通知信息
Wechat.prototype.getRefundData = async function (req) {
    var result,
        wechatData = await this.getWechatNoticeData(req),
        refundDetailXml = utils.getRefundData(wxData.req_info),
        refundData = await utils.parseXml(refundDetailXml);
    return result;
}

//获取小程序二维码
Wechat.prototype.getMiniProgramQrcode = async function (token, data) {
    var result = await wechatService.getMiniProgramQrcode(token, data);
    return result;
}

//通知微信处理成功
Wechat.prototype.responseSuccess = async function ({
    ctx,
    return_msg
}) {
    var responseData = {
        return_code: "SUCCESS",
        return_msg: return_msg
    }
    var responseXml = utils.toXml(responseData);
    ctx.response.type = 'application/xml';
    ctx.body = response;
}

//通知微信处理失败
Wechat.prototype.responseFail = async function ({
    ctx,
    return_msg
}) {
    var responseData = {
        return_code: "FAIL",
        return_msg: return_msg
    }
    var responseXml = utils.toXml(responseData);
    ctx.response.type = 'application/xml';
    ctx.body = response;
}


module.exports = Wechat;