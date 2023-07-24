import { useState, useRef, useEffect } from 'react';
import Modal from "@components/Modal";
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import Switch from "@components/Switch"
import { getInputData, clearInputData, toString } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
export default function RoleOnSOMPage({ callAPI, customAlert }) {
    const criteriaRef = useRef({});
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [initData, setInitData] = useState(null);
    const headerTabel = [
        {
            title: msg.roleCode,
            data: "groupCode",
            type: "code",
            width: "20%"

        },
        {
            title: msg.roleName,
            data: "groupNameTh",
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
            title: "",
            type: "button",
            button: "edit",
            width: "10%",
            editFunction: (item) => addEditFunction(item),

        }
    ]

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchAdmGroup(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const searchAdmGroup = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            // inputCriteria.activeFlag = "Y";
            const jsonResponse = await callAPI(apiPath.searchAdmGroup, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
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
        console.log(inputData)
        if (!inputData.isInvalid) {
            if (initData == null) {
                let jsonRequest = {
                    groupNameTh: inputData.data.groupName,
                    groupNameEn: inputData.data.groupName,
                };
                const jsonResponse = await callAPI(apiPath.addAdmGroup, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    if (!inputCriteria) setInputCriteria({})
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.addSuccess)
                }
            } else {
                let jsonRequest = {
                    groupId: toString(initData.groupId),
                    groupNameTh: inputData.data.groupName,
                    groupNameEn: inputData.data.groupName,
                    activeFlag: inputData.data.activeFlag
                };

                const jsonResponse = await callAPI(apiPath.updateAdmGroup, jsonRequest)
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
    //             groupId: toString(item.groupId)
    //         }
    //         const jsonResponse = await callAPI(apiPath.deleteAdmGroup, jsonRequest)
    //         if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
    //             searchAdmGroup(tableRef.current.getJsonReq());
    //             customAlert(msg.deleteSuccess)
    //         }
    //     })
    // }

    const closeModal = (item) => {
        setInitData(null)
        setShowModal(false);
    }

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
                        <TextField label={msg.roleName} value="" ref={el => criteriaRef.current.name = el}></TextField>
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
                onSelectPage={searchAdmGroup}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => saveOrUpdate()}
                title={msg.headerDialogRoleOnSOM}
            >
                {initData ?
                    <div>
                        <div className="col-12 mt-2">
                            <TextField label={msg.roleCode} disabled value={initData && initData.groupCode ? initData.groupCode : ""}></TextField>
                        </div>
                        <div className="col-12 mt-2">
                            <TextField label={msg.roleName} require value={initData && initData.groupNameTh ? initData.groupNameTh : ""} ref={el => inputRef.current.groupName = el}></TextField>
                        </div>
                        <div className="col-12 mt-2">
                            <Switch
                                labelOnRight={msg.activeAndInActive}
                                label={msg.sysGroupStatus}
                                defaultValue={initData ? (initData.activeFlag && initData.activeFlag == "Y" ? true : false) : true}
                                ref={el => inputRef.current.activeFlag = el}
                                returnYAndN
                            />
                        </div>
                    </div>
                    :
                    <TextField label={msg.roleName} require value={initData && initData.groupNameTh ? initData.groupNameTh : ""} ref={el => inputRef.current.groupName = el}></TextField>}
            </Modal>
        </div>
    )
}