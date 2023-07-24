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
import { useDropzone } from 'react-dropzone';
import Button from "@components/Button"
export default function SaleGroupEditPage({ callAPI, getPathValue, customAlert, updateCurrentPathValue }) {
    const pathValue = getPathValue(useSelector((state) => state.pathValue));
    const inputRef = useRef({});
    const tableRef = useRef({});
    const dispatch = useDispatch();
    const tableRefByGroupCode = useRef({});
    const [data, setData] = useState();
    const [dataByGroupCode, setDataByGroupCode] = useState();
    const [inputCriteria, setInputCriteria] = useState(null);
    const [selectData, setSelectData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [showModalSuccess, setShowModalSuccess] = useState(false);
    const [disableUpload, setDisableUpload] = useState(true);
    const [file, setFile] = useState();
    const [resFileUpload, setResFileUpload] = useState();
    const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
        // Disable click and keydown behavior
        accept: 'application/vnd.ms-excel , application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        noClick: true,
        noKeyboard: true
    });

    console.log(pathValue)
    useEffect(() => {
        if (file) {
            setDisableUpload(false)
        }
    }, [file])

    useEffect(() => {
        setFile(acceptedFiles[0])
    }, [acceptedFiles])

    const headerTabel = [
        {
            title: msg.employeeCode,
            data: "empId",
            type: "code"
        },
        {
            title: msg.employeeName,
            data: ["firstName", "lastName"],
            type: "string"
        },
    ]
    const headerTabelByGroupCode = [
        {
            title: msg.numOrder,
            type: "rowNum"
        },
        {
            title: msg.employeeCode,
            data: "empId",
            type: "code "
        },
        {
            title: msg.employeeName,
            data: ["firstName", "lastName"],
            type: "string"
        },
        {
            title: msg.del,
            type: "button",
            button: "delete",
            deleteFunction: (item) => deleteFunction(item),
        },
    ]
    useEffect(() => {
        searchAdmEmployeeByGroupCode(tableRefByGroupCode.current.getJsonReq());
        getEmpSupvisor();
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq();
        searchAdmEmployee(objectReq);
    }, [inputCriteria])

    const handleSearch = async () => {

        let inputData = getInputData(inputRef, "NE");

        if (inputData.dataSize > 0) {
            if (!inputData.isInvalid) {
                setInputCriteria(inputData.data);
            }
        } else {

            customAlert(msg.atLestOne, "W");
        }
    }

    const searchAdmEmployee = async (pagingCriteria) => {
        if (inputCriteria) {
            const jsonResponse = await callSearchAdmEmployee({ ...pagingCriteria, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const searchAdmEmployeeByGroupCode = async (pagingCriteria) => {
        let jsonRequest = { ...pagingCriteria, ...{ model: { groupCode: pathValue.groupCode } } };
        jsonRequest.searchOrder = 1
        const jsonResponse = await callSearchAdmEmployee(jsonRequest)
        setDataByGroupCode(jsonResponse.data ? jsonResponse.data : null)
    }

    const callSearchAdmEmployee = async (jsonRequest) => {
        return await callAPI(apiPath.searchAdmEmployee, jsonRequest)
    }

    const getEmpSupvisor = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 1,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                groupCode: pathValue.groupCode
            }
        }
        const jsonResponse = await callAPI(apiPath.getEmpSupvisor, jsonRequest);
        setSelectData(jsonResponse.data ? jsonResponse.data : null);
    }

    const clear = () => {
        clearInputData(inputRef)
        setData(null)
        tableRef.current.clear();
    }

    const deleteFunction = async (item) => {
        customAlert(msg.confirmDelete, "Q", async () => {
            let jsonRequest = {
                empId: item.empId
            }
            const jsonResponse = await callAPI(apiPath.deleteSaleGroupWithOutSaleRep, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                searchAdmEmployeeByGroupCode(tableRefByGroupCode.current.getJsonReq());
                getEmpSupvisor();
                customAlert(msg.deleteSuccess)
            }
        })

    }

    const addFunction = async (item) => {
        let empList = [];
        let alreadyHaveGroup = []
        item.forEach((obj) => {
            if (obj.groupCode) alreadyHaveGroup.push(obj.firstName + " " + obj.lastName);
            empList.push(obj.empId);
        });

        let jsonRequest = {
            groupCode: pathValue.groupCode,
            empIdList: empList,
            approveEmpId: toString(pathValue.managerEmpId)
        }
        if (alreadyHaveGroup.length > 0) {
            let alertMsg = []
            alertMsg.push(
                <div className="row">
                    {msg.employeeHaveGroup}
                </div>
            )
            alreadyHaveGroup.forEach((obj) => {
                alertMsg.push(
                    <div className="row">
                        - {obj}
                    </div>
                )
            });

            customAlert(alertMsg, "Q", async () => {
                callAddSaleRep(jsonRequest);
            })
        } else {
            callAddSaleRep(jsonRequest);
        }
    }

    const filterDataForSelect = () => {
        if (!(selectData && selectData.records)) return [];
        return formatObjForSelect(selectData.records, "empId", ["empId", ["titleName", "firstName", "lastName"]], " : ");
    }

    const callAddSaleRep = async (jsonRequest) => {
        const jsonResponse = await callAPI(apiPath.updateSaleGroupToSaleRep, jsonRequest)
        if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
            searchAdmEmployeeByGroupCode(tableRefByGroupCode.current.getJsonReq());
            getEmpSupvisor();
            clear();
            customAlert(msg.addSuccess)
        }
    }

    const onChangeLeader = async (item) => {
        const jsonRequest = {
            groupCode: pathValue.groupCode,
            managerEmpId: item,
            ApproveEmpId: item
        }
        const jsonResponse = await callAPI(apiPath.updateManagerSaleGroup, jsonRequest)
        if (jsonResponse &&
            jsonResponse.errorCode == "S_SUCCESS" &&
            jsonResponse.data &&
            jsonResponse.data.records &&
            jsonResponse.data.records.length > 0
        ) {
            dispatch(updateCurrentPathValue(jsonResponse.data.records[0]))
            addManagerEmpIdToEmployee(item)
            customAlert(msg.editSuccess)
        }
    }

    const addManagerEmpIdToEmployee = async (item) => {
        let empList = [];
        dataByGroupCode.records.forEach((obj) => {
            console.log(obj)
            empList.push(obj.empId)
        });
        let jsonRequest = {
            groupCode: pathValue.groupCode,
            empIdList: empList,
            approveEmpId: item
        }
        callAddSaleRep(jsonRequest);
    }

    const importFunction = () => {
        setShowModal(true)
    }

    const closeModal = () => {
        setFile(null)
        setShowModal(false)
        setDisableUpload(true)
    }

    const closeModalDetail = () => {
        setShowModalSuccess(false)
        setFile(null)
        setShowModal(false)
        setDisableUpload(true)
    }

    const uploadFile = async () => {
        let formData = new FormData()
        formData.append("GroupCode", pathValue.groupCode)
        formData.append("ImageFile", file)
        const jsonResponse = await callAPI(apiPath.importEmpToSaleGroup, formData)
        if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
            console.log(jsonResponse)
            setResFileUpload(jsonResponse.data ? jsonResponse.data.records[0] : null)
            searchAdmEmployeeByGroupCode(tableRefByGroupCode.current.getJsonReq());
            setShowModalSuccess(true)
        }
    }
    return (
        <div className="col-12">
            <div className="content-search ">
                <CriteriaCard
                    onSearch={handleSearch}
                    onClear={clear}
                    disabledBackground
                    btn
                    btnLabel="Import"
                    btnFunction={() => importFunction()}
                >
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.salesGroupCode}</div>
                        <div className="col-4">{pathValue.groupCode}</div>
                    </div>
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.salesGroupName}</div>
                        <div className="col-4">{pathValue.descriptionTh}</div>
                    </div>
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.salesGroupLeader}</div>
                        <div className="col-4">
                            <Select
                                onChange={onChangeLeader}
                                defaultValue={toString(pathValue.managerEmpId, false, false)}
                                options={filterDataForSelect()}
                                hideEmptyOption
                                placeholder={msg.pleaseSelect}
                            />
                        </div>
                    </div>
                    <div className="row d-flex justify-content-center mt-3">
                        <div className="col-6 col-md-6 mt-2">
                            <TextField allowChar="NUM ENG" maxLength={20} label={msg.employeeCode} ref={el => inputRef.current.empId = el}></TextField>
                        </div>
                        <div className="col-6 col-md-6 mt-2">
                            <TextField label={msg.employeeName} value="" ref={el => inputRef.current.name = el}></TextField>
                        </div>
                    </div>
                </CriteriaCard>
                <Table
                    onSelectPage={searchAdmEmployee}
                    dataTable={data}
                    headerTabel={headerTabel}
                    label={true}
                    ref={tableRef}
                    multiBtn
                    multiBtnType="add"
                    multiBtnFunction={(item) => addFunction(item)}
                />
            </div>
            <Table
                customLabel={msg.headerListEmployee}
                onSelectPage={searchAdmEmployeeByGroupCode}
                dataTable={dataByGroupCode}
                headerTabel={headerTabelByGroupCode}
                label={true}
                ref={tableRefByGroupCode}
            />
            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => uploadFile()}
                title={msg.importFile}
                disableBtn
                disableBtnCancel
                isBtnClose
            >
                {file ?
                    <div className="labelRow">
                        <div className="col-12 d-flex justify-content-center">File : {file.name}</div>
                    </div>
                    : null}
                <div className="row">
                    <div className="col-6">
                        <div {...getRootProps({ className: 'dropzone' })}>
                            <input {...getInputProps()} />
                            <Button type="primary" customLabel="Browse" onClick={open} />
                        </div>
                    </div>
                    <div className="col-6">
                        <Button type="primary" customLabel="Upload" disabled={disableUpload} onClick={() => uploadFile()} />
                    </div>
                </div>
            </Modal>
            <Modal
                isShow={showModalSuccess}
                onClose={() => closeModalDetail()}
                title={msg.importFile}
                disableBtn
                customLable={msg.close}
            >
                {resFileUpload ?
                    <div className="labelRow col-12">

                        <div>Total Record : {resFileUpload.totalRecord}</div>
                        <div>Success : {resFileUpload.totalSuccess}</div>
                        <div>Fail : {resFileUpload.totalFailed}</div>
                        <div>File Path : <a style={{ wordBreak: "break-all" }} href={process.env.apiPath + resFileUpload.pathFileError} download> {resFileUpload.pathFileError ? resFileUpload.pathFileError : "-"}</a> </div>
                    </div>
                    : null}
            </Modal>
        </div>
    )
}