import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import Modal from "@components/Modal";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import Switch from "@components/Switch"
import * as apiPath from "@apiPath";
import * as msg from "@msg";
import { getInputData, clearInputData, toString } from "@helper";

export default function BusinessUnitPage({ callAPI, customAlert }) {
    const headerTabel = [
        {
            title: msg.businessUnitCode,
            data: "buCode",
            type: "code"
        },
        {
            title: msg.businessUnitName,
            data: "buNameTh",
            type: "string"
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

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchBusinessUnit(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const searchBusinessUnit = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            // inputCriteria.activeFlag = "Y";
            const jsonResponse = await callAPI(apiPath.searchBusinessUnit, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const clear = () => {
        clearInputData(criteriaRef)
        // setData(null)
        // tableRef.current.clear();
    }

    const addEditFunction = (item = null) => {
        if (item != null) {
            setInitData(item);

        } else {
            setInitData(null);
        }
        setShowModal(true);
    }

    const saveOrUpdate = async () => {
        let inputData = getInputData(inputRef, "NE");
        if (!inputData.isInvalid) {
            if (initData == null) {
                let jsonRequest = {
                    buNameTh: inputData.data.buNameTh,
                    buNameEn: inputData.data.buNameTh
                };
                const jsonResponse = await callAPI(apiPath.addBusinessUnit, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    if (!inputCriteria) setInputCriteria({})
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.addSuccess)
                }
            } else {
                let jsonRequest = {
                    buId: toString(initData.buId),
                    buCode: initData.buCode,
                    buNameTh: inputData.data.buNameTh,
                    buNameEn: inputData.data.buNameTh,
                    activeFlag: inputData.data.activeFlag
                };
                const jsonResponse = await callAPI(apiPath.updateBusinessUnit, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.editSuccess)
                }
            }
            colseModal();
        }
    }
    // const deleteFunction = (item) => {
    //     customAlert(msg.confirmDelete, "Q", async () => {
    //         let jsonRequest = {
    //             buId: toString(item.buId)
    //         }
    //         const jsonResponse = await callAPI(apiPath.deleteBusinessUnit, jsonRequest)
    //         if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
    //             searchBusinessUnit(tableRef.current.getJsonReq());
    //             customAlert(msg.deleteSuccess)
    //         }
    //     })
    // }
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
                        <TextField label={msg.businessUnitCode} allowChar="NUM" maxLength={10} value="" ref={el => criteriaRef.current.buCode = el}></TextField>
                    </div>
                    <div className="col-12 col-md-5 mt-2">
                        <TextField label={msg.businessUnitName} value="" ref={el => criteriaRef.current.buNameTh = el}></TextField>
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
                onSelectPage={searchBusinessUnit}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
            <Modal isShow={showModal}
                title={msg.headerDialogBusinessUnit}
                onSave={() => saveOrUpdate()}
                onClose={() => colseModal()}
            >
                {initData ?
                    <div className="col-12 mt-2">
                        <TextField label={msg.businessUnitCode} disabled value={initData && initData.buCode ? initData.buCode : ""}></TextField>
                    </div>
                    :
                    null
                }
                <div className="col-12 mt-2">
                    <TextField label={msg.businessUnitName} require value={initData && initData.buNameTh ? initData.buNameTh : ""} ref={el => inputRef.current.buNameTh = el}></TextField>
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