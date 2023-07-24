import Cookies from 'js-cookie'
import * as types from '@redux/types'
import moment from 'moment';
import 'moment/locale/th';

export const dataMocker = (data = [], size = 0, length = 0, pageNo = 0) => {
    let tmpArr = [];
    const start = length == 0 ? 0 : length * (pageNo - 1);
    const end = start + length < size ? start + length : size;
    for (let i = start; i < end; i++) {
        let tmpObj = {};
        data.forEach((key) => {
            tmpObj[toString(key)] = toString(key) + toString(i + 1);
        })
        tmpArr.push(tmpObj)
    }

    const tmpTableObj = {
        records: tmpArr,
        recordStart: (length * (pageNo - 1)) + 1,
        recordPerPage: length,
        totalRecords: size,
        totalPages: length == 0 ? 1 : Math.ceil(size / length)
    }
    return tmpTableObj
}
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
    return value[path] ? value[path] : {};
}

export const toString = (value, hyphenWhenEmpty = false, dontReturnZero = true) => {
    if (value == 0 && !dontReturnZero) return "0";
    return value ? value.toString() : (hyphenWhenEmpty ? "-" : null);
}
export const formatDateTime = (date) => {
    let dateObj = moment(date);
    let dateStr = dateObj.format('DD/MM') + "/" + toString(dateObj.year() + 543) + " " + dateObj.format('HH:mm');
    return dateStr;
}
export const convertFormatFullDateTime = (date) => {
    let dateObj = moment(date);
    let dateStr = dateObj.format('DD/MM') + "/" + toString(dateObj.year() + 543) + " " + dateObj.format('HH:mm:ss');
    return dateStr;
}
export const formatFullDateTime = (date) => {
    let dateObj = moment(date, 'DD/MM/YYYY HH:mm:ss');
    let dateStr = dateObj.format('DD/MM') + "/" + toString(dateObj.year() + 543) + " " + dateObj.format('HH:mm:ss');
    return dateStr;
}
export const formatDateNotTime = (date) => {
    let dateObj = moment(date);
    let dateStr = dateObj.format('DD/MM') + "/" + toString(dateObj.year() + 543);
    return dateStr;
}
export const formatDate = (date, format) => {
    let dateObj = moment(date, format);
    let dateStr = dateObj.format('DD/MM') + "/" + toString(dateObj.year() + 543);
    return dateStr;
}
export const formatFullDate = (date) => {
    let dateObj = moment(date);
    let dateStr = dateObj.format('D MMMM') + " " + toString(dateObj.year() + 543);
    return dateStr;
}
export const formatFullDateWithDateStr = (date) => {
    let dateObj = moment(date);
    let dateStr = dateObj.format('วันddddที่ D MMMM') + " " + toString(dateObj.year() + 543);
    return dateStr;
}

export const formatBytes = (data, decimals = 2) => {

    const bytes = data ? Number(data) : 0;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
export const changeArray = (arrayData, index, data) => {
    let array = [...arrayData];
    array[index] = data;
    return array;
}

export const getInputData = (myObj, getType = "N") => {
    const getTypeUpper = getType;
    let dataObj = { isInvalid: false, dataSize: 0, isNotChange: true };
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
            let item = myObj.current[key].getData(getType)
            dataObj.isNotChange = dataObj.isNotChange && !item.isChange;
            if (getTypeUpper == "C") {
                dataObj.isInvalid = dataObj.isInvalid || item.isInvalid;
                dataObj.data[key] = item.value;
                dataObj.dataSize++;
                if (item.isChange) {
                    if (!dataObj.changeField) dataObj.changeField = item.label
                    else dataObj.changeField += ", " + item.label
                }
            } else if (getTypeUpper == "NE") {
                dataObj.isInvalid = dataObj.isInvalid || item.isInvalid;
                if (item.value) {
                    dataObj.data[key] = item.value;
                    dataObj.dataSize++;
                }
            } else if (getTypeUpper == "NV") {
                dataObj.data[key] = item.value;
                dataObj.dataSize++;
            }
            else {
                dataObj.isInvalid = dataObj.isInvalid || item.isInvalid;
                dataObj.data[key] = item.value;
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
        if (myObj.current[key].clearValidate instanceof Function) myObj.current[key].clearValidate();
        if (!isNotClearData && myObj.current[key].clearValue) myObj.current[key].clearValue();
    });
}

export const formatObjForSelect = (list, value, label, labelSeparator = " ", pickData = null) => {
    let arr = [];
    if (!(list && label && value)) return arr;
    list.forEach((obj) => {
        let labelValue = ""
        if (Array.isArray(label)) {
            label.forEach((labelKey, index) => {
                if (Array.isArray(labelKey) && labelKey.length == 2 && pickData == index) {
                    labelValue += (index > 0 ? (labelSeparator ? labelSeparator : " ") : "") + (obj[labelKey[0]] ? obj[labelKey[0]] : obj[labelKey[1]])
                }else if (Array.isArray(labelKey)) {
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