import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import DragAndDropTable from "@components/DragAndDropTable";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import Button from "@components/Button"
import Switch from "@components/Switch"
import { getInputData, clearInputData, toString } from "@helper";
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import * as apiPath from "@apiPath";
import * as msg from "@msg";
export default function SaleGroupEditPage({ callAPI, getPathValue, customAlert, redirectAndClearValue }) {
    const pathValue = getPathValue(useSelector((state) => state.pathValue));
    const cantEdit = "Y" != pathValue.editFlag;
    const inputRef = useRef({});
    const tableRef = useRef({});
    const tableRefInTable = useRef({});
    const [data, setData] = useState();
    const [dataInTemplate, setDataInTemplate] = useState([]);
    const [inputCriteria, setInputCriteria] = useState(null);
    const dispatch = useDispatch();
    const headerTabel = [
        {
            title: msg.questionCode,
            data: "questionCode",
            type: "code",
            width: "30%"
        },
        {
            title: msg.questionName,
            data: "questionNameTh",
            type: "string",
            width: "65%"
        },
    ]
    const headerTabelInTemplate = [
        {
            title: msg.numOrder,
            data: "orderNo",
            type: "code ",
            width: "10%"
        },
        {
            title: msg.questionCode,
            data: "questionCode",
            type: "code ",
            width: "10%"
        },
        {
            title: msg.questionName,
            data: "questionNameTh",
            type: "string",
            width: "28%"
        },
        {
            title: msg.questionRequired,
            data: "requireFlag",
            type: "checkboxY",
            manageDataOnChange: (arr, index, val) => manageReqDataOnCheckBoxChange(arr, index, val),
            width: "7%"
        },
        {
            title: msg.prerequisite,
            data: "prerequistOrderNo",
            type: "selectIndex",
            maxLength: "2",
            allowChar: "num",
            manageDataOnChange: (arr) => manageReqDataOnTextFieldChange(arr),
            width: "7%"
        },
        {
            type: "button",
            button: "delete",
            width: "3%",
            deleteFunction: (item) => deleteFunction(item)
        }
    ]


    useEffect(() => {
        searchTemplateAppQuestionById(tableRefInTable.current.getJsonReq());
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq();
        searchTemplateQuestion(objectReq);
    }, [inputCriteria])

    const handleSearch = async () => {

        let inputData = getInputData(inputRef, "NE");

        if (!inputData.isInvalid) {
            inputData.data.publicFlag = inputData.data.publicFlag ? "Y" : "N";
            setInputCriteria(inputData.data);
        }
    }

    const searchTemplateQuestion = async (pagingCriteria) => {
        if (inputCriteria) {
            pagingCriteria.searchOption = 1;
            inputCriteria.tpAppFormId = toString(pathValue.tpAppFormId)
            inputCriteria.activeFlag = "Y"
            const jsonResponse = await callAPI(apiPath.searchTemplateQuestion, { ...pagingCriteria, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const searchTemplateAppQuestionById = async (pagingCriteria) => {
        pagingCriteria.searchOption = 1;
        let jsonRequest = { ...pagingCriteria, ...{ model: { tpAppFormId: toString(pathValue.tpAppFormId) } } };
        jsonRequest.searchOrder = 1;
        const jsonResponse = await callAPI(apiPath.searchTemplateAppQuestionById, jsonRequest)
        setDataInTemplate(jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : [])
    }

    const clear = () => {
        clearInputData(inputRef)
        setData(null)
        tableRef.current.clear();
    }

    const deleteFunction = async (item) => {
        if (dataInTemplate.length > 1) {
            let tmpArr = dataInTemplate.filter((obj) => obj.orderNo !== item.orderNo);
            manageTableData(tmpArr);
            setDataInTemplate(tmpArr);
        } else {
            customAlert(msg.templateQuestionatLestOne, "W");
        }

    }

    const addFunction = async (item) => {
        let addList = [];
        let alreadyInList = [];


        item.forEach((obj) => {
            const alreadyIn = dataInTemplate.find(tmpObj => toString(tmpObj.questionId) == toString(obj.questionId));
            if (alreadyIn) {
                alreadyInList.push(obj.questionNameTh);
            } else {
                let tmpObj = {
                    tpAppFormId: pathValue.tpAppFormId,
                    questionId: obj.questionId,
                    orderNo: toString(dataInTemplate.length + addList.length + 1),
                    prerequistOrderNo: "",
                    requireFlag: "N",
                    questionCode: obj.questionCode,
                    questionNameTh: obj.questionNameTh,
                    questionNameEn: obj.questionNameEn,
                    ansType: obj.ansType,
                    ansValues: obj.ansValues,
                    publicFlag: obj.publicFlag,
                    activeFlag: obj.activeFlag
                };
                addList.push(tmpObj);
            }
        });

        if (dataInTemplate.length + addList.length <= 20) {
            setDataInTemplate(dataInTemplate => [...dataInTemplate, ...addList]);
            clear();
            if (alreadyInList.length > 0) {

                let alertMsg = []
                alertMsg.push(
                    <div className="row">
                        {msg.questionAlreadyAdd}
                    </div>
                )
                alreadyInList.forEach((obj) => {
                    alertMsg.push(
                        <div className="row">
                            - {obj}
                        </div>
                    )
                });

                customAlert(alertMsg, "W")
            } else {
                customAlert(msg.addSuccess)
            }

        } else {
            customAlert(msg.questionMax20, "W")
        }
    }

    const handleBack = async () => {
        dispatch(redirectAndClearValue("/visitPlant/template"))
    }

    const handleSave = async () => {
        let tmpData = tableRefInTable.current.getData();

        let saveList = [];
        tmpData.forEach((obj) => {
            let tmpObj = {
                tpAppFormId: toString(obj.tpAppFormId),
                questionId: toString(obj.questionId),
                orderNo: toString(obj.orderNo),
                prerequistOrderNo: toString(obj.prerequistOrderNo),
                requireFlag: toString(obj.requireFlag)
            }
            saveList.push(tmpObj)
        });

        const jsonResponse = await callAPI(apiPath.addTemplateAppQuestion, saveList)

        if (!(data && data.errorCode == "S_SUCCESS")) {
            setDataInTemplate(tmpData);
            customAlert(msg.saveSuccess)
        }
    }

    const manageTableData = (arr) => {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i].prerequistOrderNo) {
                let prOrderNo = arr.findIndex(rank => arr[i].prerequistOrderNo == rank.orderNo);
                arr[i].prerequistOrderNo = prOrderNo < i ? toString(prOrderNo + 1) : "";
            }
            arr[i].orderNo = toString(i + 1);
        }

    }
    const manageReqDataOnTextFieldChange = (arr) => {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i].prerequistOrderNo && arr[i].requireFlag == "Y") {
                arr[Number(arr[i].prerequistOrderNo) - 1].requireFlag = "Y"
            }
        }
        return arr;
    }
    const manageReqDataOnCheckBoxChange = (arr, index, val) => {
        if (val) {
            for (let i = arr.length - 1; i >= 0; i--) {
                if (arr[i].prerequistOrderNo && arr[i].requireFlag == "Y") {
                    arr[Number(arr[i].prerequistOrderNo) - 1].requireFlag = "Y"
                }
            }
        } else {
            for (let i = index; i < arr.length; i++) {
                if (arr[i].requireFlag == "N") {
                    arr.forEach((obj, j) => {
                        if (obj.prerequistOrderNo == toString(i + 1)) arr[j].requireFlag = "N";
                    });
                }
            }
        }
        return arr;
    }
    return (
        <div className="col-12 pb-4">
            <div className="content-search ">
                <CriteriaCard disableBtn={cantEdit} onSearch={handleSearch} onClear={clear} disabledBackground>
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.templateCode}</div>
                        <div className="col-4">{pathValue.tpCode}</div>
                    </div>
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.templateName}</div>
                        <div className="col-4">{pathValue.tpNameTh}</div>
                    </div>
                    <div className="row d-flex justify-content-center">
                        <div className="col-12 col-md-4 mt-2">
                            <TextField label={msg.questionCode} allowChar="NUM ENG" maxLength={20} ref={el => inputRef.current.questionCode = el} disabled={cantEdit} />
                        </div>
                        <div className="col-12 col-md-4 mt-2">
                            <TextField label={msg.questionName} ref={el => inputRef.current.questionNameTh = el} disabled={cantEdit} />
                        </div>
                        <div className="col-12 col-md-4 mt-2">
                            <Switch label={msg.publicFlag} ref={el => inputRef.current.publicFlag = el} labelOnTop disabled={cantEdit} />
                        </div>
                    </div>
                </CriteriaCard>
                <Table
                    onSelectPage={searchTemplateQuestion}
                    dataTable={data}
                    headerTabel={headerTabel}
                    label={true}
                    ref={tableRef}
                    multiBtn
                    multiBtnType="add"
                    multiBtnFunction={(item) => addFunction(item)}
                />
            </div>
            <DragAndDropTable
                ref={tableRefInTable}
                dataTable={dataInTemplate}
                headerTabel={headerTabelInTemplate}
                manageData={manageTableData}
                disabledInput={cantEdit}
            />
            <div className="d-flex row mt-4 justify-content-end">
                <div className="col-2 p-0">
                    {cantEdit ?
                        <Button type="close" onClick={handleBack} />
                        :
                        <Button type="save" disabled={dataInTemplate.length === 0} onClick={handleSave} />
                    }
                </div>
            </div>
        </div>
    )
}
