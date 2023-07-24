import { combineReducers } from 'redux'
import * as types from '@redux/types'

// PATHVALUE REDUCER
const pathValueReducer = (state = {}, { type, payload = { path: null, value: null } }) => {
    switch (type) {
        case types.SETPATHVALUE:
            return { ...state, ...{ [payload.path]: payload.value } }
        case types.REMOVEPATHVALUE:
            return state[payload.path] ? delete state[payload.path] : state;
        case types.RESETPATHVALUE:
            return {};
        default:
            return state
    }
}
// USERPROFILE REDUCER
const userProfileReducer = (state = {}, { type, payload = null }) => {
    switch (type) {
        case types.SETUSERPROFILE:
            return payload
        case types.RESETUSERPROFILE:
            return {};
        default:
            return state
    }
}
// PERMLIST REDUCER
const permListReducer = (state = [], { type, payload = [] }) => {
    switch (type) {
        case types.SETPERMLIST:
            return payload
        case types.RESETPERMLIST:
            return [];
        default:
            return state
    }
}

// COMBINED REDUCERS
const reducers = {
    pathValue: pathValueReducer,
    userProfile: userProfileReducer,
    permList: permListReducer
}

export default combineReducers(reducers)