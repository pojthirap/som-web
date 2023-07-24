import { useState, useRef, useEffect } from 'react';
import Modal from "@components/Modal";
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData, toString } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
import Switch from "@components/Switch"
export default function ActtachmentCatagoriesPage({ callAPI, customAlert }) {
    const criteriaRef = useRef({});
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [initData, setInitData] = useState(null);
    const headerTabel = [
        {
            title: msg.attachCateCode,
            data: "attachCateCode",
            type: "code",
            width: "20%"
        },
        {
            title: msg.attachCateType,
            data: "attachCateNameTh",
            type: "string",
            width: "55%"
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
            deleteFunction: (item) => deleteFunction(item),
        }
    ]

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchAttachCate(objectReq)
    }, [inputCriteria])

    const searchAttachCate = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            // inputCriteria.activeFlag = "Y";
            const jsonResponse = await callAPI(apiPath.searchAttachCate, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
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
        let inputData = getInputData(inputRef, "N");
        if (!inputData.isInvalid) {
            if (initData == null) {
                let jsonRequest = {
                    attachCateNameTh: inputData.data.attachCateName,
                    attachCateNameEn: inputData.data.attachCateName
                };
                const jsonResponse = await callAPI(apiPath.addAttachCate, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    if (!inputCriteria) setInputCriteria({})
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.addSuccess)
                }
            } else {
                let jsonRequest = {
                    attachCateId: toString(initData.attachCateId),
                    attachCateCode: initData.attachCateCode,
                    attachCateNameTh: inputData.data.attachCateName,
                    attachCateNameEn: inputData.data.attachCateName,
                    activeFlag: inputData.data.activeFlag
                };
                const jsonResponse = await callAPI(apiPath.updAttachCate, jsonRequest)
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

    // const deleteFunction = (item) => {
    //     customAlert(msg.confirmDelete, "Q", async () => {
    //         let jsonRequest = {
    //             attachCateId: toString(item.attachCateId)
    //         }
    //         const jsonResponse = await callAPI(apiPath.cancelAttachCate, jsonRequest)
    //         if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
    //             searchAttachCate(tableRef.current.getJsonReq());
    //             customAlert(msg.deleteSuccess)
    //         }
    //     })
    // }

    const clear = () => {
        clearInputData(criteriaRef)
        // setData(null)
        // tableRef.current.clear();
    }

    const closeModal = (item) => {
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
                    <div className="col-12 col-md-6 mt-2">
                        <TextField label={msg.attachCateType} value="" ref={el => criteriaRef.current.attachCateNameTh = el}></TextField>
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
                onSelectPage={searchAttachCate}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => saveOrUpdate()}
                title={msg.attachCateType}
            >
                {initData ?
                    <div>
                        <TextField label={msg.attachCateCode} disabled value={initData && initData.attachCateCode ? initData.attachCateCode : ""}></TextField>
                        <TextField label={msg.attachCateType} require value={initData && initData.attachCateNameTh ? initData.attachCateNameTh : ""} ref={el => inputRef.current.attachCateName = el}></TextField>
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
                    <TextField label={msg.attachCateType} require value={initData && initData.attachCateNameTh ? initData.attachCateNameTh : ""} ref={el => inputRef.current.attachCateName = el}></TextField>
                }
            </Modal>
        </div>
    )
}