import { useState, useRef, useEffect } from 'react';
import Modal from "@components/Modal";
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData, toString } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
import Switch from "@components/Switch"
export default function ReasonNotVisitPage({ callAPI, customAlert }) {
    const criteriaRef = useRef({});
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [initData, setInitData] = useState(null);
    const headerTabel = [
        {
            title: msg.reasonCode,
            data: "reasonCode",
            type: "code",
            width: "20%"
        },
        {
            title: msg.reasonName,
            data: "reasonNameTh",
            type: "string",
            width: "60%"
        },
        {
            title: msg.tableStatus,
            data: "activeFlag",
            type: "useFlag",
            width: "10%"
        },
        {
            type: "button",
            button: "edit",
            width: "10%",
            editFunction: (item) => addEditFunction(item)
        }
    ]

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchPlanReasonNotVisit(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const searchPlanReasonNotVisit = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            //inputCriteria.activeFlag = "Y";
            const jsonResponse = await callAPI(apiPath.searchPlanReasonNotVisit, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const clear = () => {
        clearInputData(criteriaRef)
        // setData(null)
        // tableRef.current.clear();
    }

    const saveOrUpdate = async () => {
        let inputData = getInputData(inputRef, "N");
        if (!inputData.isInvalid) {
            if (initData == null) {
                let jsonRequest = {
                    reasonNameTh: inputData.data.reasonName,
                    reasonNameEn: inputData.data.reasonName
                };
                const jsonResponse = await callAPI(apiPath.addPlanReasonNotVisit, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    if (!inputCriteria) setInputCriteria({})
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.addSuccess)
                }
            } else {
                let jsonRequest = {
                    reasonNotVisitId: toString(initData.reasonNotVisitId),
                    reasonCode: initData.reasonCode,
                    reasonNameTh: inputData.data.reasonName,
                    reasonNameEn: inputData.data.reasonName,
                    activeFlag: inputData.data.activeFlag
                };
                const jsonResponse = await callAPI(apiPath.updPlanReasonNotVisit, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.editSuccess)
                }
            }
            closeModal();
        }
    }

    const closeModal = (item) => {
        setInitData(null)
        setShowModal(false);
    }

    // const deleteFunction = (item) => {
    //     customAlert(msg.confirmDelete, "Q", async () => {
    //         let jsonRequest = {
    //             reasonNotVisitId: toString(item.reasonNotVisitId),
    //         }
    //         const jsonResponse = await callAPI(apiPath.cancelPlanReasonNotVisit, jsonRequest)
    //         if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
    //             searchPlanReasonNotVisit(tableRef.current.getJsonReq());
    //             customAlert(msg.deleteSuccess)
    //         }
    //     })
    // }

    const addEditFunction = (item = null) => {
        if (item != null) {
            setInitData(item);

        } else {
            setInitData(null);
        }
        setShowModal(true);
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
                    <div className="col-12 col-md-6 mt-2">
                        <TextField label={msg.reasonName} value="" ref={el => criteriaRef.current.reasonNameTh = el}></TextField>
                    </div>
                    <div className="col-12 col-md-3 mt-2">
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
                onSelectPage={searchPlanReasonNotVisit}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => saveOrUpdate()}
                title={msg.reasonName}
            >
                {initData ?
                    <div>
                        <TextField label={msg.reasonCode} disabled value={initData && initData.reasonCode ? initData.reasonCode : ""}></TextField>
                        <TextField label={msg.reasonName} require value={initData && initData.reasonNameTh ? initData.reasonNameTh : ""} ref={el => inputRef.current.reasonName = el}></TextField>
                        <Switch
                            labelOnRight={msg.activeAndInActive}
                            label={msg.sysGroupStatus}
                            defaultValue={initData ? (initData.activeFlag && initData.activeFlag == "Y" ? true : false) : true}
                            ref={el => inputRef.current.activeFlag = el}
                            disabled={!initData}
                            returnYAndN
                        />
                    </div>
                    :
                    <TextField label={msg.reasonName} require value={initData && initData.reasonNameTh ? initData.reasonNameTh : ""} ref={el => inputRef.current.reasonName = el}></TextField>
                }
            </Modal>
        </div>
    )
}