import { useEffect, useState, useImperativeHandle, forwardRef } from "react"
import NumberFormat from "react-number-format";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import * as msg from '@msg'

const Eng = /[A-Za-z]/;
const Thai = /[ก-๛]/;
const Num = /[0-9]/;
const Pipe = /[|]/;
const Slash = /[/]/;
const Dot = /[.]/;
const Dat = /[-]/;
const Other = /[^A-Za-z0-9ก-๛|.\s/-]/;
const RegexEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

function Main({
    label,
    hideLabel = false,
    allowChar = "ALL",
    disabled,
    placeholder,
    require = false,
    preventSpace = false,
    preventEnter = false,
    value = "",
    onChange,
    maxLength = 250,
    preventPipe,
    maxNum = null,
    minNum = null,
    name = null,
    readOnly = false,
    shadowBorder = false,
    type = "text",
    numberComma = false,
    isTextArea = false,
    decimalFormat = false,
    isAllowed,
    fixSize,
    notRequireLabel = false
}, ref) {
    let allowCharUpper = allowChar.toUpperCase();

    if (type == "email") {
        allowCharUpper = "ENG NUM OTHER"
    }
    else if (preventPipe) {
        if (allowCharUpper.match("ALL")) {
            allowCharUpper = "ENG THAI NUM OTHER"
        } else {
            allowCharUpper.replaceAll("PIPE", "")
        }
    }
    const [text, setText] = useState(value);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setEerrorMessage] = useState("");
    const [isShowPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!isShowPassword);
    };
    useEffect(() => {
        setText(value);
        setIsError(false);
        setEerrorMessage("");
    }, [value, disabled]);
    useImperativeHandle(ref, () => ({
        getData(validateType = "N") {
            return { isInvalid: validate(text, validateType), value: text ? text.trim() : null, isChange: isChange(), label: label };
        },
        clearValue() {
            setText(value);
        },
        clearValidate() {
            setIsError(false);
            setEerrorMessage("");
        }

    }));
    function isChange() {
        return text != value;
    }
    function gobalRegex(reg) {
        return new RegExp(reg, "g");
    }

    function validate(text, validateType = "N") {
        let isEr = false;
        let erMsg = "";
        if (require && (!text || text.length === 0)) {
            isEr = true;
            erMsg = msg.pleaseFill + (label || placeholder);
        }
        if (type == "email" && text && !RegexEmail.test(text)) {
            isEr = true;
            erMsg = (label || placeholder) + msg.wrongEmail;
        }
        if (validateType != "NV") {
            setIsError(isEr);
            setEerrorMessage(erMsg);
        }
        return isEr;
    }

    function handleOnKeyDown(event) {
        if (!event.ctrlKey && event.key.length === 1 && event.code != "Space") {
            if (allowCharUpper.match("ALL")) return;
            if (allowCharUpper.match("ENG") && Eng.test(event.key)) return;
            if (allowCharUpper.match("THAI") && Thai.test(event.key)) return;
            if (allowCharUpper.match("NUM") && Num.test(event.key)) return;
            if (allowCharUpper.match("OTHER") && (Other.test(event.key) || Slash.test(event.key) || Dot.test(event.key) || Dat.test(event.key))) return;
            if (allowCharUpper.match("SLASH") && Slash.test(event.key)) return;
            if (allowCharUpper.match("PIPE") && Pipe.test(event.key)) return;
            if (allowCharUpper.match("DOT") && Dot.test(event.key)) return;
            if (allowCharUpper.match("DAT") && Dat.test(event.key)) return;
            return event.preventDefault();
        } else if (preventSpace && event.code == "Space") {
            return event.preventDefault();
        } else if (preventEnter && event.which == 13) {
            return event.preventDefault();
        }
    }

    function handleOnChange(textVal) {
        var replaceText = textVal;
        if (!allowCharUpper.match("ENG")) replaceText = replaceText.replace(gobalRegex(Eng), "");
        if (!allowCharUpper.match("THAI")) replaceText = replaceText.replace(gobalRegex(Thai), "");
        if (!allowCharUpper.match("NUM")) replaceText = replaceText.replace(gobalRegex(Num), "");
        if (!allowCharUpper.match("OTHER")) {
            replaceText = replaceText.replace(gobalRegex(Other), "");
            if (!allowCharUpper.match("SLASH")) replaceText = replaceText.replace(gobalRegex(Slash), "");
            if (!allowCharUpper.match("DOT")) replaceText = replaceText.replace(gobalRegex(Dot), "");
            if (!allowCharUpper.match("DAT")) replaceText = replaceText.replace(gobalRegex(Dat), "");
        }
        if (allowCharUpper.match("ALL")) replaceText = textVal;
        if (allowCharUpper.match("NUM") && maxNum != null && Number(textVal) > Number(maxNum)) replaceText = "";
        if (allowCharUpper.match("NUM") && minNum != null && Number(textVal) < Number(minNum)) replaceText = "";
        setText(replaceText);
        validate(replaceText);
        if (onChange instanceof Function) {
            onChange(replaceText)
        }
    }

    function RequireLabel() {
        if (!require || notRequireLabel) return null;
        return (<span style={{ color: "red" }}> *</span>);
    }

    return (
        <div>
            {!hideLabel && label ? <div className="primaryLebel">{label}<RequireLabel /></div> : null}
            {isTextArea || decimalFormat ?
                <div>
                    {isTextArea ?
                        <textarea
                            type={type == "password" ? "password" : "text"}
                            className={"form-control primaryTextArea" + (shadowBorder ? " InputShadow" : "") + (isError ? " InputError" : "") + (readOnly ? " InputReadOnly" : "") + (fixSize ? " primaryTextAreaFixSize" : "")}
                            onKeyDown={handleOnKeyDown}
                            value={text}
                            onChange={e => handleOnChange(e.target.value)}
                            disabled={disabled || readOnly}
                            placeholder={placeholder}
                            // onBlur={() => validate(text)}
                            maxLength={maxLength}
                            name={name}
                        /> : null}
                    {decimalFormat ?
                        <NumberFormat
                            className={"form-control primaryInput " + (shadowBorder ? " InputShadow" : "") + (isError ? " InputError" : "") + (readOnly ? " InputReadOnly" : "")}
                            thousandsGroupStyle="thousand"
                            value={text}
                            onChange={e => handleOnChange(e.target.value)}
                            decimalScale={2}
                            decimalSeparator="."
                            displayType="input"
                            type="text"
                            onKeyDown={handleOnKeyDown}
                            thousandSeparator={true}
                            allowNegative={true}
                            maxLength={maxLength}
                            placeholder={placeholder}
                            disabled={disabled || readOnly}
                            isAllowed={(text) => {
                                const { floatValue } = text;
                                return floatValue >= 0 && floatValue <= isAllowed || floatValue == undefined;
                            }}
                        /> : null}
                </div>
                :
                <div className="d-flex">
                    <input
                        type={type == "password" ? (isShowPassword ? "text" : "password") : "text"}
                        className={"form-control primaryInput" + (shadowBorder ? " InputShadow" : "") + (isError ? " InputError" : "") + (readOnly ? " InputReadOnly" : "") + (type == "password" ? " show-pass-padding" : "")}
                        onKeyDown={handleOnKeyDown}
                        value={numberComma ? (text ? Number(text).toLocaleString('en-US') : "") : text}
                        onChange={e => handleOnChange(e.target.value)}
                        disabled={disabled || readOnly}
                        placeholder={placeholder}
                        // onBlur={() => validate(text)}
                        maxLength={maxLength}
                        name={name}
                    />
                    {type == "password" ?
                        <div
                            className="show-pass-btn"
                            onClick={handleClickShowPassword}
                        >
                            {isShowPassword ? <VisibilityOff color="action" /> : <Visibility color="action" />}
                        </div>
                        : null
                    }
                </div>
            }
            {isError ? <span className="textError">{errorMessage}</span> : null}

        </div >
    )
}

export default forwardRef(Main)