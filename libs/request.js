
/*
 * @Author: li.lv 
 * @Date: 2017-12-09 14:42:31 
 * @Last Modified by: li.lv
 * @Last Modified time: 2018-04-24 15:28:14
 * @Description: axios相关配置
 */



var axios = require("axios");

// axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
// 请求拦截
axios.interceptors.request.use(function (config) {
    return config;
}, function (error) {
    return Promise.reject(error);
});
// 响应拦截
axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    return Promise.reject(error);
});



module.exports = axios;