import { useState, useRef, useEffect } from 'react';
import { getInputData, clearInputData, toString } from "@helper";
import { useDispatch } from 'react-redux'
import Table from "@components/Table";
import Modal from "@components/Modal";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
import Switch from "@components/Switch"

export default function TemplateStockCardPage({ callAPI, customAlert, redirect }) {
    const headerTabel = [
        {
            title: msg.templateStockCardCode,
            data: "tpCode",
            type: "code"
        },
        {
            title: msg.templateStockCardName,
            data: "tpNameTh",
            type: "string"
        },
        {
            title: msg.by,
            data: "createUser",
            type: "text-center"
        },
        {
            title: msg.lastUpdate,
            data: "updateDtm",
            type: "date"
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
            addFunction: (item) => addProduct(item),
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
    const dispatch = useDispatch();


    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchTemplateStockCard(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const searchTemplateStockCard = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            // inputCriteria.activeFlag = "Y";
            const jsonResponse = await callAPI(apiPath.searchTemplateStockCard, { ...jsonRequest, ...{ model: inputCriteria } })
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
            let jsonRequest = {
                tpNameTh: inputData.data.tpName,
                tpNameEn: inputData.data.tpName
            };
            if (initData == null) {
                const jsonResponse = await callAPI(apiPath.addTemplateStockCard, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    if (!inputCriteria) setInputCriteria({})
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.addSuccess)
                }
            } else {
                jsonRequest.tpStockCardId = toString(initData.tpStockCardId)
                jsonRequest.activeFlag = inputData.data.activeFlag
                const jsonResponse = await callAPI(apiPath.updTemplateStockCard, jsonRequest)
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
    //             tpStockCardId: toString(item.tpStockCardId)
    //         }
    //         const jsonResponse = await callAPI(apiPath.cancelTemplateStockCard, jsonRequest)
    //         if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
    //             searchTemplateStockCard(tableRef.current.getJsonReq());
    //             customAlert(msg.deleteSuccess)
    //         }
    //     })
    // }

    const addProduct = (item) => {
        dispatch(redirect("/visitPlant/templateStockCardAddProduct", item))
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
                    <div className="col-12 col-md-6 mt-2">
                        <TextField label={msg.templateStockCardName} value="" ref={el => criteriaRef.current.tpNameTh = el}></TextField>
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
                onSelectPage={searchTemplateStockCard}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
            <Modal isShow={showModal}
                title={msg.headerDialogTemplateStockCard}
                onSave={() => saveOrUpdate()}
                onClose={() => colseModal()}
            >
                {initData ?
                    <div>
                        <div className="col-12 mt-2">
                            <TextField label={msg.templateStockCardCode} disabled value={initData && initData.tpCode ? initData.tpCode : ""}></TextField>
                        </div>
                        <div className="col-12 mt-2">
                            <TextField label={msg.templateStockCardName} require value={initData && initData.tpNameTh ? initData.tpNameTh : ""} ref={el => inputRef.current.tpName = el}></TextField>
                        </div>
                        <div className="col-12 mt-2">
                            <Switch
                                labelOnRight={msg.activeAndInActive}
                                label={msg.sysGroupStatus}
                                defaultValue={initData ? (initData.activeFlag && initData.activeFlag == "Y" ? true : false) : true}
                                ref={el => inputRef.current.activeFlag = el}
                                disabled={!initData}
                                returnYAndN
                            />
                        </div>
                    </div>
                    :
                    <div className="col-12 mt-2">
                        <TextField label={msg.templateStockCardName} require value={initData && initData.tpNameTh ? initData.tpNameTh : ""} ref={el => inputRef.current.tpName = el}></TextField>
                    </div>
                }
            </Modal>
        </div>
    )
}