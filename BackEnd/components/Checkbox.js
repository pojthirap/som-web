import { useState } from "react"

export default function Main(props) {
    const { name
        , id
        , onChange
        , defaultValue = false
        , disabled = false
        , label = null
    } = props;
    const [value, setValue] = useState(defaultValue);
    function handleOnChange(obj) {
        let tmpValue = obj.target.checked;
        setValue(tmpValue);
        if (onChange instanceof Function) {
            onChange(tmpValue)
        }
    }
    function onClickLabel() {
        let tmpValue = !value;
        setValue(tmpValue);
        if (onChange instanceof Function) {
            onChange(tmpValue)
        }
    }
    return (
        <div className="form-check d-flex">
            <input
                type="checkbox"
                name={name}
                id={id}
                onChange={e => handleOnChange(e)}
                checked={value}
                disabled={disabled}
            ></input>
            {label ? <div className="pl-1 checkbox-label" onClick={onClickLabel}>{label}</div> : null}
        </div>
    )
}