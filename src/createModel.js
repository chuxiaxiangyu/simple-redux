import {get, post} from './request';
import store from './store';

const reducerIndex = {
    start: 0,
    success: 1,
    fail: 2,
};

function createModel(model) {
    const namespace = model.namespace;
    delete model.namespace;
    let actions = [];
    let reducers = {
        asyncReducers: {},
        syncReducers: {},
    };
    Object.keys(model).forEach(name => {
        const {asyncOptions, syncOptions, initialValue} = model[name];
        // 动态注入reducer
        store.injectReducer(namespace, (state, action) => {
            if (action.type === `${namespace}.${name}.init`) {
                if (!state[name] && action.initialValue !== undefined) {
                    state[name] = action.initialValue;
                }
            }
            return {...state};
        });
        // 设置初始值
        store.dispatch({type: `${namespace}.${name}.init`, initialValue});
        if (Array.isArray(asyncOptions)) {
            const {_actions, _reducers} = resolveAsyncOptions(namespace, name, asyncOptions);
            actions = [...actions, ..._actions];
            reducers.asyncReducers = {
                ...reducers.asyncReducers,
                ..._reducers,
            };
        }
        if (Array.isArray(syncOptions)) {
            const {_actions, _reducers} = resolveSyncOptions(namespace, name, syncOptions);
            actions = [...actions, ..._actions];
            reducers.syncReducers = {
                ...reducers.syncReducers,
                ..._reducers,
            };
        }
    });
    // 动态注入reducer
    store.injectReducer(namespace, (state, action) => {
        if (action.type in reducers.asyncReducers) {
            return reducers.asyncReducers[action.type][reducerIndex[action.status]](state, action);
        }
        if (action.type in reducers.syncReducers) {
            return reducers.syncReducers[action.type](state, action);
        }
        return {...state};
    });
    return actions;
}

function resolveRequest(request) {
    if (request.method && request.method.toLowerCase() === 'post') {
        return post(request.url, request.params);
    }
    return get(request.url, request.params);
}

/**
 * 解析异步事件
 * @param namespace
 * @param name
 * @param asyncOptions
 * @returns {{_actions: [], _reducers: {}}}
 */
function resolveAsyncOptions(namespace, name, asyncOptions) {
    const _actions = [];
    const _reducers = {};
    asyncOptions.forEach(asyncOption => {
        const {reducers} = asyncOption;
        delete asyncOption.reducers;
        const actionName = Object.keys(asyncOption)[0];
        if (!Array.isArray(reducers) || reducers.length !== 3) {
            throw new Error(`请正确填写reducers，${namespace}-${name}`);
        } else {
            _reducers[`${namespace}.${name}.${actionName}`] = reducers;
        }
        // 处理action
        _actions.push({
            [actionName]: (...rest) => (dispatch) => {
                const result = asyncOption[actionName](...rest);
                dispatch({type: `${namespace}.${name}.${actionName}`, name, status: 'start'});
                resolveRequest(result)
                    .then((data) => {
                        result.success && result.success(data);
                        dispatch({type: `${namespace}.${name}.${actionName}`, name, data, status: 'success'});
                    })
                    .catch(err => {
                        result.fail && result.fail(err);
                        dispatch({type: `${namespace}.${name}.${actionName}`, name, data: err, status: 'fail'});
                    });
            },
        });
    });
    return {
        _actions,
        _reducers,
    };
}

/**
 * 解析同步事件
 * @param namespace
 * @param name
 * @param syncOptions
 * @returns {{_actions: [], _reducers: {}}}
 */
function resolveSyncOptions(namespace, name, syncOptions) {
    const _actions = [];
    const _reducers = {};
    syncOptions.forEach(syncOption => {
        const {reducer} = syncOption;
        delete syncOption.reducer;
        const actionName = Object.keys(syncOption)[0];
        if (!reducer) {
            throw new Error(`请正确填写reducer，${namespace}-${name}`);
        } else {
            _reducers[`${namespace}.${name}.${actionName}`] = reducer;
        }
        _actions.push({
            [actionName]: (...rest) => (dispatch) => {
                const params = syncOption[actionName](...rest);
                dispatch({type: `${namespace}.${name}.${actionName}`, params});
            },
        });
    });

    return {
        _actions,
        _reducers,
    };
}

export default createModel;