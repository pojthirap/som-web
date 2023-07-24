import { useState, useRef, useEffect } from 'react';
import Modal from "@components/Modal";
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import Switch from "@components/Switch"
import { getInputData, clearInputData, toString } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
export default function LocationTypePage({ callAPI, customAlert }) {
    const criteriaRef = useRef({});
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [initData, setInitData] = useState(null);

    const headerTabel = [
        {
            title: msg.locationTypeCode,
            data: "locTypeCode",
            type: "code",
            width: "20%"
        },
        {
            title: msg.locationTypelabel,
            data: "locTypeNameTh",
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
            type: "button",
            button: "edit",
            width: "10%",
            editFunction: (item) => addEditFunction(item),
        }
    ]


    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchLocType(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const searchLocType = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            // inputCriteria.activeFlag = "Y";
            const jsonResponse = await callAPI(apiPath.searchLocType, { ...jsonRequest, ...{ model: inputCriteria } })
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

    const closeModal = (item) => {
        setInitData(null)
        setShowModal(false);
    }

    const saveOrUpdate = async () => {
        let inputData = getInputData(inputRef, "N");
        if (!inputData.isInvalid) {
            if (initData == null) {
                let jsonRequest = {
                    locTypeNameTh: inputData.data.locTypeName,
                    locTypeNameEn: inputData.data.locTypeName,
                };
                const jsonResponse = await callAPI(apiPath.addLocType, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    if (!inputCriteria) setInputCriteria({})
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.addSuccess)
                }
            } else {
                let jsonRequest = {
                    locTypeId: toString(initData.locTypeId),
                    locTypeCode: initData.locTypeCode,
                    locTypeNameTh: inputData.data.locTypeName,
                    locTypeNameEn: inputData.data.locTypeName,
                    activeFlag: inputData.data.activeFlag
                };
                const jsonResponse = await callAPI(apiPath.updLocType, jsonRequest)
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
                locTypeId: toString(item.locTypeId)
            }
            const jsonResponse = await callAPI(apiPath.cancelLocType, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                searchLocType(tableRef.current.getJsonReq());
                customAlert(msg.deleteSuccess)
            }
        })
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
                        <TextField label={msg.locationTypelabel} value="" ref={el => criteriaRef.current.locTypeNameTh = el}></TextField>
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
                onSelectPage={searchLocType}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => saveOrUpdate()}
                title={msg.headerDialogLocType}
            >
                {initData ? <TextField label={msg.locationTypeCode} disabled value={initData && initData.locTypeCode ? initData.locTypeCode : ""}></TextField> : null}
                <TextField label={msg.locationTypelabel} require value={initData && initData.locTypeNameTh ? initData.locTypeNameTh : ""} ref={el => inputRef.current.locTypeName = el}></TextField>

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