import { useState, useRef, useEffect } from 'react';
import Modal from "@components/Modal";
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData, toString } from "@helper";
import * as apiPath from "@apiPath";
import { useDispatch } from 'react-redux'
import * as msg from "@msg";
import Switch from "@components/Switch"
export default function TemplateForSAPage({ callAPI, customAlert, redirect }) {
    const criteriaRef = useRef({});
    const inputRef = useRef({});
    const tableRef = useRef({});
    const dispatch = useDispatch();
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [initData, setInitData] = useState(null);
    const headerTabel = [
        {
            title: msg.numOrder,
            data: "tpCode",
            type: "code",
            width: "10%"
        },
        {
            title: msg.templateForSaName,
            data: "tpNameTh",
            type: "string",
            width: "30%"
        },
        {
            title: msg.masterField,
            data: "masterTotal",
            type: "string",
            width: "20%"
        },
        {
            title: msg.titleField,
            data: "titleTotal",
            type: "string",
            width: "20%"
        },
        {
            title: msg.tableStatus,
            data: "activeFlag",
            type: "useFlag",
            width: "10%"
        },
        {
            type: "button",
            button: "add edit",
            width: "10%",
            addFunction: (item) => addFunction(item),
            editFunction: (item) => addEditFunction(item)
        }
    ]

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchTemplateSaForm(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const searchTemplateSaForm = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            // inputCriteria.activeFlag = "Y";
            const jsonResponse = await callAPI(apiPath.searchTemplateSaForm, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
            console.log(jsonResponse)
        }
    }

    const clear = () => {
        clearInputData(criteriaRef)
        // setData(null)
        // tableRef.current.clear();
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

    const addFunction = (item) => {
        dispatch(redirect("/visitPlant/templateForSAEdit", item))
    }

    const saveOrUpdate = async () => {
        let inputData = getInputData(inputRef, "N");
        if (!inputData.isInvalid) {
            if (initData == null) {
                let jsonRequest = {
                    tpNameTh: inputData.data.tpName,
                    tpNameEn: inputData.data.tpName
                };
                const jsonResponse = await callAPI(apiPath.addTemplateSaForm, jsonRequest)
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
                    tpSaFormId: toString(initData.tpSaFormId),
                    tpCode: initData.tpCode,
                    tpNameTh: inputData.data.tpName,
                    tpNameEn: inputData.data.tpName,
                    activeFlag: inputData.data.activeFlag
                };
                const jsonResponse = await callAPI(apiPath.updTemplateSaForm, jsonRequest)
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
    //             tpSaFormId: toString(item.tpSaFormId),
    //         }
    //         const jsonResponse = await callAPI(apiPath.cancelTemplateSaForm, jsonRequest)
    //         if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
    //             searchTemplateSaForm(tableRef.current.getJsonReq());
    //             customAlert(msg.deleteSuccess)
    //         }
    //     })
    // }

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
                        <TextField label={msg.templateForSaName} value="" ref={el => criteriaRef.current.tpNameTh = el}></TextField>
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
                onSelectPage={searchTemplateSaForm}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => saveOrUpdate()}
                title={msg.templateForSa}
            >
                {initData ?
                    <div>
                        <TextField label={msg.reasonCode} disabled value={initData && initData.tpCode ? initData.tpCode : ""}></TextField>
                        <TextField label={msg.templateForSaName} require value={initData && initData.tpNameTh ? initData.tpNameTh : ""} ref={el => inputRef.current.tpName = el}></TextField>
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
                    <TextField label={msg.templateForSaName} require value={initData && initData.tpNameTh ? initData.tpNameTh : ""} ref={el => inputRef.current.tpName = el}></TextField>
                }
            </Modal>
        </div>
    )
}