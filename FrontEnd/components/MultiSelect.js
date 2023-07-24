import { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import * as msg from '@msg'
function App(props, ref) {
    const {
        label,
        isNotValue = false,
        options = [],
        onChange,
        disabled = true,
        defaultValue = "",
        require = false,
        returnArray = false
    } = props;
    const [selected, setSelected] = useState(defaultSelectValue(defaultValue));
    const [selectValue, setSelectValue] = useState();
    const [isError, setIsError] = useState(false);
    const [errorMessage, setEerrorMessage] = useState("");
    useEffect(() => {
        setSelected(defaultSelectValue(defaultValue))
    }, [defaultValue])

    useImperativeHandle(ref, () => ({
        getData(validateType = "N") {
            let returnData = selectValue ? selectValue : "";
            if (returnArray) returnData = selectValue ? selectValue.split(",") : []
            return { isInvalid: validate(selectValue, validateType), value: returnData, isChange: isChange(), label: label };
        },
        clearValue() {
            setSelected([]);
        },
        clearValidate() {
            setIsError(false);
            setEerrorMessage("");
        }

    }));

    function isChange() {
        let listSelect = selectValue ? selectValue.split(",") : []
        if (listSelect.length != defaultValue.length) {
            return true
        }
        else if (listSelect.toString() != defaultValue.toString()) {
            return true
        }
    }

    function defaultSelectValue(defaultValue) {
        let listDefault = []
        if (options.length) {
            for (let i = 0; i < defaultValue.length; i++) {
                listDefault.push(options.find(option => option.value == defaultValue[i]));
            }
        }
        return listDefault
    }

    function handleLabel() {
        let label = ""
        let arrayLabel = []
        if (!selected.length) {
            if (isNotValue) {
                label = "-"
            }
            else {
                label = msg.pleaseSelect
            }
        }
        else {
            if (selected.length > 3) {
                let total = selected.filter((e) => e.value == "*")
                if (total.length > 0) {
                    label = selected.length - 1 + " selected";
                }
                else {
                    label = selected.length + " selected";
                }
            }
            else {
                for (let i = 0; i < selected.length; i++) {
                    arrayLabel.push(selected[i].label);
                }
                label = arrayLabel.join(" , ")
            }
        }
        return label
    }

    useEffect(() => {
        handleValue()
        if (options.length == selected.length && selected.length > 1) {
            setSelected([{ value: "*", label: "ทั้งหมด" }, ...options])
        }
    }, [selected]);

    function handleValue() {
        let value = ""
        let arrayValue = []
        if (selected.length) {
            for (let i = 0; i < selected.length; i++) {
                if (selected[i].value != "*") {
                    arrayValue.push(selected[i].value);
                }
            }
            value = arrayValue.join(",")
        }
        setSelectValue(value)
    }

    function onChangeSelect(value, event) {
        if (event.action === "select-option" && event.option.value === "*") {
            setSelected([{ value: "*", label: "ทั้งหมด" }, ...options])
        }
        else if (event.action === "deselect-option" && event.option.value === "*") {
            setSelected([]);
        }
        else if (event.action === "select-option") {
            setSelected(value);
        }
        else if (event.action === "deselect-option") {
            setSelected(value.filter((o) => o.value !== "*"));
        }
        else {
            setSelectValue(value)
        }
        validate(value)
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

    const customStyles = {
        dropdownButton: () => ({
            height: "2.5rem",
            color: "hsl(0, 0%, 60%)",
            borderRadius: "0.5rem ",
            fontSize: "1.25rem",
            fontWeight: "300",
            borderStyle: "solid",
            borderColor: "hsl(0, 0%, 90%)",
            borderWidth: "1px ",
            boxShadow: "none",
            width: "100%",
            cursor: "context-menu !important",
            alignContent: "center !important",
            display: "flex",
            justifyContent: "left !important",
            textAlign: "left",
            padding: "0"
        }),
    }

    const customStylesError = {
        dropdownButton: () => ({
            height: "2.5rem",
            borderRadius: "0.5rem ",
            fontSize: "1.25rem",
            fontWeight: "300",
            borderStyle: "solid",
            borderColor: "hsl(0, 0%, 90%)",
            width: "100%",
            borderWidth: "1px ",
            alignContent: "center !important",
            display: "flex",
            justifyContent: "left !important",
            textAlign: "left",
            padding: "0",
            color: "hsl(0, 0%, 50%)",
            backgroundColor: "#fff !important",
            borderColor: "#fe8686 !important",
            outline: "0 !important",
            boxShadow: "0 0 0 0.25rem rgba(253, 13, 13, 0.25) !important"
        }),
    }

    function RequireLabel() {
        if (!require) return null;
        return (<span style={{ color: "red" }}> *</span>);
    }

    return (
        <div>
            {label ? <div className="primaryLebel">{label}<RequireLabel /></div> : null}
            <ReactMultiSelectCheckboxes
                menuIsOpen={!disabled ? disabled : null}
                getDropdownButtonLabel={() => handleLabel()}
                options={[{ value: "*", label: "ทั้งหมด" }, ...options]}
                value={selected}
                onChange={onChangeSelect}
                autoFocus={false}
                styles={disabled ? isError ? customStylesError : null : customStyles}
                noOptionsMessage={() => msg.selectNoData}
            />
            {isError ? <span className="textError">{errorMessage}</span> : null}
        </div>
    );
}

export default forwardRef(App);