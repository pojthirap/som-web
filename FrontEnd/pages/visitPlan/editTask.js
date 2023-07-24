import { useState, useRef, useEffect } from 'react';
import { getInputData, formatObjForSelect, toString, formatDateTime } from '@helper';
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
    const [currentRadio, setCurrentRadio] = useState("S");
    const [taskAdded, setTaskAdded] = useState(pathValue && pathValue.editItem && pathValue.editItem.listTask ? pathValue.editItem.listTask : []);
    const [specialTaskAll, setSpecialTaskAll] = useState([]);
    const [specialTask, setSpecialTask] = useState([]);
    const [templateTaskAll, setTemplateTaskAll] = useState([]);
    const [templateTask, setTemplateTask] = useState([]);
    const [remind, setRemind] = useState("-");
    const specialTaskRef = useRef({});
    const taskTemplateRef = useRef({});
    const timeRef = useRef({});
    const disabledInput = pathValue.viewOnly

    useEffect(() => {
        getTaskTemplateAppFormForCreatPlan();
        getTaskSpecialForCreatPlan();
        getLastRemindPlanTripProspect();
    }, [])

    const getTaskTemplateAppFormForCreatPlan = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.getTaskTemplateAppFormForCreatPlan, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : []
        setTemplateTaskAll(data);
        if (taskAdded && taskAdded.length > 0) {
            taskAdded.forEach((addedObj) => {
                if (addedObj.taskType != "A") return;
                let findCode = addedObj.tpAppFormId;
                data = data.filter(element => element.code != findCode);
            })
        }
        setTemplateTask(data);
    }

    const getLastRemindPlanTripProspect = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                prospId: toString(pathValue && pathValue.editItem && pathValue.editItem.locationId ? pathValue.editItem.locationId : null, false, false)
            }
        }
        const jsonResponse = await callAPI(apiPath.getLastRemindPlanTripProspect, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 && jsonResponse.data.records[0].remind ? jsonResponse.data.records[0].remind : "-"
        setRemind(data)
    }

    const getTaskSpecialForCreatPlan = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                prospId: toString(pathValue && pathValue.editItem && pathValue.editItem.locationId ? pathValue.editItem.locationId : null, false, false)
            }
        }
        const jsonResponse = await callAPI(apiPath.getTaskSpecialForCreatPlan, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : []

        //ไม่มี custCode ตัด M กับ S ทิ้ง
        if (!pathValue.editItem && !pathValue.editItem.custCode) {
            data = data.filter(element => element.taskType != "M" && element.taskType != "S");
        }

        for (let i = 0; i < data.length; i++) {
            if (data[i].taskType == "M") {
                data[i].code = toString(i, false, false) + "M"
            }
        }
        setSpecialTaskAll(data);
        if (taskAdded && taskAdded.length > 0) {
            let tmpTaskAdd = []
            taskAdded.forEach((addedObj) => {
                if (addedObj.taskType == "M") {
                    let foundObj = data.find(element => element.taskType == "M");
                    let tmpTaskAddObj = addedObj
                    tmpTaskAddObj.lastUpdate = foundObj ? foundObj.updateDate : ""
                    tmpTaskAdd.push(tmpTaskAddObj)

                    data = data.filter(element => element.taskType != "M");
                } else {
                    let addedCode = "";
                    if (addedObj.taskType == "A") return tmpTaskAdd.push(addedObj);
                    if (addedObj.taskType == "S") addedCode = addedObj.tpStockCardId;
                    else if (addedObj.taskType == "T") addedCode = addedObj.tpSaFormId;

                    let foundObj = data.find(element => element.code == addedCode);
                    let tmpTaskAddObj = addedObj
                    tmpTaskAddObj.lastUpdate = foundObj ? foundObj.updateDate : ""
                    tmpTaskAdd.push(tmpTaskAddObj)

                    data = data.filter(element => element.code != addedCode);
                }
            })
            setTaskAdded(tmpTaskAdd)
        }
        setSpecialTask(data);
    }

    function formatDataforSelect(data) {
        return data && data.length > 0 ? formatObjForSelect(data.sort(compare), "code", "description") : [];
    }
    function formatDataforSelectTemplate(data) {
        return data && data.length > 0 ? formatObjForSelect(data.sort(compareTemplate), "code", "description") : [];
    }

    const handleRadioChange = (obj) => {
        setCurrentRadio(obj)
        specialTaskRef.current.code.clearValue()
        taskTemplateRef.current.code.clearValue()
        specialTaskRef.current.code.clearValidate()
        taskTemplateRef.current.code.clearValidate()
    }

    const handleAdd = () => {
        if (currentRadio == "S") {
            let inputData = getInputData(specialTaskRef);
            if (!inputData.isInvalid) {
                let found = specialTask.find(element => toString(element.code, false, false) == toString(inputData.data.code, false, false));
                let taskTmpObj = {
                    orderNo: toString(taskAdded.length, false, false),
                    templateName: found.description,
                    taskType: found.taskType,
                    requireFlag: "Y",
                    lastUpdate: found.updateDate
                }
                if (found.taskType == "S") taskTmpObj.tpStockCardId = found.code;
                else if (found.taskType == "T") taskTmpObj.tpSaFormId = found.code;
                setTaskAdded([...taskAdded, taskTmpObj])

                let tmpArr = specialTask.filter(element => toString(element.code, false, false) != toString(inputData.data.code, false, false));
                setSpecialTask(tmpArr);
                specialTaskRef.current.code.clearValue()
            }
        } else {
            let inputData = getInputData(taskTemplateRef);
            if (!inputData.isInvalid) {
                let found = templateTask.find(element => toString(element.code, false, false) == toString(inputData.data.code, false, false));
                let taskTmpObj = {
                    orderNo: toString(taskAdded.length, false, false),
                    templateName: found.description,
                    taskType: found.taskType,
                    tpAppFormId: found.code,
                    requireFlag: "N",
                    lastUpdate: ""
                }
                setTaskAdded([...taskAdded, taskTmpObj])
                let tmpArr = templateTask.filter(element => toString(element.code, false, false) != toString(inputData.data.code, false, false));
                setTemplateTask(tmpArr);
                taskTemplateRef.current.code.clearValue()
            }
        }
    }
    const handleDel = (delItem) => {
        customAlert(msg.confirmDelete, "Q", async () => {
            let findCode = "";
            let findKey = "";
            if (delItem.taskType == "A") {
                findCode = delItem.tpAppFormId;
                findKey = "tpAppFormId";
                let found = templateTaskAll.find(element => toString(element.code, false, false) == toString(findCode, false, false));
                if (found) setTemplateTask([...templateTask, found]);

                let tmpArr = taskAdded.filter(element => toString(element[findKey], false, false) != toString(findCode, false, false));
                setTaskAdded(tmpArr);
            } else {
                if (delItem.taskType == "M") {
                    let found = specialTaskAll.find(element => toString(element.taskType, false, false) == "M");
                    if (found) setSpecialTask([...specialTask, found]);

                    let tmpArr = taskAdded.filter(element => toString(element.taskType, false, false) != "M");
                    setTaskAdded(tmpArr);
                } else {
                    if (delItem.taskType == "S") {
                        findCode = delItem.tpStockCardId;
                        findKey = "tpStockCardId";
                    } else if (delItem.taskType == "T") {
                        findCode = delItem.tpSaFormId;
                        findKey = "tpSaFormId";
                    }
                    let found = specialTaskAll.find(element => toString(element.code, false, false) == toString(findCode, false, false));
                    if (found) setSpecialTask([...specialTask, found]);

                    let tmpArr = taskAdded.filter(element => toString(element[findKey], false, false) != toString(findCode, false, false));
                    setTaskAdded(tmpArr);
                }
            }
            customAlert(msg.deleteSuccess)
        });
    }

    const handleSave = () => {
        if (taskAdded.length < 1) return customAlert(msg.planTripTaskMin1, "W")
        let inputData = getInputData(timeRef);
        if (!inputData.isInvalid) {
            if (inputData.data.planStartTime && inputData.data.planEndTime && inputData.data.planEndTime <= inputData.data.planStartTime) return customAlert(msg.timeRangWrong, "W")
            let tmpObj = { ...pathValue.editItem }
            let listTask = []
            taskAdded.forEach((data, index) => {
                let taskTmpObj = {
                    orderNo: toString(index, false, false),
                    taskType: data.taskType,
                    requireFlag: data.requireFlag
                }
                if (data.taskType == "S") taskTmpObj.tpStockCardId = data.code;
                else if (data.taskType == "T") taskTmpObj.tpSaFormId = data.code;
                else if (data.taskType == "A") taskTmpObj.tpAppFormId = data.code;
                listTask.push(taskTmpObj)
            })
            tmpObj.planStartTime = inputData.data.planStartTime;
            tmpObj.planEndTime = inputData.data.planEndTime;
            tmpObj.listTask = taskAdded;


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


    function compare(a, b) {
        const aComparStr = a.taskType + a.description;
        const bComparStr = b.taskType + b.description;
        if (aComparStr < bComparStr) {
            return -1;
        }
        if (aComparStr > bComparStr) {
            return 1;
        }
        return 0;
    }
    function compareTemplate(a, b) {
        if (a.description < b.description) {
            return -1;
        }
        if (a.description > b.description) {
            return 1;
        }
        return 0;
    }

    const taskItem = (data, index) => {
        let disabledCeckbox = data.taskType != "A" || disabledInput;
        return (
            <tr>
                <td className="padding-row">
                    <div className="text-center">
                        {toString(index + 1)}
                    </div>
                </td>
                <td className="padding-row">
                    <div className="text-left">
                        {toString(data.templateName)}
                    </div>
                </td>
                <td className="padding-row">
                    <div className="text-center">
                        {data.lastUpdate && (data.taskType == "M" || data.taskType == "S") ? formatDateTime(data.lastUpdate) : null}
                    </div>
                </td>
                <td className="padding-row ">
                    <div className="d-flex justify-content-center">
                        <Checkbox
                            defaultValue={data.requireFlag == "Y"}
                            onChange={(text) => onChangCheckbox(index, text)}
                            disabled={disabledCeckbox}
                        />
                    </div>
                </td>
                <td className="text-center">
                    {!disabledInput ? <FontAwesomeIcon icon={faTrashAlt} className="iconTable faDel ml-1" title="Delete" onClick={() => handleDel(data)} /> : null}

                </td>
            </tr>
        )
    }

    const onChangCheckbox = (index, value) => {
        taskAdded[index].requireFlag = value ? "Y" : "N";
    }

    return (
        <div>
            <AccountTagHistory />

            <div className="container py-4">
                <div className="row">
                    <div className="col-12 col-xl-8">
                        <div className="font-large">
                            {msg.prospectAndCustomer} : {toString(pathValue && pathValue.editItem && pathValue.editItem.locationName ? pathValue.editItem.locationName : null, true)}
                        </div>
                        <div className="font-large text-red">
                            {msg.remind} : {toString(remind)}
                        </div>

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
                                    ref={el => timeRef.current.planStartTime = el}
                                    defaultValue={pathValue && pathValue.editItem && pathValue.editItem.planStartTime ? pathValue.editItem.planStartTime : null}
                                    disabled={disabledInput}
                                />
                            </div>
                            <div className="col-6 pr-0">
                                <TimePicker
                                    hideLabel
                                    allowEmpty
                                    label={msg.time}
                                    ref={el => timeRef.current.planEndTime = el}
                                    defaultValue={pathValue && pathValue.editItem && pathValue.editItem.planEndTime ? pathValue.editItem.planEndTime : null}
                                    disabled={disabledInput}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {!disabledInput ?
                    <div>
                        <div className="row mt-4">
                            <div className="col-12 col-xl-6">
                                <Radio
                                    name="taskType"
                                    options={radioOption}
                                    defaultValue={currentRadio}
                                    onChange={handleRadioChange}
                                />
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-12 col-xl-6 row p-0">
                                <div className={"col-9" + (currentRadio == "S" ? "" : " d-none")}>
                                    <Select
                                        label={msg.specialTask}
                                        options={formatDataforSelect(specialTask)}
                                        ref={el => specialTaskRef.current.code = el}
                                        require
                                    />
                                </div>
                                <div className={"col-9" + (currentRadio == "T" ? "" : " d-none")}>
                                    <Select
                                        label={msg.taskTemplate}
                                        options={formatDataforSelectTemplate(templateTask)}
                                        ref={el => taskTemplateRef.current.code = el}
                                        require
                                    />
                                </div>
                                <div className="col-3" style={{ paddingTop: 38 }}>
                                    <Button type="add" onClick={handleAdd} />
                                </div>
                            </div>
                        </div>
                    </div>
                    : null
                }
                <div className="pt-4 padding-row">
                    <div className="primary-table" style={{ overflow: "auto" }}>
                        <table className="font-normal table table-striped table-bordered " style={{ width: "100%", minWidth: "800px" }}>
                            <thead>
                                <tr>
                                    <th style={{ width: "10%" }} className="header-table-bold">
                                        {msg.numOrder}
                                    </th>
                                    <th style={{ width: "48%" }} className="header-table-bold">
                                        {msg.taskTemplateName}
                                    </th>
                                    <th style={{ width: "25%" }} className="header-table-bold">
                                        {msg.lastUpdate}
                                    </th>
                                    <th style={{ width: "10%" }} className="header-table-bold">
                                        {msg.taskRequired}
                                    </th>
                                    <th style={{ width: "7%" }} className="header-table-bold">
                                    </th>
                                </tr>
                            </thead>
                            <tbody>

                                {taskAdded.length > 0 ?
                                    taskAdded.map((data, index) => {
                                        return taskItem(data, index)
                                    })
                                    :
                                    <tr>
                                        <td colSpan={5} className="text-center">{msg.tableNoData}</td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="row justify-content-center my-4 pt-3 border-top-grey">
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
        </div >
    )
}