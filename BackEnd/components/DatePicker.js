import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { toString } from '@helper';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons'
import datepickerUtil from "@utils/datepickerUtil"
import thLocale from "date-fns/locale/th";
import * as msg from '@msg'
import moment from 'moment';
function Main(props, ref) {
    const {
        label,
        require = false,
        disablePast = false,
        defaultValue,
        showTodayButton = true,
        autoOk = false,
        onChange,
        minDate,
        disabled,
        focusDate,
        maxDate,
        placeholder,
        isDisableClear = false,
        currentFocus,
        notClearIsAfter = false,
        today
    } = props;

    const [clear, setClear] = useState(true);
    const [focus, setFocus] = useState(focusDate);
    const [value, setValue] = useState();
    const [isError, setIsError] = useState(false);
    const [errorMessage, setEerrorMessage] = useState("");
    const [minDateObj, setMinDateObj] = useState(undefined);

    useEffect(() => {
        setFocus(focusDate)
        console.log(focusDate)
    }, [focusDate])

    useEffect(() => {
        if (defaultValue) {
            let datePart = defaultValue.split("T")
            let date = moment(datePart[0]).format();
            if (minDateObj instanceof Date) {
                const currentMinDate = moment(toString(minDateObj))
                if (currentMinDate.isBefore(date)) {
                    setValue(null)
                } else {
                    setValue(date)
                    console.log("XXX1")
                }
            }
            else if (moment(toString(datePart[0])).isBefore("1956-01-01")) {
                setValue(null)
            }
            else {
                setValue(new Date(date))
            }
        }
        else {
            setValue(null)
        }
    }, [defaultValue])

    useEffect(() => {
        if (minDate) {
            let datePart = minDate.split("T")
            let date = moment(datePart[0]).format();
            console.log("XXX", value, value instanceof Date)
            if (value instanceof Date) {
                const currentDate = moment(toString(value)).format("YYYY-MM-DD").concat("T00:00:00");
                const datetime = moment(currentDate)
                console.log(datetime)
                console.log("XXX", date)
                if (datetime.isBefore(date)) {
                    setValue(null)
                }
                else if (datetime.isAfter(moment(date).add(365, 'days').format("YYYY-MM-DD").concat("T00:00:00"))) {
                    if (notClearIsAfter) {

                    }
                    else {
                        setValue(null)
                    }
                }
            }
            setMinDateObj(date)
        }
        else {
            setMinDateObj(undefined)
        }
    }, [minDate])

    useImperativeHandle(ref, () => ({
        getData() {
            const returnData = value ? moment(toString(value)).format("YYYY-MM-DD").concat("T00:00:00") : null;
            return { isInvalid: validate(value), value: returnData, isChange: isChange(), label: label };
        },
        clearValue() {
            setValue(defaultValue);
        },
        clearValidate() {
            setIsError(false);
            setEerrorMessage("");
        }
    }));

    function validate(value) {
        let isEr = false;
        let erMsg = "";
        if (require && (!value || value.length === 0)) {
            isEr = true;
            erMsg = msg.pleaseFill + (label || placeholder);
        }
        setIsError(isEr);
        setEerrorMessage(erMsg);
        return isEr;
    }

    function isChange() {
        return moment(toString(value)).format("YYYY-MM-DD").concat("T00:00:00") != defaultValue;
    }

    function handleOnChange(obj) {
        setValue(obj);
        validate(obj)
        if (onChange instanceof Function) {
            const returnData = obj ? moment(toString(obj)).format("YYYY-MM-DD").concat("T00:00:00") : "";
            onChange(returnData)
        }
    }

    function handleClr(e) {
        e.stopPropagation();
        setFocus(currentFocus ? currentFocus : null)
        setValue(null)
        setIsError(false);
        setEerrorMessage("");
        if (onChange instanceof Function) {
            onChange("")
        }
    }

    function RequireLabel() {
        if (!require) return null;
        return (<span style={{ color: "red" }}> *</span>);
    }

    return (
        <div>
            {label ? <div className="primaryLebel">{label}<RequireLabel /></div> : null}
            <div>
                <MuiPickersUtilsProvider utils={datepickerUtil} locale={thLocale}>
                    <DatePicker
                        placeholder={placeholder}
                        disabled={disabled}
                        className={(isError ? " InputError" : "") + (disabled ? " backgroundDisabled" : "")}
                        value={value}
                        disablePast={disablePast}
                        onChange={e => handleOnChange(e)}
                        format="dd/MM/yyyy"
                        showTodayButton={showTodayButton}
                        okLabel={"ตกลง"}
                        cancelLabel={"ยกเลิก"}
                        todayLabel={"วันนี้"}
                        autoOk={autoOk}
                        minDate={minDateObj ? minDateObj : "1956-01-01"}
                        InputProps={{
                            endAdornment: (
                                <div className="row justify-content-end" style={{ width: 60 }}>
                                    {!isDisableClear && !disabled ?
                                        <div className={"col-6 row justify-content-center align-items-center cursor-pointer px-1" + (value ? "" : " d-none")} onClick={(e) => handleClr(e)}>
                                            <FontAwesomeIcon icon={faTimes} className="navBarIcon" color="#777" size="xs" />
                                        </div>
                                        : null}
                                    <div className={"col-6 row justify-content-center align-items-center pr-1 pl-2 "}>
                                        <FontAwesomeIcon icon={faCalendarAlt} className="calendarIcon" color="#777" size="xs" />
                                    </div>
                                </div>
                            )
                        }}
                        initialFocusedDate={focus}
                        maxDate={maxDate || today ? moment(toString(maxDate)).isBefore(today) ? maxDate : today : "2100-01-01"}
                    />
                </MuiPickersUtilsProvider>

            </div>
            {isError ? <span className="textError">{errorMessage}</span> : null}
        </div>
    )
}

export default forwardRef(Main)