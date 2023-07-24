import { useState, useRef, useEffect } from 'react';
import Modal from "@components/Modal";
import Table from "@components/Table";
import Select from "@components/Select";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData, formatObjForSelect } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
import { useSelector } from 'react-redux'
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
    {
        title: msg.approverCode,
        data: "approveEmpId",
        type: "code"
    },
    {
        title: msg.approverName,
        data: "approveName",
        type: "string"
    }
]

export default function MappingApproverPage({ callAPI, customAlert }) {
    const userProfile = useSelector((state) => state.userProfile);
    const criteriaRef = useRef({});
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [selectData, setSelectData] = useState();
    const [checkData, setCheckData] = useState();

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchAdmEmployee(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const handleSave = async () => {
        let inputData = getInputData(inputRef);
        let empList = [];
        if (!inputData.isInvalid) {
            checkData.forEach((obj) => {
                empList.push(obj.empId);
            });
            const jsonRequest = {
                empId: inputData.data.empId,
                empIdList: empList
            }
            const jsonResponse = await callAPI(apiPath.updateApproverToSaleRep, jsonRequest);
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                searchAdmEmployee(tableRef.current.getJsonReq());
                customAlert(msg.editSuccess)
            }
            closeModal()
        }
    }

    const searchAdmEmployee = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            const jsonResponse = await callAPI(apiPath.searchAdmEmployee, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const getEmpSupvisor = async (item) => {
        let buId = item[0].buId.split(".")
        console.log(item)
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 1,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                buId: buId[0]
            }
        }
        const jsonResponse = await callAPI(apiPath.getEmpSupvisor, jsonRequest);
        setSelectData(jsonResponse.data ? jsonResponse.data : null);
    }

    const filterDataForSelect = () => {
        if (!(selectData && selectData.records)) return [];
        return formatObjForSelect(selectData.records, "empId", ["empId", ["titleName", "firstName", "lastName"]], " : ");
    }

    const clear = () => {
        clearInputData(criteriaRef)
        // setData(null)
        // tableRef.current.clear();
    }
    const editFunction = (item) => {
        if (item.length > 1) {
            let itemSplit = []
            item.forEach((e) => {
                let arrayBuId = e.buId.split(".")
                itemSplit.push(arrayBuId[0])
            })
            let checkDub
            itemSplit.forEach((item) => {
                if (item == itemSplit[0]) {
                    checkDub = false
                }
                else {
                    checkDub = true
                }
            })
            if (checkDub) {
                customAlert("ไม่สามารถเลือกพนักงานจากคนล่ะ BU ได้")
            }
            else {
                setCheckData(item)
                setShowModal(true)
                getEmpSupvisor(item)
            }
        }
        else {
            setCheckData(item)
            setShowModal(true)
            getEmpSupvisor(item)
        }
    }
    const closeModal = (item) => {
        setCheckData(null)
        setShowModal(false)
    }

    return (
        <div className="col-12">
            <CriteriaCard onSearch={handleSearch} onClear={clear}>
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-6 mt-2">
                        <TextField label={msg.employeeCode} allowChar="NUM ENG" maxLength={20} value="" ref={el => criteriaRef.current.empId = el} ></TextField>
                    </div>
                    <div className="col-12 col-md-6 mt-2">
                        <TextField label={msg.employeeName} value="" ref={el => criteriaRef.current.name = el} ></TextField>
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
                multiBtnType="edit"
                multiBtnFunction={(item) => editFunction(item)}
            />
            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => handleSave()}
                title={msg.headerDialogApprover}
            >
                <Select label={msg.approverName} placeholder={msg.pleaseSelect} require options={filterDataForSelect()} ref={el => inputRef.current.empId = el} />
            </Modal>
        </div>

    )
}