import { useEffect, useState, useImperativeHandle, forwardRef } from "react"
import { RadioGroup, Radio } from 'react-radio-group'
function Main(props, ref) {
    const {
        name,
        onChange,
        defaultValue = "",
        label,
        disabled = false,
        options = [],
        hideLabel = false,
        notInline = false
    } = props;
    const [value, setValue] = useState("");

    useImperativeHandle(ref, () => ({
        getData() {
            return { isInvalid: false, value: value, isChange: isChange(), label: label };
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

    useEffect(() => {
        setValue(defaultValue)
    }, [defaultValue])

    function isChange() {
        return value != defaultValue;
    }
    const handleOnChange = (obj) => {
        setValue(obj)
        if (onChange instanceof Function) {
            onChange(obj)
        }
    }
    const handleOnClickLabel = (obj) => {
        if(!disabled){
            handleOnChange(obj)
        }
    }
    const CustomButton = (data, index) => {
        const widthCal = notInline ? "100%" : (100 / options.length).toString() + "%"
        return (
            <div className="d-flex align-items-center" style={{ width: widthCal }}>
                <Radio disabled={disabled} value={data.value} className="form-check-input" /><div className={"font-normal pl-2" + (disabled ? " cursor-not-allowed" : " cursor-pointer")} onClick={() => handleOnClickLabel(data.value)}>{data.label}</div>
            </div>
        )
    }
    return (
        <div>
            {!hideLabel && label ? <div className="primaryLebel">{label}</div> : null}
            <RadioGroup disabled={disabled}  name={name} selectedValue={value} onChange={handleOnChange} >
                <div className="row">
                    {options.map((option, index) => {
                        return (
                            CustomButton(option, index)
                        )
                    })}
                </div>
            </RadioGroup >
        </div>
    )
}
export default forwardRef(Main)