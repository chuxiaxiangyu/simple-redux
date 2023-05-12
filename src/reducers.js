function startReducer(state, action) {
    state[action.name] = state[action.name] || null;
    return {...state};
}

function successReducer(state, action) {
    state[action.name] = action.data || null;
    return {...state};
}

function failReducer(state, action) {
    state[action.name] = state[action.name] || null;
    return {...state};
}

export default [startReducer, successReducer, failReducer];