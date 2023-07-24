import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import Modal from "@components/Modal";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import Select from "@components/Select"
import DatePicker from '@components/DatePicker';
import Switch from "@components/Switch"
import * as apiPath from "@apiPath";
import * as msg from "@msg";
import moment from 'moment';
import { getInputData, clearInputData, toString, formatObjForSelect } from "@helper";


export default function UserGroup({ callAPI, customAlert }) {
    const headerTabel = [

        {
            title: msg.numOrder,
            type: "rowNum"
        },
        {
            title: msg.userGroup,
            data: "groupNameTh",
            type: "string"
        },
        {
            title: msg.sysGroupCode,
            data: "permObjCode",
            type: "string"
        },
        {
            title: msg.sysGroupName,
            data: "permObjNameTh",
            type: "string"
        },
        {
            title: msg.sysGroupStatus,
            data: "activeFlag",
            type: "useFlag"
        },
        {
            title: msg.effectiveDate,
            data: "effectiveDate",
            type: "date"
        },
        {
            title: msg.expiryDate,
            data: "expiryDate",
            type: "date"
        },
        {
            type: "button",
            button: "edit",
            editFunction: (item) => addEditFunction(item),
        }
    ]
    const criteriaRef = useRef({});
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [initData, setInitData] = useState(null);
    const [admGroupData, setAdmGroupData] = useState([])
    const [admPermData, setAdmPermData] = useState([])
    const [dateFromValue, setDateFromValue] = useState();
    // const [dateToValue, setDateToValue] = useState();
    // const today = moment()

    useEffect(() => {
        searchAdmGroup();
        searchAdmPerm()
    }, [])
    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchAdmGroupApp(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const searchAdmGroupApp = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            const jsonResponse = await callAPI(apiPath.searchAdmGroupApp, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
            console.log(jsonResponse)
        }
    }

    const searchAdmGroup = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 2,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.searchAdmGroup, jsonRequest)
        const data = jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 ? formatObjForSelect(jsonResponse.data.records, "groupId", "groupNameTh") : [];
        setAdmGroupData(data);

    }

    const searchAdmPerm = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 2,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.searchAdmPermObject, jsonRequest)
        const data = jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 ? formatObjForSelect(jsonResponse.data.records, "permObjId", "permObjNameTh") : [];
        setAdmPermData(data);
        console.log(jsonResponse)

    }
    const clear = () => {
        clearInputData(criteriaRef)
    }

    const addEditFunction = (item = null) => {
        console.log(item)
        if (item != null) {
            setInitData(item);
            setDateFromValue(item.effectiveDate)
            // setDateToValue(item.expiryDate)

        } else {
            setInitData(null);
            setDateFromValue(null)
            // setDateToValue(null)
        }
        setShowModal(true);
    }

    const saveOrUpdate = async () => {
        let inputData = getInputData(inputRef, "NE");
        if (!inputData.isInvalid) {
            if (initData == null) {
                let jsonRequest = { ...inputData.data };
                const jsonResponse = await callAPI(apiPath.addAdmGroupApp, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    if (!inputCriteria) setInputCriteria({})
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.addSuccess)
                    colseModal();
                }
            } else {
                let jsonRequest = {
                    groupAppId: toString(initData.groupAppId),
                    ...inputData.data
                };
                // jsonRequest.activeFlag = inputData.data.activeFlag ? "Y" : "N"
                const jsonResponse = await callAPI(apiPath.updAdmGroupApp, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.editSuccess)
                    colseModal();
                }
            }
        }
    }

    const colseModal = () => {
        setInitData(null)
        setShowModal(false);

    }

    return (
        <div className="col-12">
            <CriteriaCard
                onSearch={handleSearch}
                onClear={clear}
                btn
                btnType="add"
                btnFunction={() => addEditFunction()}
            >
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-5 mt-2">
                        <Select
                            hideEmptyOption
                            label={msg.userGroup}
                            placeholder={msg.pleaseSelect}
                            ref={el => criteriaRef.current.groupId = el}
                            options={admGroupData}
                        />
                    </div>
                    <div className="col-12 col-md-5 mt-2">
                        <Select
                            hideEmptyOption
                            label={msg.systemType}
                            placeholder={msg.pleaseSelect}
                            ref={el => criteriaRef.current.appId = el}
                            options={admPermData}

                        />
                    </div>
                    <div className="col-12 col-md-2 mt-2">
                        <Switch
                            label={msg.notWhithInActive}
                            ref={el => criteriaRef.current.activeFlag = el}
                            labelOnTop
                            returnNullWhenN
                        />
                    </div>
                </div>
            </CriteriaCard>
            <Table
                onSelectPage={searchAdmGroupApp}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
            <Modal isShow={showModal}
                title={msg.headerDialogUserGroup}
                onSave={() => saveOrUpdate()}
                onClose={() => colseModal()}
            >
                <div className="col-12 mt-2">
                    <Select
                        disabled={initData ? true : false}
                        label={msg.userGroup}
                        placeholder={msg.pleaseSelect}
                        defaultValue={initData && initData.groupId ? initData.groupId : ""}
                        ref={el => inputRef.current.groupId = el}
                        options={admGroupData}
                        require
                    />
                </div>
                <div className="col-12 mt-2">
                    <Select
                        disabled={initData ? true : false}
                        label={msg.systemType}
                        placeholder={msg.pleaseSelect}
                        defaultValue={initData && initData.appId ? initData.appId : ""}
                        ref={el => inputRef.current.appId = el}
                        options={admPermData}
                        require
                    />
                </div>

                <div className="col-12 mt-2">
                    <DatePicker
                        label={msg.effectiveDate}
                        showTodayButton
                        ref={el => inputRef.current.effectiveDate = el}
                        onChange={setDateFromValue}
                        // focusDate={dateToValue}
                        defaultValue={initData && initData.effectiveDate ? initData.effectiveDate : null}
                        require
                    />
                </div>
                <div className="col-12 mt-2">
                    <DatePicker
                        label={msg.expiryDate}
                        showTodayButton
                        ref={el => inputRef.current.expiryDate = el}
                        defaultValue={initData && initData.expiryDate ? initData.expiryDate : null}
                        // onChange={setDateToValue}
                        // currentFocus={dateFromValue}
                        focusDate={dateFromValue}
                        minDate={dateFromValue}
                        maxDate={dateFromValue ? moment(dateFromValue).add(365, 'days').format("YYYY-MM-DD").concat("T00:00:00") : null}
                    />
                </div>
                {initData ?
                    <div className="col-12 mt-2">
                        <Switch
                            labelOnRight={msg.activeAndInActive}
                            label={msg.sysGroupStatus}
                            defaultValue={initData ? (initData.activeFlag && initData.activeFlag == "Y" ? true : false) : true}
                            ref={el => inputRef.current.activeFlag = el}
                            returnYAndN
                        />
                    </div>
                    :
                    null
                }
            </Modal>
        </div>
    )
}