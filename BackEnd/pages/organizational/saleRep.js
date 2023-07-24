import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import Select from "@components/Select";
import Modal from "@components/Modal"
import { getInputData, clearInputData, formatObjForSelect, toString } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
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
        title: msg.saleRepJobTitle,
        data: "jobTitle",
        type: "string"
    },
    {
        title: msg.saleRepRoleOnSom,
        data: "groupNameTh",
        type: "string"
    },
    {
        title: msg.saleRepBuName,
        data: "buNameTh",
        type: "string"
    },
    {
        title: msg.salesGroupName,
        data: "descriptionTh",
        type: "string"
    },
    {
        title: msg.territoryName,
        data: "territoryNameTh",
        type: "string"
    }
]

export default function SaleRepPage({ callAPI, customAlert }) {
    const criteriaRef = useRef({});
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [selectData, setSelectData] = useState();
    const [selectBuData, setSelectBuData] = useState();
    const [checkData, setCheckData] = useState();
    useEffect(() => {
        getAdmGroup();
        searchBusinessUnit();
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchAdmEmployeeAdmGroup(objectReq)
    }, [inputCriteria])
    
    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }
    const handleSave = async () => {
        let inputData = getInputData(inputRef);
        if (!inputData.isInvalid) {

            let empGroupArr = [];
            checkData.forEach((obj) => {
                empGroupArr.push({ empId: obj.empId, groupUserId: toString(obj.groupUserId), groupUserType: obj.groupUserType });
            });

            const jsonRequest = {
                buId: toString(inputData.data.buId),
                groupId: toString(inputData.data.groupId),
                employeeGroups: empGroupArr
            }
            const jsonResponse = await callAPI(apiPath.mapRole, jsonRequest);

            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                let objectReq = tableRef.current.getJsonReq()
                searchAdmEmployeeAdmGroup(objectReq)
                customAlert(msg.editSuccess);
                closeModal()
            }

        }
    }

    const searchAdmEmployeeAdmGroup = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            const jsonResponse = await callAPI(apiPath.searchAdmEmployeeAdmGroup, { ...jsonRequest, ...{ model: inputCriteria } })
            console.log(jsonResponse)
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const getAdmGroup = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 2,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: { activeFlag: "Y" }
        }
        
        const jsonResponse = await callAPI(apiPath.getAdmGroup, jsonRequest);
        setSelectData(jsonResponse.data ? jsonResponse.data : null);
    }

    const searchBusinessUnit = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 2,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: { activeFlag: "Y" }
        }
        const jsonResponse = await callAPI(apiPath.searchBusinessUnit, jsonRequest);
        setSelectBuData(jsonResponse.data ? jsonResponse.data : null);
    }

    const filterDataForSelect = () => {
        if (!(selectData && selectData.records)) return [];
        return formatObjForSelect(selectData.records, "groupId", "groupNameTh");
    }

    const filterBuDataForSelect = () => {
        if (!(selectBuData && selectBuData.records)) return [];
        return formatObjForSelect(selectBuData.records, "buId", "buNameTh");
    }

    const clear = () => {
        clearInputData(criteriaRef)
        // setData(null)
        // tableRef.current.clear();
    }
    const editFunction = (item) => {
        setCheckData(item)
        setShowModal(true)
    }
    const closeModal = (item) => {
        setCheckData(null)
        setShowModal(false)
    }

    return (
        <div className="col-12">
            <CriteriaCard
                onSearch={handleSearch}
                onClear={clear}
            >
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-4 mt-2">
                        <TextField label={msg.employeeCode} allowChar="NUM ENG" maxLength={20} value="" ref={el => criteriaRef.current.empId = el} ></TextField>
                    </div>
                    <div className="col-12 col-md-4 mt-2">
                        <TextField label={msg.employeeName} value="" ref={el => criteriaRef.current.name = el} ></TextField>
                    </div>
                    <div className="col-12 col-md-4 mt-2">
                        <TextField label={msg.saleRepJobTitle} allowChar="THAI ENG" maxLength={50} value="" ref={el => criteriaRef.current.jobTitle = el}></TextField>
                    </div>
                </div>
            </CriteriaCard>
            <Table
                onSelectPage={searchAdmEmployeeAdmGroup}
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
                onSave={() => handleSave()}
                onClose={() => closeModal()}
                title={msg.headerDialogSaleRep}
            >
                <Select label={msg.saleRepRoleOnSom} placeholder={msg.pleaseSelect} require options={filterDataForSelect()} ref={el => inputRef.current.groupId = el} />
                <Select label={msg.saleRepBuName} placeholder={msg.pleaseSelect} require options={filterBuDataForSelect()} ref={el => inputRef.current.buId = el} />
            </Modal>
        </div>

    )
}