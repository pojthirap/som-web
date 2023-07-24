import { useState, useRef, useEffect } from 'react';
import Modal from "@components/Modal";
import Table from "@components/Table";
import Select from "@components/Select"
import TextField from "@components/TextField";
import Switch from "@components/Switch"
import CriteriaCard from "@components/CriteriaCard";
import Button from "@components/Button"
import * as apiPath from "@apiPath";
import * as msg from "@msg";
import { getInputData, clearInputData, formatObjForSelect, toString } from "@helper";

export default function QuestionPage({ callAPI, customAlert }) {

    const headerTabel = [
        {
            title: msg.questionCode,
            data: "questionCode",
            type: "code",
            width: "10%"
        },
        {
            title: msg.questionName,
            data: "questionNameTh",
            type: "string",
            width: "50%"
        },
        {
            title: msg.questionCategory,
            data: "lovNameTh",
            type: "string",
            width: "10%"
        },
        {
            title: msg.publicFlag,
            data: "publicFlag",
            type: "flagY",
            width: "10%"
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
            editFunction: (item) => addEditFunction(item),
        }
    ]
    const criteriaRef = useRef({});
    const tableRef = useRef({});
    const inputRef = useRef({});
    const answerInputRef = useRef([]);
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [initData, setInitData] = useState(false);
    const [answerData, setAnswerData] = useState([""]);
    const [ansTypeSelectData, setAnsTypeSelectData] = useState([]);
    const [crrAnsType, setCrrAnsType] = useState(0);

    useEffect(() => {
        getQuestionAnsType();
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchTemplateQuestion(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const searchTemplateQuestion = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            //inputCriteria.activeFlag = "Y";
            const jsonResponse = await callAPI(apiPath.searchTemplateQuestion, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
            console.log(jsonResponse);
        }
    }

    const addEditFunction = (item = null) => {
        if (item != null) {
            setInitData(item);
            if (isShowAns(item.ansType)) {
                let arrAnsValues = item.ansValues.split("|");
                setAnswerData(arrAnsValues);
            } else {
                setAnswerData([""]);
            }
            setCrrAnsType(item.ansType);

        } else {
            setInitData(null);
            setAnswerData([""]);
            setCrrAnsType(0);
        }
        setShowModal(true);
    }


    const saveOrUpdate = async () => {
        let inputData = getInputData(inputRef, "N");
        let answerInputData = getInputData(answerInputRef, "N");
        if (!inputData.isInvalid && !answerInputData.isInvalid) {
            if ((inputData.data.ansType == "2" || inputData.data.ansType == "4" || inputData.data.ansType == "5") && answerInputData.dataSize < 2) {
                customAlert(msg.questionatLestSecond)
            }
            else {
                let jsonRequest = {
                    questionNameTh: inputData.data.questionName,
                    questionNameEn: inputData.data.questionName,
                    ansType: toString(inputData.data.ansType),
                    publicFlag: inputData.data.publicFlag == "0" ? "N" : "Y",
                }
                jsonRequest.ansValues = answerInputData.data.join("|");
                if (initData == null) {
                    const jsonResponse = await callAPI(apiPath.addTemplateQuestion, jsonRequest)
                    if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                        if (!inputCriteria) setInputCriteria({})
                        clearInputData(criteriaRef)
                        let criteriaData = getInputData(criteriaRef, "NE");
                        setInputCriteria(criteriaData.data);
                        customAlert(msg.addSuccess)
                        closeModal();
                    }
                } else {
                    jsonRequest.questionId = toString(initData.questionId);
                    jsonRequest.activeFlag = inputData.data.activeFlag
                    // jsonRequest.questionCode = initData.questionCode;
                    const jsonResponse = await callAPI(apiPath.updTemplateQuestion, jsonRequest)
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
    }


    // const deleteFunction = (item) => {
    //     customAlert(msg.confirmDelete, "Q", async () => {
    //         let jsonRequest = {
    //             questionId: toString(item.questionId)
    //         }
    //         const jsonResponse = await callAPI(apiPath.deleteQuestion, jsonRequest)
    //         if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
    //             searchTemplateQuestion(tableRef.current.getJsonReq());
    //             customAlert(msg.deleteSuccess)
    //         }
    //     })
    // }

    const closeModal = () => {
        setShowModal(false);
        setAnswerData([""]);
        setInitData(null);
        setCrrAnsType(0);
    }

    const addAnswer = () => {
        if (answerData.length < 20) {
            setAnswerData(answerData => [...answerData, ""]);
            clearInputData(inputRef, true)
        } else {
            customAlert(msg.questionCantMoreThan20, "W");
        }
    }
    const removeAnswer = (index) => {
        if (answerData.length > 1) {
            setAnswerData(answerData.filter((_, i) => i !== index))
            clearInputData(inputRef, true)
        } else {
            customAlert(msg.questionatLestOne, "W");
        }
    }
    const onChangeAnswer = (index, text) => {
        answerData[index] = text;
    }

    const getQuestionAnsType = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                lovKeyword: "QUESTION_ANS_TYPE",
                activeFlag: "Y"
            }
        }
        const jsonResponse = await callAPI(apiPath.getConfigLov, jsonRequest);
        setAnsTypeSelectData(jsonResponse.data ? jsonResponse.data : null);
    }

    const filterDataForQuestionAnsType = () => {
        if (!(ansTypeSelectData && ansTypeSelectData.records)) return [];
        return formatObjForSelect(ansTypeSelectData.records, "lovKeyvalue", "lovNameTh");
    }

    const isShowAns = (ansType) => {
        return ansType == 2 || ansType == 3 || ansType == 4 || ansType == 5;
    }

    const onChangeAnsType = (value) => {
        setCrrAnsType(value)
        setAnswerData([""]);
    }

    const AnswerFrom = () => {

        return (
            <div>
                <div className="col-12 mt-2">{msg.answer}</div>

                {answerData.map((item, index) => {
                    return <Answer key={index} index={index} value={item} />
                })}
                <div className="row mt-2 justify-content-center">
                    <div className="col-4">
                        <Button type="addInfo" customLabel={msg.answer} onClick={addAnswer} />
                    </div>
                </div>

            </div>
        )
    }

    const Answer = ({ index, value }) => {
        return (
            <div className="col-12 mt-2 row">
                <div className="col-1 pl-2">
                    <div className="d-flex align-items-center" style={{ height: 48 }}>
                        {index + 1}.
                    </div>
                </div>
                <div className="col-10 pl-0 pr-1">
                    <TextField
                        value={toString(value)}
                        ref={el => answerInputRef.current[index] = el}
                        onChange={(text) => onChangeAnswer(index, text)}
                        require
                        hideLabel
                        preventPipe
                        label={msg.answer}
                        maxLength={250}
                    />
                </div>
                <div className="col-1 p-0">
                    <div className="d-flex align-items-center" style={{ height: 48 }}>
                        <Button type="del" onClick={() => removeAnswer(index)} />
                    </div>
                </div>

            </div>
        )
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
                        <TextField label={msg.questionName} value="" ref={el => criteriaRef.current.questionNameTh = el}></TextField>
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
                onSelectPage={searchTemplateQuestion}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
            <Modal
                isShow={showModal}
                onSave={saveOrUpdate}
                onClose={closeModal}
                title={msg.question}
            >
                {initData ?
                    <div className="col-12">
                        <TextField
                            label={msg.questionCode}
                            disabled
                            value={initData && initData.questionCode ? initData.questionCode : ""}
                        />
                    </div>
                    : null
                }
                <div className="col-12 mt-2">
                    <TextField
                        label={msg.questionName}
                        require
                        value={initData && initData.questionNameTh ? initData.questionNameTh : ""}
                        ref={el => inputRef.current.questionName = el}
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
                        onChange={onChangeAnsType}
                        label={msg.questionCategory}
                        options={filterDataForQuestionAnsType()}
                        require
                        defaultValue={initData && initData.ansType ? initData.ansType : ""}
                        ref={el => inputRef.current.ansType = el}
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
                {isShowAns(crrAnsType) ? <AnswerFrom /> : null}
            </Modal>
        </div>
    )
}