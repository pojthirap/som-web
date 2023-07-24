import { useState, useRef, useEffect } from 'react';
import Modal from "@components/Modal";
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData, toString } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
import Switch from "@components/Switch"
export default function TemplateCategoryPage({ callAPI, customAlert }) {
    const criteriaRef = useRef({});
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [initData, setInitData] = useState(null);

    const headerTabel = [
        {
            title: msg.templateCode,
            data: "tpCateCode",
            type: "code",
            width: "20%"
        },
        {
            title: msg.templateCategory,
            data: "tpCateNameTh",
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
            editFunction: (item) => addEditFunction(item),
        }
    ]

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchTemplateCate(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const searchTemplateCate = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            //inputCriteria.activeFlag = "Y";
            const jsonResponse = await callAPI(apiPath.searchTemplateCate, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const closeModal = (item) => {
        setInitData(null)
        setShowModal(false);
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
                    tpCateNameTh: inputData.data.tpCateName,
                    tpCateNameEn: inputData.data.tpCateName,
                };
                const jsonResponse = await callAPI(apiPath.addTemplateCate, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    if (!inputCriteria) setInputCriteria({})
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.addSuccess)
                }
            }
            else {
                let jsonRequest = {
                    tpCateId: toString(initData.tpCateId),
                    tpCateCode: initData.tpCateCode,
                    tpCateNameTh: inputData.data.tpCateName,
                    tpCateNameEn: inputData.data.tpCateName,
                    activeFlag: inputData.data.activeFlag
                };
                const jsonResponse = await callAPI(apiPath.updTemplateCate, jsonRequest)
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
    //             tpCateId: toString(item.tpCateId),
    //         }
    //         const jsonResponse = await callAPI(apiPath.cancelTemplateCate, jsonRequest)
    //         if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
    //             searchTemplateCate(tableRef.current.getJsonReq());
    //             customAlert(msg.deleteSuccess)
    //         }
    //     })
    // }

    const clear = () => {
        clearInputData(criteriaRef)
        // setData(null)
        // tableRef.current.clear();
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
                        <TextField label={msg.templateCategory} value="" ref={el => criteriaRef.current.tpCateNameTh = el}></TextField>
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
                onSelectPage={searchTemplateCate}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => saveOrUpdate()}
                title={msg.headerDialogTemplateCate}
            >
                {initData ?
                    <div>
                        <TextField label={msg.code} disabled value={initData && initData.tpCateCode ? initData.tpCateCode : ""}></TextField>
                        <TextField label={msg.templateCategory} require value={initData && initData.tpCateNameTh ? initData.tpCateNameTh : ""} ref={el => inputRef.current.tpCateName = el}></TextField>
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
                    <TextField label={msg.templateCategory} require value={initData && initData.tpCateNameTh ? initData.tpCateNameTh : ""} ref={el => inputRef.current.tpCateName = el}></TextField>}
            </Modal>
        </div>
    )
}