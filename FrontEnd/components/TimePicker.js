import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import moment from 'moment';
import TimePicker from 'rc-time-picker';
import * as msg from '@msg'
import 'rc-time-picker/assets/index.css';

function Main({
    onChange,
    defaultValue,
    label,
    disabled = false,
    hideLabel = false,
    require = false,
    allowEmpty = false,
}, ref) {
    const [value, setValue] = useState()
    const [isError, setIsError] = useState(false);
    const [errorMessage, setEerrorMessage] = useState("");


    useEffect(() => {
        if (defaultValue) {
            let timePart = defaultValue.split(":")
            let tmpM = moment().set("hour", timePart[0]).set("minute", timePart[1]);
            setValue(tmpM)
        }
    }, [defaultValue])

    useImperativeHandle(ref, () => ({
        getData() {
            return { isInvalid: validate(value), value: (value ? value.format('HH:mm') : "") };
        },
        clearValue() {
            let timePart = defaultValue.split(":")
            let tmpM = moment().set("hour", timePart[0]).set("minute", timePart[1]);
            setValue(tmpM)
        },
        clearValidate() {
            setIsError(false);
            setEerrorMessage("");
        }

    }));
    const handleOnChange = (data) => {
        setValue(data)
        if (onChange instanceof Function) {
            onChange(data.format('HH:mm'))
        }
    }

    function validate(value) {
        let isEr = false;
        let erMsg = "";
        if (require && !value) {
            isEr = true;
            erMsg = msg.pleaseFill + label;
        }
        setIsError(isEr);
        setEerrorMessage(erMsg);
        return isEr;
    }

    return (
        <div>
            {!hideLabel && label ? <div className="primaryLebel">{label}<RequireLabel /></div> : null}
            <TimePicker className=""
                value={value}
                showSecond={false}
                onChange={handleOnChange}
                disabled={disabled}
                allowEmpty={allowEmpty}
                defaultOpenValue={value ? value : moment().set("hour", "0").set("minute", "0")}

            />
            {isError ? <span className="textError">{errorMessage}</span> : null}
        </div>
    );
}

export default forwardRef(Main)