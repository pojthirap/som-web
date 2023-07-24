import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import Modal from "@components/Modal";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import Switch from "@components/Switch"
import { getInputData, clearInputData } from "@helper";
import { useDispatch } from 'react-redux'
import * as apiPath from "@apiPath";
import * as msg from "@msg";
export default function MappingRegionWithProvincePage({ callAPI, redirect, customAlert }) {
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
            title: msg.regionCode,
            data: "regionCode",
            type: "code",
            width: "20%"

        },
        {
            title: msg.regionName,
            data: "regionNameTh",
            type: "string",
            width: "55%"
        },
        {
            title: msg.tableStatus,
            data: "activeFlag",
            type: "useFlag",
            width: "10%"
        },
        {
            title: msg.provinceInRegion,
            type: "button",
            button: "add",
            width: "10%",
            addFunction: (item) => addFunction(item),
        },
        {
            type: "button",
            button: "edit",
            width: "10%",
            editFunction: (item) => addEditFunction(item),
        },
    ]

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchRegion(objectReq)
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

    const searchRegion = async (jsonRequest) => {
        if (inputCriteria) {
            // inputCriteria.activeFlag = "Y";
            jsonRequest.searchOrder = 1
            let tmpRequest = jsonRequest;
            tmpRequest.model = inputCriteria;
            const jsonResponse = await callAPI(apiPath.searchRegion, tmpRequest)
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const clear = () => {
        clearInputData(criteriaRef)
        // setData(null)
        // tableRef.current.clear();
    }

    const addFunction = (item) => {
        dispatch(redirect("/master/mappingRegionWithProvinceEdit", item))
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
                    regionNameTh: inputData.data.regionName,
                    regionNameEn: inputData.data.regionName,
                };
                const jsonResponse = await callAPI(apiPath.addRegion, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    if (!inputCriteria) setInputCriteria({})
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.addSuccess)
                }
            } else {
                let jsonRequest = {
                    regionCode: initData.regionCode,
                    regionNameTh: inputData.data.regionName,
                    regionNameEn: inputData.data.regionName,
                    activeFlag: inputData.data.activeFlag
                };

                const jsonResponse = await callAPI(apiPath.updRegion, jsonRequest)
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
    //             regionCode: item.regionCode
    //         }
    //         const jsonResponse = await callAPI(apiPath.cancelRegioin, jsonRequest)
    //         if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
    //             searchRegion(tableRef.current.getJsonReq());
    //             customAlert(msg.deleteSuccess)
    //         }
    //     })
    // }

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
                    <div className="col-12 col-md-5 mt-2">
                        <TextField label={msg.regionCode} allowChar="NUM ENG" maxLength={10} value="" ref={el => criteriaRef.current.regionCode = el} ></TextField>
                    </div>
                    <div className="col-12 col-md-5 mt-2">
                        <TextField label={msg.regionName} value="" ref={el => criteriaRef.current.regionName = el} ></TextField>
                    </div>
                    <div className="col-12 col-md-2 mt-2">
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
                onSelectPage={searchRegion}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => saveOrUpdate()}
                title={msg.region}
            >
                {initData ? <TextField label={msg.regionCode} disabled value={initData && initData.regionCode ? initData.regionCode : ""}></TextField> : null}
                <TextField label={msg.regionName} require value={initData && initData.regionNameTh ? initData.regionNameTh : ""} ref={el => inputRef.current.regionName = el}></TextField>
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