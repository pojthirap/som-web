import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux'
import Modal from "@components/Modal";
import Table from "@components/Table";
import Select from "@components/Select"
import TextField from "@components/TextField";
import Switch from "@components/Switch"
import CriteriaCard from "@components/CriteriaCard";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
import { getInputData, clearInputData, formatObjForSelect, toString } from "@helper";


export default function TemplatePage({ callAPI, customAlert, redirect }) {
    const headerTabel = [
        {
            title: msg.templateCode,
            data: "tpCode",
            type: "code",
            width: "10%"
        },
        {
            title: msg.template,
            data: "tpNameTh",
            type: "string",
            width: "50%"
        },
        {
            title: msg.publicFlag,
            data: "publicFlag",
            type: "flagY",
            width: "10%"
        },
        {
            title: "Manage Template Question",
            type: "button",
            button: "add",
            width: "10%",
            addFunction: async (item) => manageQuestionFunction(item),
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
            showWhenY: "editFlag",
            width: "10%",
            editFunction: (item) => addEditFunction(item)
        }

    ]
    const criteriaRef = useRef({});
    const tableRef = useRef({});
    const inputRef = useRef({});
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [initData, setInitData] = useState(false);
    const [templateCate, setTemplateCate] = useState([])
    const dispatch = useDispatch();

    useEffect(() => {
        searchTemplateCate();
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchTemplateAppForm(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const manageQuestionFunction = (item) => {
        dispatch(redirect("/visitPlant/templateEdit", item))
    }
    const searchTemplateAppForm = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            //inputCriteria.activeFlag = "Y";
            const jsonResponse = await callAPI(apiPath.searchTemplateAppForm, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
            console.log(jsonResponse)
        }
    }

    const searchTemplateCate = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                activeFlag: "Y"
            }
        }
        const jsonResponse = await callAPI(apiPath.searchTemplateCate, jsonRequest);
        let filterData = []
        if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS" && jsonResponse.data && jsonResponse.data.records) {
            filterData = formatObjForSelect(jsonResponse.data.records, "tpCateId", "tpCateNameTh");
        }
        setTemplateCate(filterData);
    }

    const addEditFunction = (item = null) => {
        if (item != null) {
            setInitData(item);

        } else {
            setInitData(null);
        }
        setShowModal(true);
    }

    // const deleteFunction = (item) => {
    //     customAlert(msg.confirmDelete, "Q", async () => {
    //         let jsonRequest = {
    //             tpAppFormId: toString(item.tpAppFormId)
    //         }
    //         const jsonResponse = await callAPI(apiPath.cancelTemplateAppForm, jsonRequest)
    //         if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
    //             searchTemplateAppForm(tableRef.current.getJsonReq());
    //             customAlert(msg.deleteSuccess)
    //         }
    //     })
    // }

    const saveOrUpdate = async () => {
        let inputData = getInputData(inputRef, "N");
        if (!inputData.isInvalid) {
            let jsonRequest = {
                tpNameTh: inputData.data.tpName,
                tpNameEn: inputData.data.tpName,
                tpCateId: toString(inputData.data.tpCateId),
                publicFlag: inputData.data.publicFlag == "0" ? "N" : "Y",
            }
            if (!initData) {
                const jsonResponse = await callAPI(apiPath.addTemplateAppForm, jsonRequest);
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    if (!inputCriteria) setInputCriteria({})
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.addSuccess)
                    closeModal();
                }
            } else {
                jsonRequest.tpAppFormId = toString(initData.tpAppFormId);
                jsonRequest.activeFlag = inputData.data.activeFlag
                const jsonResponse = await callAPI(apiPath.updTemplateAppForm, jsonRequest);
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.editSuccess)
                    closeModal();
                }
            }
        }
    }
    const closeModal = () => {
        setShowModal(false);
        setInitData(null);
    }
    return (
        <div className="col-12">
            <CriteriaCard
                onSearch={handleSearch}
                onClear={() => clearInputData(criteriaRef)}
                btn
                btnType="add"
                btnFunction={() => addEditFunction()}
            >
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-6 mt-2">
                        <TextField label="Template" value="" ref={el => criteriaRef.current.tpNameTh = el}></TextField>
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
                onSelectPage={searchTemplateAppForm}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
            <Modal
                isShow={showModal}
                onSave={saveOrUpdate}
                onClose={closeModal}
                title={msg.template}
            >
                {initData ?
                    <div className="col-12 mt-2">
                        <TextField
                            label={msg.templateCode}
                            value={initData && initData.tpCode ? initData.tpCode : ""}
                            disabled
                        />
                    </div>
                    : null
                }
                <div className="col-12 mt-2">
                    <TextField
                        label={msg.template}
                        value={initData && initData.tpNameTh ? initData.tpNameTh : ""}
                        ref={el => inputRef.current.tpName = el}
                        require
                    />
                </div>
                <div className="col-12 mt-2">
                    <Switch
                        label={msg.publicFlag}
                        defaultValue={initData && initData.publicFlag && initData.publicFlag == "Y" ? true : false}
                        ref={el => inputRef.current.publicFlag = el}
                    />
                </div>
                <div className="col-12 mt-2">
                    <Select
                        placeholder={msg.pleaseSelect}
                        label={msg.templateCategory}
                        options={templateCate}
                        require
                        defaultValue={initData && initData.tpCateId ? initData.tpCateId : ""}
                        ref={el => inputRef.current.tpCateId = el}
                    />
                </div>
                {initData ?
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
                    : null
                }
            </Modal>
        </div>
    )
}