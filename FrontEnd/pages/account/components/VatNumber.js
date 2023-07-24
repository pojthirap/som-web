import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react"
import TextField from "@components/TextField"
import * as msg from "@msg"
import { getInputData } from "@helper"
function VatNumber({ require, defaultValue = "", disabled = false }, ref) {
    const valueRef = useRef({})
    const [valuePart1, setValuePart1] = useState("")
    const [valuePart2, setValuePart2] = useState("")
    useEffect(() => {
        const partValue = defaultValue.split("-")
        if (partValue.length == 2) {
            setValuePart1(partValue[0])
            setValuePart2(partValue[1])
        } else {
            setValuePart1(defaultValue)
            setValuePart2("")
        }
    }, [defaultValue, disabled]);

    useImperativeHandle(ref, () => ({
        getData(validateType = "N") {
            let valueData = getInputData(valueRef, "N");
            let value = ""
            if (valueData.data.part1 || valueData.data.part2) {
                value = valueData.data.part1 + "-" + valueData.data.part2
            }
            return {
                isInvalid: validate(valueData.data, validateType),
                value: value,
                isChange: defaultValue != value,
                label: msg.vatNumber
            };
        },
        clearValue() {
            // setText(defaultValue);
        },
        clearValidate() {
            valueRef.current.part1.clearValidate()
            valueRef.current.part2.clearValidate()
            setEerrorMessage("");
        },
    }));

    function validate(data, validateType) {
        let isInvalid = false
        if (data.part1 && !data.part2) {
            if (validateType != "NV") valueRef.current.part2.setError(msg.enterBothVatNumber)
            isInvalid = true
        }
        else if (!data.part1 && data.part2) {
            if (validateType != "NV") valueRef.current.part1.setError(msg.enterBothVatNumber)
            isInvalid = true
        }
        else if (data.part1 && data.part2 && data.part1.length < 13) {
            if (validateType != "NV") valueRef.current.part1.setError(msg.enterVatNumberLessThen13)
            isInvalid = true
        }
        return isInvalid
    }

    function RequireLabel() {
        if (!require) return null;
        return (<span style={{ color: "red" }}> *</span>);
    }

    return (
        <>
            <div className="primaryLebel">{msg.vatNumber}<RequireLabel /></div>
            <div className="row">
                <div className="col-6 p-0">
                    <TextField
                        maxLength={13}
                        allowChar="ENG THAI NUM"
                        ref={el => valueRef.current.part1 = el}
                        defaultValue={valuePart1}
                        disabled={disabled}
                        placeholder={disabled  ? "-" : null}
                    />
                </div>
                <div className="col-1 p-0 text-center align-items-center d-grid" style={{ fontSize: "1.5rem" }}>
                    <span>
                        -
                    </span>
                </div>
                <div className="col-5 p-0">
                    <TextField
                        maxLength={5}
                        allowChar="ENG THAI NUM"
                        ref={el => valueRef.current.part2 = el}
                        defaultValue={valuePart2}
                        disabled={disabled}
                        placeholder={disabled  ? "-" : null}
                    />
                </div>
            </div>
        </>
    )
}
export default forwardRef(VatNumber)