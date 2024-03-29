import React, {useEffect} from 'react';
import {connectModel} from '../src';
import userModel from './userModel';

function User({userInfo, getUserInfo}) {
    useEffect(() =>{
        getUserInfo()
            .then(data => {
                console.log(data);
            })
    }, []);

    return (
        <div>{userInfo.username}</div>
    );
}

export default connectModel([userModel], state => ({
    userInfo: state.userModel.userInfo,
}))(User);