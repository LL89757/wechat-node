/*
 * @Author: li.lv 
 * @Date: 2017-12-29 17:01:39 
 * @Last Modified by: li.lv
 * @Last Modified time: 2018-04-24 16:02:46
 * @Description: 微信接口 
 */

const axios = require("./request");
const config = require("./config");
const https = require('https');

const commonBaseUrl = config.apiUrl.wechat,
    payBaseUrl = config.apiUrl.wechatPay;

const wechatService = {
    getToken: async function (appId, appSecret) {
        return axios.get(`${commonBaseUrl}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`);
    },
    getMiniProgramQrcode: async function (token, data) {
        return axios({
            method: "post",
            url: `${commonBaseUrl}/wxa/getwxacodeunlimit?access_token=${token}`,
            data: JSON.stringify(data),
            responseType: "arraybuffer"
        });
    },
    sendMiniProgramTemplate: function (token, data) {
        return axios.post(`${commonBaseUrl}/cgi-bin/message/wxopen/template/send?access_token=${token}`, data);
    },
    sendWechatTemplate: function (token, data) {
        return axios.post(`${commonBaseUrl}/cgi-bin/message/template/send?access_token=${token}`, data);
    },
    unifiedorder: function (xml) {
        return axios.post(`${payBaseUrl}/pay/unifiedorder`, xml);
    },
    refund: function (agentOptions, xml) {
        //SSL协议请求
        return axios({
            method: 'post',
            url: `${payBaseUrl}/secapi/pay/refund`,
            data: xml,
            httpsAgent: new https.Agent(agentOptions),
        })
    },
    login: async function (code, appId, appSecret) {
        return axios.get(`${commonBaseUrl}/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`);
    },
    queryOrder: function (xml) {
        return axios.post(`${payBaseUrl}/pay/orderquery`, xml);
    }

}


module.exports = wechatService;