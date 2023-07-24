import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import Select from "@components/Select";
import { getInputData, clearInputData, formatObjForSelect, toString } from "@helper";
import { useSelector, useDispatch } from 'react-redux'
import Modal from "@components/Modal";
import * as apiPath from "@apiPath";
import * as msg from "@msg";

export default function TemplateForSAEditPage({ callAPI, getPathValue, customAlert }) {
    const pathValue = getPathValue(useSelector((state) => state.pathValue));
    const inputRef = useRef({});
    const inputRefForData = useRef({});
    const tableRef = useRef({});
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState();
    const [initData, setInitData] = useState(null);
    const [selectType, setSelectType] = useState(null);
    const [select, setSelect] = useState(null);
    const [selectData, setSelectData] = useState([]);
    const headerTabel = [
        {
            title: msg.numOrder,
            type: "rowNum",
            width: "10%"
        },
        {
            title: msg.name,
            data: "titleNameTh",
            type: "string",
            width: "30%"
        },
        {
            title: msg.type,
            data: "titleType",
            type: "string",
            width: "25%"
        },
        {
            title: msg.data,
            data: "lovNameTh",
            type: "string",
            width: "25%"
        },
        {
            title: "",
            type: "button",
            button: "delete",
            width: "10%",
            deleteFunction: (item) => deleteFunction(item),
        },
    ]

    useEffect(() => {
        searchSelectType();
    }, [])

    useEffect(() => {
        searchTemplateSaFormById(tableRef.current.getJsonReq());
    }, [])

    const searchSelectType = async () => {
        const headerTabel = [
            {
                title: "Master",
                lovKeyword: "ANS_LOV_TYPE",
            },
            {
                title: "Title",
                lovKeyword: "ANS_VAL_TYPE",
            }
        ]
        setSelectType(headerTabel);
    }

    const filterDataForType = () => {
        if (!(selectType)) return [];
        return formatObjForSelect(selectType, "lovKeyword", "title");
    }

    const filterDataForData = (listData) => {
        if (!(listData && listData.data && listData.data.records)) return [];
        return formatObjForSelect(listData.data.records, "lovKeyvalue", "lovNameTh");
    }

    const searchTemplateSaFormById = async (pagingCriteria) => {
        let jsonRequest = { ...pagingCriteria, ...{ model: { tpSaFormId: toString(pathValue.tpSaFormId) } } };
        jsonRequest.searchOrder = 0
        const jsonResponse = await callSearchTemplateSaFormById(jsonRequest)
        setData(jsonResponse.data ? jsonResponse.data : null)
    }

    const callSearchTemplateSaFormById = async (jsonRequest) => {
        return await callAPI(apiPath.searchTemplateSaFormById, jsonRequest)
    }

    const closeModal = (item) => {
        setSelectData([])
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

    const searchSelectData = async (item) => {

        clearInputData(inputRefForData)

        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                lovKeyword: item
            }
        }
        const jsonResponse = await callAPI(apiPath.getConfigLov, jsonRequest)
        setSelectData(filterDataForData(jsonResponse));
    }

    const save = async () => {
        let inputData = getInputData(inputRef, "N");
        let inputDataForAns = getInputData(inputRefForData, "N");
        if (!inputData.isInvalid) {
            if (initData == null) {
                let jsonRequest
                if (inputData.data.ansType == "ANS_VAL_TYPE") {
                    jsonRequest = {
                        tpSaFormId: toString(pathValue.tpSaFormId),
                        titleNameTh: inputData.data.titleName,
                        titleNameEn: inputData.data.titleName,
                        ansType: inputData.data.ansType == "ANS_VAL_TYPE" ? "V" : "L",
                        ansValType: inputDataForAns.data.ansData
                    };
                }
                else {
                    jsonRequest = {
                        tpSaFormId: toString(pathValue.tpSaFormId),
                        titleNameTh: inputData.data.titleName,
                        titleNameEn: inputData.data.titleName,
                        ansType: inputData.data.ansType == "ANS_VAL_TYPE" ? "V" : "L",
                        ansLovType: inputDataForAns.data.ansData
                    };
                }

                const jsonResponse = await callAPI(apiPath.addTemplateSaTitle, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    searchTemplateSaFormById(tableRef.current.getJsonReq());
                    customAlert(msg.addSuccess)
                }
            }
            closeModal();
        }
    }

    const deleteFunction = (item) => {
        customAlert(msg.confirmDelete, "Q", async () => {
            let jsonRequest = {
                tpSaTitleId: toString(item.tpSaTitleId)
            }
            const jsonResponse = await callAPI(apiPath.delTemplateSaTitle, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                searchTemplateSaFormById(tableRef.current.getJsonReq());
                customAlert(msg.deleteSuccess)
            }
        })
    }

    return (
        <div className="col-12">
            <div className="content-search ">
                <CriteriaCard hideBtn disabledBackground cardLabel="โครงการ">
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.templateForSaCode}</div>
                        <div className="col-4">: {pathValue.tpCode}</div>
                    </div>
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.templateForSaName}</div>
                        <div className="col-4">: {pathValue.tpNameTh}</div>
                    </div>
                </CriteriaCard>
            </div>
            <Table
                onSelectPage={searchTemplateSaFormById}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
                customLabel={msg.listData}
                btn
                btnType="add"
                btnFunction={() => addEditFunction()}
            />
            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => save()}
                title={msg.templateForSaTitleDialog}
            >
                <TextField label={msg.templateForSaId} disabled value={pathValue && pathValue.tpCode ? pathValue.tpCode : ""}></TextField>
                <TextField label={msg.name} value={initData && initData.titleNameTh ? initData.titleNameTh : ""} ref={el => inputRef.current.titleName = el} require></TextField>
                <Select label={msg.type} placeholder={msg.pleaseSelect} require onChange={(item) => searchSelectData(item)} options={filterDataForType()} ref={el => inputRef.current.ansType = el} />
                <Select label={msg.data} placeholder={msg.pleaseSelect} require options={selectData} ref={el => inputRefForData.current.ansData = el} />
            </Modal>
        </div>
    )
}