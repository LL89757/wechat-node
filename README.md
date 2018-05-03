# wechat-node-sp
微信API for node.js，目前主要支持小程序及微信支付相关接口

微信小程序官方文档：https://developers.weixin.qq.com/miniprogram/dev/api/

微信支付官方文档：https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=7_7&index=5

## Installation
```
npm install wechat-node-sp
```

## Usage
初始化
```js
var weChatApi = require("wechatapi_node");

var wechatApi = weChatApi({
            appId,
            appSecret,
            mch_id,//微信商户平台ID
            pfx: fs.readFileSync("./apiclient_cert.p12"),//微信商户平台支付正式
            payKey//微信商户平台API秘钥
        })
```
微信登录相关
```js
//微信登录
var result = await wechatApi.login(code);
if (result.status === 200 && !result.data.errcode) {
    var data = {
        openid: result.data.openid,
        session_key: result.data.session_key,
        unionid: result.data.unionid
    }
    console.log(data);
} 
//获取用户信息
var userInfo = await wechatApi.getWechatUserInfo(sessionKey, encryptedData, iv);
console.log(userInfo);
```

获取微信token
```js

var result = await wechatApi.getAccessToken();
if (result.data && !result.data.errcode) {
    var token = result.data.access_token;
    console.log(token);
}

```

微信小程序下单，获取支付参数
```js

var params = {
        body: "支付测试",
        notify_url: "https://PayNotify",
        openid: "openid",
        out_trade_no: "111111111111111111111111",
        spbill_create_ip: "客户端ip",
        total_fee: 1,
        trade_type: "JSAPI",
    };
var result = await wechatApi.getMiniProgramPayParams(params)
console.log(result);

```

退款接口
```js

var params = {
    out_refund_no: "",//退款商户订单号，商户生成
    out_trade_no: "",//需退款订单的商户订单号(二选一)
    transaction_id:""//需退款订单的微信订单号(二选一)
    refund_fee: 1,
    total_fee: 1
}
var result = await wechatApi.refund(params);
console.log(result)
```

查询订单
```js
// 通过商户订单号查
var result = await wechatApi.queryOrder( out_trade_no);

// 通过微信订单号查
var result = await wechatApi.queryOrder(transaction_id);


```

小程序模板推送
```js
var msg={
        "touser": "openId",
        "template_id": "模板id",
        "form_id": "formid",//表单提交场景下，为 submit 事件带上的 formId；支付场景下，为本次支付的 prepay_id
        "page": "pages/test",//点击模板消息跳转页面，可不填
        "data": {
            "keyword1": {
                "value": "推送测试",
                "color": "#173177"
            },
            "keyword2": {
                "value": "推送测试",
                "color": "#173177"
            }
            ...
            }
        }
}
var result = await wechatApi.sendMiniProgramTemplate(token, msg);
console.log(result)

```


### 中间件

商户服务端处理微信的回调（koa为例）
```js
// 支付成功异步回调
router.use('/wxpay/paynotify',async function paynotify(ctx, next){
    //获取微信推送数据
    var result = await wechatApi.getWechatNoticeData(ctx.req);
    //验证消息是否来自微信
    var isWxMessage = await Wechat.WechatAuth(result);
    //通知微信处理结果
    await Wechat.responseSuccess(ctx,"success");//成功
    await Wechat.responseFail(ctx,"fail"); //失败
});

// 退款异步回调
router.use('/wxpay/refundnotify', async function refundnotify(ctx, next){
    var result = await wechatApi.getRefundData(ctx.req);
     //通知微信处理结果
    await Wechat.responseSuccess(ctx,"success");//成功
    await Wechat.responseFail(ctx,"fail"); //失败
});
```
