import {stringify} from 'querystring';
import {isEmpty} from 'lodash';

function checkStatus(response) {
    if (response.status === 200) {
        return response;
    }
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
}

export function get(url, params, options = {}) {
    if (!url) {
        return Promise.reject('请输入请求地址');
    }
    let query = '';
    if (!isEmpty(params)) {
        query =
            query.indexOf('?') !== -1
                ? '&' + stringify(params)
                : '?' + stringify(params);
    }
    return new Promise((resolve, reject) => {
        fetch(resolveUrl(`${url}${query}`), {
            ...options,
        })
            .then(checkStatus)
            .then(response => response.json())
            .then(data => {
                resolveData(resolve, reject, data);
            })
            .catch(reject);
    });
}

export function post(url, params, options = {}) {
    if (!url) {
        return Promise.reject('请输入请求地址');
    }
    return new Promise((resolve, reject) => {
        fetch(resolveUrl(url), {
            method: 'POST',
            body: JSON.stringify(params),
            ...options,
        })
            .then(checkStatus)
            .then(response => response.json())
            .then(data => {
                resolveData(resolve, reject, data);
            })
            .catch(() => {
                reject('请求发生错误');
            });
    });
}

function resolveData(resolve, reject, data) {
    switch (data.success) {
        case true:{
            try {
                resolve(JSON.parse(data.data));
            } catch {
                resolve(data.data);
            }
            break;
        }
        default: {
            reject(data.message || '请求发生错误');
        }
    }
}

function resolveUrl(url) {
    if (/^http(s)?/.test(url)) {
        return url;
    }
    return url[0] === '/' ? url : `/${url}`;
}