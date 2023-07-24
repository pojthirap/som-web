import { useState, useImperativeHandle, forwardRef, useEffect } from "react"
import * as msg from '@msg'
import Select, { components } from 'react-select'
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
        defaultValue,
        hideEmptyOption,
        menuPlacement = "auto"
    } = props;
    const defaultData = require || hideEmptyOption ? [] : [{ label: placeholder || label || "", value: "" }]
    const dataFilter = options.filter(option => option.value == defaultValue).length === 0 ? "" : defaultValue
    const [value, setValue] = useState(dataFilter);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setEerrorMessage] = useState("");
    useImperativeHandle(ref, () => ({
        getData() {
            return { isInvalid: validate(value), value: value };
        },
        clearValue() {
            setValue("");
        },
        clearValidate() {
            setIsError(false);
            setEerrorMessage("");
        }

    }));

    useEffect(() => {
        setValue(defaultValue)
    }, [defaultValue])

    function RequireLabel() {
        if (!require) return null;
        return (<span style={{ color: "red" }}> *</span>);
    }
    function validate(text) {
        let isEr = false;
        let erMsg = "";
        if (require && (!text || text.length === 0)) {
            isEr = true;
            erMsg = msg.pleaseSelect + label;
        }
        setIsError(isEr);
        setEerrorMessage(erMsg);
        return isEr;
    }

    function handleOnChange(obj) {
        setValue(obj.value);
        validate(obj.value)
        if (onChange instanceof Function) {
            onChange(obj.value)
        }
    }
    return (
        <div>
            {label ? <div className="primaryLebel">{label}<RequireLabel /></div> : null}
            <Select
                placeholder={placeholder || label || ""}
                isDisabled={disabled}
                classNamePrefix="react-select"
                className={"react-select-container" + (isError ? " selectError" : "")}
                options={defaultData.concat(options)}
                onChange={e => handleOnChange(e)}
                value={options.filter(option => option.value == value)}
                menuPlacement={menuPlacement}
                components={{ NoOptionsMessage }}
            />
            {isError ? <span className="textError">{errorMessage}</span> : null}
        </div>
    )
}
export default forwardRef(Main);