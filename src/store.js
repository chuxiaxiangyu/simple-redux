import {createStore, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';

function initialReducer(state = {}) {
    return {...state};
}

function configureStore() {
    const store = createStore(createReducer({}), {}, applyMiddleware(thunk));

    store.asyncReducers = {};

    store.injectReducer = (key, asyncReducer) => {
        store.asyncReducers[key] = asyncReducer;
        store.replaceReducer(createReducer(store.asyncReducers));
    };

    // 返回修改后的 store
    return store;
}

export default configureStore();

function createReducer(asyncReducers) {
    return combineReducers({
        initialReducer,
        ...asyncReducers
    });
}