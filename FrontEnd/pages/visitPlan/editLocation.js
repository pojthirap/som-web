import { useState, useRef, useEffect } from 'react';
import { getInputData, formatObjForSelect, toString } from '@helper';
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import TimePicker from '@components/TimePicker'
import TextField from '@components/TextField';
import Checkbox from "@components/Checkbox"
import Radio from '@components/Radio'
import AccountTagHistory from 'pages/visitPlan/components/visitPlanTagHistory'
import Select from '@components/Select';
import Button from '@components/Button';
import Image from 'next/image'
import * as apiPath from '@apiPath'
import * as msg from '@msg'
const radioOption = [
    { value: "S", label: msg.specialTask },
    { value: "T", label: msg.taskTemplate }
]

export default function Create({ callAPI, redirect, customAlert, getPathValue, updateCurrentPathValue }) {
    const dispatch = useDispatch();
    const pathValue = getPathValue(useSelector((state) => state.pathValue));
    const createPagePathValue = getPathValue(useSelector((state) => state.pathValue), "/visitPlan/createOrEdit");
    const inputRef = useRef({});
    const disabledInput = pathValue.viewOnly

    const handleSave = () => {
        let inputData = getInputData(inputRef);
        if (!inputData.isInvalid) {
            if (inputData.data.planStartTime && inputData.data.planEndTime && inputData.data.planEndTime <= inputData.data.planStartTime) return customAlert(msg.timeRangWrong, "W")
            let tmpObj = { ...pathValue.editItem }
            tmpObj.planStartTime = inputData.data.planStartTime;
            tmpObj.planEndTime = inputData.data.planEndTime;
            tmpObj.locRemark = inputData.data.remark;
            let tmpCreatePagePathValue = { ...createPagePathValue };
            for (let i = 0; i < tmpCreatePagePathValue.prospectLocationAdded.length; i++) {
                if (tmpObj.locationId == tmpCreatePagePathValue.prospectLocationAdded[i].locationId) {
                    tmpCreatePagePathValue.prospectLocationAdded[i] = tmpObj;
                }
            }
            dispatch(updateCurrentPathValue({}));
            dispatch(redirect("/visitPlan/createOrEdit", tmpCreatePagePathValue))
        }
    }
    const back = () => {
        dispatch(updateCurrentPathValue({}));
        dispatch(redirect("/visitPlan/createOrEdit", createPagePathValue))
    }

    return (
        <div>
            <AccountTagHistory />

            <div className="container py-4">
                <div className="row">
                    <div className="col-12 col-xl-8">
                        <div className="font-large">
                            {msg.locationNameEn} : {toString(pathValue && pathValue.editItem && pathValue.editItem.locationName ? pathValue.editItem.locationName : null, true)}
                        </div>
                        {/* <div className="font-large text-red">
                            {msg.remind} : {toString(pathValue && pathValue.editItem && pathValue.editItem.remark ? pathValue.editItem.remark : null, true)}
                        </div> */}

                    </div>
                    <div className="col-12 col-xl-4 row">
                        <div className="col-3 font-large p-0">
                            {msg.time} :
                        </div>
                        <div className="col-9 row p-0">
                            <div className="col-6 pl-0">
                                <TimePicker
                                    hideLabel
                                    allowEmpty
                                    label={msg.time}
                                    ref={el => inputRef.current.planStartTime = el}
                                    defaultValue={pathValue && pathValue.editItem && pathValue.editItem.planStartTime ? pathValue.editItem.planStartTime : null}
                                    disabled={disabledInput}
                                />
                            </div>
                            <div className="col-6 pr-0">
                                <TimePicker
                                    hideLabel
                                    allowEmpty
                                    label={msg.time}
                                    ref={el => inputRef.current.planEndTime = el}
                                    defaultValue={pathValue && pathValue.editItem && pathValue.editItem.planEndTime ? pathValue.editItem.planEndTime : null}
                                    disabled={disabledInput}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-xl-8 mt-3">
                        <TextField
                            maxLength={150}
                            label={msg.remark}
                            isTextArea
                            ref={el => inputRef.current.remark = el}
                            defaultValue={pathValue && pathValue.editItem && pathValue.editItem.locRemark ? pathValue.editItem.locRemark : ""}
                            disabled={disabledInput}
                        />
                    </div>
                </div>
            </div>
            <div className="row justify-content-center mt-4 pt-3 border-top-grey">
                {disabledInput ?
                    <div>
                        <Button customLabel={msg.close} className="px-4" onClick={back} />
                    </div>
                    :
                    <div>
                        <Button type="save" className="px-4" onClick={handleSave} />
                    </div>
                }
            </div>
        </div>
    )
}