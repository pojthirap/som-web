// import { selectNoData } from "@utils/msg";
import { useState, useImperativeHandle, forwardRef, useEffect } from "react"
import Checkbox from "react-custom-checkbox";

function Main(props, ref) {
    const {
        name,
        onChange,
        defaultValue = false,
        label,
        disabled = false,
        readOnly = false,
    } = props;
    const [value, setValue] = useState(defaultValue);
    useEffect(() => {
        setValue(defaultValue)
    }, [defaultValue])
    useImperativeHandle(ref, () => ({
        getData() {
            return { isInvalid: false, value: value };
        },
        clearValue() {
            setValue(defaultValue);
        },
        clearValidate() {
        },
        setData(data) {
            setValue(data);
        }
    }));

    function handleOnChange(obj) {
        let tmpValue = obj;
        setValue(tmpValue);
        if (onChange instanceof Function) {
            onChange(tmpValue)
        }
    }
    const CheckIcon = () => {
        return (
            <div className={"checkBoxIconBackground" + (disabled ? " checkBox-disabled" : "")}>
                <div className="checkBoxIcon" >
                    ✔
                </div>
            </div>
        )
    }
    return (
        <div className="form-check">
            <Checkbox
                name={name}
                onChange={e => handleOnChange(e)}
                checked={value}
                label={label}
                disabled={(disabled || readOnly)}
                size={25}
                borderWidth={1}
                borderRadius={5}
                borderColor="#d9d9d9"
                icon={<CheckIcon />}
                labelClassName={"checkBoxLabel" + ((disabled || readOnly) ? " cursor-not-allowed" : " cursor-pointer")}
                containerClassName="m-0"
                className={"check-input " + (disabled ? "checkBox-disabled" : null)}
            >
            </Checkbox>
        </div>
    )
}
export default forwardRef(Main);