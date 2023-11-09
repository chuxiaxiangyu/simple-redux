import {createModel, presetReducer} from '../src';

export default createModel({
    namespace: 'userModel',
    userInfo: {
        initialValue: {},
        asyncOptions: [
            {
                getUserInfo: () => {
                    return {
                        url: '/user',
                        method: 'get'
                    };
                },
                reducers: presetReducer,
            },
        ],
        syncOptions: [
            {
                setUserInfo: (userInfo) => ({userInfo}),
                reducer: (state, action) => {
                    const {userInfo} = action.params;
                    return {...state, userInfo};
                }
            }
        ],
    },
});