import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import Modal from "@components/Modal";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData, toString } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
import { useDispatch, useSelector } from 'react-redux'
import Switch from "@components/Switch"
export default function TerritoryPage({ callAPI, redirect, customAlert }) {
    const userProfile = useSelector((state) => state.userProfile);
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
            title: msg.territoryCode,
            data: "territoryCode",
            type: "code",
            width: "20%"
        },
        {
            title: msg.territoryName,
            data: "territoryNameTh",
            type: "string",
            width: "50%"
        },
        {
            title: msg.tableStatus,
            data: "activeFlag",
            type: "useFlag",
            width: "10%"
        },
        {
            title: msg.manageSale,
            type: "button",
            button: "add",
            width: "10%",
            showIsBuId: "editBtn",
            addFunction: async (item) => addFunction(item),
        },
        {
            type: "button",
            button: "edit",
            width: "10%",
            showIsBuId: "editBtn",
            editFunction: (item) => addEditFunction(item),
        },
    ]

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchTerritory(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (inputData.isInvalid) {
            alert("Invalid");
        }
        else {
            setInputCriteria(inputData.data);
        }
    }

    const searchTerritory = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            // inputCriteria.activeFlag = "Y";
            const jsonResponse = await callAPI(apiPath.searchTerritory, { ...jsonRequest, ...{ model: inputCriteria } })
            console.log(jsonResponse)
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const clear = () => {
        clearInputData(criteriaRef)
        // setData(null)
        // tableRef.current.clear();
    }

    const addFunction = (item) => {
        dispatch(redirect("/organizational/territoryEdit", item))
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
        let inputData = getInputData(inputRef, "N");
        if (!inputData.isInvalid) {
            if (initData == null) {
                let jsonRequest = {
                    territoryNameTh: inputData.data.territoryName,
                    territoryNameEn: inputData.data.territoryName,
                };
                const jsonResponse = await callAPI(apiPath.addTerritory, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    if (!inputCriteria) setInputCriteria({})
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.addSuccess)
                }
            } else {
                let jsonRequest = {
                    territoryId: toString(initData.territoryId),
                    territoryCode: initData.territoryCode,
                    territoryNameTh: inputData.data.territoryName,
                    territoryNameEn: inputData.data.territoryName,
                    activeFlag: inputData.data.activeFlag
                };

                const jsonResponse = await callAPI(apiPath.updTerritory, jsonRequest)
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

    const deleteFunction = (item) => {
        customAlert(msg.confirmDelete, "Q", async () => {
            let jsonRequest = {
                territoryId: toString(item.territoryId)
            }
            const jsonResponse = await callAPI(apiPath.cancelTerritory, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                searchTerritory(tableRef.current.getJsonReq());
                customAlert(msg.deleteSuccess)
            }
        })
    }

    const closeModal = (item) => {
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
                        <TextField label={msg.territoryName} value="" ref={el => criteriaRef.current.name = el}></TextField>
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
                onSelectPage={searchTerritory}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
                userProfile={userProfile}
            />
            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => saveOrUpdate()}
                title={msg.headerDialogTerritory}
            >
                {initData ? <TextField label={msg.territoryCode} disabled value={initData && initData.territoryCode ? initData.territoryCode : ""}></TextField> : null}
                <TextField label={msg.territoryName} require value={initData && initData.territoryNameTh ? initData.territoryNameTh : ""} ref={el => inputRef.current.territoryName = el}></TextField>
                {initData ?
                    <Switch
                        labelOnRight={msg.activeAndInActive}
                        label={msg.sysGroupStatus}
                        defaultValue={initData ? (initData.activeFlag && initData.activeFlag == "Y" ? true : false) : true}
                        ref={el => inputRef.current.activeFlag = el}
                        returnYAndN
                    />
                    : null
                }
            </Modal>
        </div>

    )
}