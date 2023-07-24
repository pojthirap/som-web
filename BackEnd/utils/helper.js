import Cookies from 'js-cookie'
import * as types from '@redux/types'
import moment from 'moment';


export const getCookie = (cookieName) => {
    return Cookies.get(cookieName);
}
export const setCookie = (cookieName, value) => {
    return Cookies.set(cookieName, value);
}
export const removeCookie = (cookieName) => {
    return Cookies.remove(cookieName);
}

export const removePathValue = (path) => (dispatch) => {
    dispatch({
        type: types.REMOVEPATHVALUE,
        payload: { path: path }
    })
}
export const resetPathValue = (path) => (dispatch) => {
    dispatch({
        type: types.RESETPATHVALUE
    })
}
export const getPathValue = (value, path) => {
    return value[path] ? value[path] : null;
}

export const toString = (value, hyphenWhenEmpty = false, dontReturnZero = true) => {
    if (value == 0 && !dontReturnZero) return "0";
    return value ? value.toString() : (hyphenWhenEmpty ? "-" : null);
}
export const formatDateTH = (date) => {
    return date && moment(date) ? moment(date).add(543, 'years').format('DD/MM/YYYY HH:mm') : "-";
}
export const formatDateTime = (date) => {
    return moment(date).format('DD/MM/YYYY HH:mm');
}
export const formatDate = (date) => {
    return date && moment(date) ? moment(date).add(543, 'years').format('DD/MM/YYYY') : "-";
}

export const getInputData = (myObj, getType = "N") => {
    const getTypeUpper = getType;
    let dataObj = { isInvalid: false, dataSize: 0 };
    if (getTypeUpper == "C") dataObj.isNotChange = true;
    let objKey = []
    if (Array.isArray(myObj.current)) {
        for (let i = 0; i < myObj.current.length; i++) {
            objKey.push(i);
        }
        dataObj.data = [];
    }
    else {
        objKey = Object.keys(myObj.current);
        dataObj.data = {};
    }

    objKey.forEach((key) => {
        if (myObj.current[key]) {
            let item = myObj.current[key].getData()
            if (getTypeUpper == "C") {
                dataObj.isInvalid = dataObj.isInvalid || item.isInvalid;
                dataObj.isNotChange = dataObj.isNotChange && !item.isChange;
                if (item.isChange) {
                    dataObj.data[key] = toString(item.value, false, false);
                    dataObj.dataSize++;
                }

            } else if (getTypeUpper == "NE") {
                dataObj.isInvalid = dataObj.isInvalid || item.isInvalid;
                if (item.value) {
                    dataObj.data[key] = toString(item.value, false, false);
                    dataObj.dataSize++;
                }

            }
            else {
                dataObj.isInvalid = dataObj.isInvalid || item.isInvalid;
                dataObj.data[key] = toString(item.value, false, false);
                dataObj.dataSize++;
            }
        }
    });
    return dataObj;
}

export const clearInputData = (myObj, isNotClearData) => {
    let objKey = []
    if (Array.isArray(myObj.current)) {
        for (let i = 0; i < myObj.current.length; i++) {
            objKey.push(i);
        }
    }
    else {
        objKey = Object.keys(myObj.current);
    }
    objKey.forEach((key) => {
        myObj.current[key].clearValidate();
        if (!isNotClearData) myObj.current[key].clearValue();
    });
}

export const formatObjForSelect = (list, value, label, labelSeparator = " ") => {
    let arr = [];
    if (!(list && label && value)) return arr;
    list.forEach((obj) => {
        let labelValue = ""
        if (Array.isArray(label)) {
            label.forEach((labelKey, index) => {
                if (Array.isArray(labelKey)) {
                    labelValue += (index > 0 ? (labelSeparator ? labelSeparator : " ") : "")
                    labelKey.forEach((innerLabelKey, innerIndex) => {
                        labelValue += (innerIndex > 0 ? " " : "") + obj[innerLabelKey];
                    });
                } else {
                    labelValue += (index > 0 ? (labelSeparator ? labelSeparator : " ") : "") + obj[labelKey];
                }
            });
        } else {
            labelValue = obj[label];
        }
        let valueData = ""
        if (Array.isArray(value)) {
            value.forEach((valueKey, index) => {
                if (Array.isArray(valueKey)) {
                    valueData += (index > 0 ? "|" : "")
                    valueData.forEach((innerValueKey, innerIndex) => {
                        valueData += (innerIndex > 0 ? "|" : "") + obj[innerValueKey];
                    });
                } else {
                    valueData += (index > 0 ? "|" : "") + obj[valueKey];
                }
            });
        } else {
            valueData = obj[value];
        }

        arr.push({ value: toString(valueData, false, false), label: toString(labelValue) });
    });
    return arr;
}

export const formatNumber = (value) => {
    var nf = new Intl.NumberFormat();
    return nf.format(value)
}