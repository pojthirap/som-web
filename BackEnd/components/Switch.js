import { useState, useImperativeHandle, forwardRef, useEffect } from "react"
import Switch from "react-switch";
function Main({
    label,
    labelOnRight,
    labelOnTop = false,
    disabled = false,
    onChange,
    defaultValue = false,
    returnYAndN = false,
    returnNullWhenN = false
}, ref) {
    const [value, setValue] = useState(defaultValue);
    useEffect(() => {
        setValue(defaultValue)
    }, [defaultValue])
    useImperativeHandle(ref, () => ({
        getData() {
            let returnValue = value;
            if (returnYAndN) returnValue = value ? "Y" : "N"
            if (returnNullWhenN) returnValue = value ? "Y" : null
            return { isInvalid: false, value: returnValue };
        },
        clearValue() {
            setValue(defaultValue);
        },
        clearValidate() {
        }

    }));

    function handleOnChange(value) {
        setValue(value);
        if (onChange instanceof Function) {
            onChange(value)
        }
    }
    return (
        <div className={labelOnTop ? "pt-2" : "row pt-2"}>
            <div className="primaryLebel mb-0">{label}</div>
            <div className={labelOnTop ? "mt-1" : "ml-2"}>
                <Switch
                    onChange={e => handleOnChange(e)}
                    checked={value}
                    disabled={disabled}
                    onColor={"#00ab4e"}
                    uncheckedIcon={false}
                    checkedIcon={false}

                />
            </div>
            {labelOnRight ?
                <div className="primaryLebel mb-0 ml-2">{labelOnRight}</div> : null
            }
        </div>
    )
}
export default forwardRef(Main);