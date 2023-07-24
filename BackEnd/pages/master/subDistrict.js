import { useState, useRef, useEffect } from 'react';
import Modal from "@components/Modal";
import Table from "@components/Table";
import Select from "@components/Select";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData, formatObjForSelect } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
export default function SubDistrictPage({ callAPI, customAlert }) {
    const criteriaRef = useRef({});
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [selectData, setSelectData] = useState();
    const [subDistrict, setSubDistrict] = useState();
    const [initData, setInitData] = useState(null);
    const headerTabel = [
        {
            title: msg.subDistrictCode,
            data: "subdistrictCode",
            type: "code",
            width: "20%"
        },
        {
            title: msg.subDistrictName,
            data: "subdistrictNameTh",
            type: "string",
            width: "20%"
        },
        {
            title: msg.districtName,
            data: "districtNameTh",
            type: "string",
            width: "20%"
        },
        {
            title: msg.provinceName,
            data: "provinceNameTh",
            type: "string",
            width: "20%"
        },
        {
            title: msg.edit,
            type: "button",
            button: "edit delete",
            width: "20%",
            editFunction: (item) => addFunction(item),
            deleteFunction: (item) => deleteFunction(item)
        }
    ]

    useEffect(() => {
        searchDistrict()
        getSubDistrict()
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchSubDistrict(objectReq)
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

    const searchSubDistrict = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            inputCriteria.activeFlag = "Y"
            const jsonResponse = await callAPI(apiPath.searchSubDistrict, { ...jsonRequest, ...{ model: inputCriteria } })
            console.log(jsonResponse)
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const clear = () => {
        clearInputData(criteriaRef)
        // setData(null)
        // tableRef.current.clear();
    }

    const closeModal = (item) => {
        setShowModal(false)
    }

    const deleteFunction = async (item) => {
        console.log(item)
        let message = []
        message.push(<div>{msg.confirmDelete}</div>)
        message.push(<div>รหัสตำบล : {item.subdistrictCode}</div>)
        message.push(<div>ชื่อตำบล : {item.subdistrictNameTh}</div>)
        message.push(<div>ชื่ออำเภอ : {item.districtNameTh}</div>)
        message.push(<div>ชื่อจังหวัด : {item.provinceNameTh}</div>)
        customAlert(<div>{message}</div>, "Q", async () => {
            let jsonRequest = {
                SubdistrictSomId: item.subdistrictSomId
            }
            const jsonResponse = await callAPI(apiPath.delSubDistrictSomById, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                searchSubDistrict(tableRef.current.getJsonReq());
                customAlert(msg.deleteSuccess)
            }
        })
    }

    const addFunction = (item = null) => {
        if (item != null) {
            setInitData(item);
            console.log(item)
        } else {
            setInitData(null);
        }
        setShowModal(true);
    }

    const handleSave = async () => {

        let inputData = getInputData(inputRef, "N");
        console.log()
        if (!inputData.isInvalid) {
            let jsonRequest;
            if (initData) {
                jsonRequest = {
                    SubdistrictSomId: initData.subdistrictSomId,
                    districtCode: inputData.data.districtCode,
                    subdistrictCode: initData.subdistrictCode,
                }
            } else {
                jsonRequest = {
                    districtCode: inputData.data.districtCode,
                    subdistrictCode: inputData.data.subdistrictCode,
                }
            }
            const jsonResponse = await callAPI(apiPath.updSubDistrictByDistrictCode, jsonRequest);
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                searchSubDistrict(tableRef.current.getJsonReq());
                if (initData) {
                    customAlert(msg.editSuccess)
                }
                else{
                    customAlert(msg.addSuccess)
                }
                
            }
            closeModal()
        }
    }

    const searchDistrict = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 2,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await callAPI(apiPath.searchDistrict, jsonRequest);
        setSelectData(jsonResponse.data ? jsonResponse.data : null);
    }

    const getSubDistrict = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                ActiveFlag: "Y"
            }
        }
        const jsonResponse = await callAPI(apiPath.searchMsSubDistrict, jsonRequest);
        setSubDistrict(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
    }

    const filterDataForSelect = () => {
        if (!(selectData && selectData.records)) return [];
        return formatObjForSelect(selectData.records, "districtCode", "districtNameTh");
    }

    const filterDataForSelectSubDistrict = () => {
        if (!(subDistrict && subDistrict.records)) return [];
        return formatObjForSelect(subDistrict.records, "subdistrictCode", "subdistrictNameTh");
    }

    return (
        <div className="col-12">
            <CriteriaCard
                onSearch={handleSearch}
                onClear={clear}
                btn
                btnLabel={msg.newMapping}
                btnFunction={() => addFunction()}
            >
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-6 mt-2">
                        <TextField label={msg.subDistrictName} allowChar="THAI" value="" ref={el => criteriaRef.current.subDistrictNameTh = el}></TextField>
                    </div>
                </div>
            </CriteriaCard>
            <Table
                onSelectPage={searchSubDistrict}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />

            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => handleSave()}
                title={msg.mapping}
            >
                {initData ?
                    <>
                        <TextField label={msg.subDistrictCode} disabled value={initData && initData.subdistrictCode ? initData.subdistrictCode : ""}></TextField>
                        <TextField label={msg.subDistrictName} disabled value={initData && initData.subdistrictNameTh ? initData.subdistrictNameTh : ""} ></TextField>
                    </>
                    :
                    <Select label={msg.subDistrictName} placeholder={msg.pleaseSelect} require options={filterDataForSelectSubDistrict()} ref={el => inputRef.current.subdistrictCode = el} />
                }
                <Select label={msg.districtName} placeholder={msg.pleaseSelect} require defaultValue={initData && initData.districtCode ? initData.districtCode : ""} options={filterDataForSelect()} ref={el => inputRef.current.districtCode = el} />
            </Modal>
        </div >


    )
}