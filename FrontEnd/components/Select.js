import { useState, useImperativeHandle, forwardRef, useEffect } from "react"
import * as msg from '@msg'
import Select, { components, createFilter } from 'react-select'
import CustomSelectOption from "./CustomSelectOption";
const NoOptionsMessage = props => {
    return (
        <components.NoOptionsMessage {...props}>
            <span className="custom-css-class">{msg.selectNoData}</span>
        </components.NoOptionsMessage>
    );
};
function Main(props, ref) {
    const {
        label,
        disabled,
        placeholder,
        require = false,
        options = [],
        onChange,
        onInit,
        defaultValue = null,
        hideEmptyOption,
        menuPlacement = "auto",
        hideLabel = false,
        shadowBorder = false,
        borderLess = false,
        hideClearBtn = false
    } = props;
    const defaultData = require || hideEmptyOption ? [] : [{ label: placeholder || msg.pleaseSelect, value: "" }]
    const [value, setValue] = useState(defaultValue);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setEerrorMessage] = useState("");

    useEffect(() => {
        setValue(defaultValue)
        if (onInit instanceof Function) {
            onInit(defaultValue)
        }
    }, [defaultValue])

    useImperativeHandle(ref, () => ({
        getData(validateType = "N") {
            const foundInOption = options.filter(option => option.value == value).length > 0;
            return { isInvalid: validate((foundInOption ? value : null), validateType), value: value ? value : "", isChange: isChange(), label: label };
        },
        clearValue() {
            setValue(defaultValue);
            if (onChange instanceof Function) {
                onChange(defaultValue)
            }
        },
        setData(data) {
            setValue(data)
        },
        clearToEmpty() {
            setValue(null);
        },
        clearValidate() {
            setIsError(false);
            setEerrorMessage("");
        }

    }));

    function isChange() {
        return value != defaultValue;
    }

    function RequireLabel() {
        if (!require) return null;
        return (<span style={{ color: "red" }}> *</span>);
    }
    function validate(text, validateType = "N") {
        let isEr = false;
        let erMsg = "";
        if (require && (!text || text.length === 0)) {
            isEr = true;
            erMsg = msg.pleaseSelect + label;
        }
        if (validateType != "NV") {
            setIsError(isEr);
            setEerrorMessage(erMsg);
        }
        return isEr;
    }

    function handleOnChange(obj) {
        const tmpValue = obj && obj.value ? obj.value : null;
        setValue(tmpValue);
        validate(tmpValue)
        if (onChange instanceof Function) {
            onChange(tmpValue)
        }
    }
    return (
        <div>
            {label && !hideLabel ? <div className={"primaryLebel" + (shadowBorder ? " selectShadow" : "")}>{label}<RequireLabel /></div> : null}
            <Select
                filterOption={createFilter({ ignoreAccents: false })}
                placeholder={placeholder || msg.pleaseSelect}
                isDisabled={disabled}
                classNamePrefix="react-select"
                className={"react-select-container" + (isError ? " selectError" : "") + (shadowBorder ? " selectShadow" : "") + (borderLess ? " borderLess" : "")}
                options={options}
                onChange={e => handleOnChange(e)}
                value={options.filter(option => option.value == value)}
                menuPlacement={menuPlacement}
                components={{NoOptionsMessage, Option: CustomSelectOption }}
                isClearable={!hideClearBtn}
            />
            {isError ? <span className="textError">{errorMessage}</span> : null}
        </div>
    )
}
export default forwardRef(Main);