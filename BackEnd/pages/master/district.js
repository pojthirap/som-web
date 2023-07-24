import { useState, useRef, useEffect } from 'react';
import Modal from "@components/Modal";
import Table from "@components/Table";
import Select from "@components/Select";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData, formatObjForSelect } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
export default function DistrictPage({ callAPI, customAlert }) {
    const criteriaRef = useRef({});
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [selectData, setSelectData] = useState();
    const [initData, setInitData] = useState(null);
    const headerTabel = [
        {
            title: msg.districtCode,
            data: "districtCode",
            type: "code",
            width: "20%"
        },
        {
            title: msg.districtName,
            data: "districtNameTh",
            type: "string",
            width: "60%"
        },
        {
            title: msg.mapping,
            type: "button",
            button: "add",
            width: "20%",
            addFunction: (item) => addFunction(item),
        }
    ]

    useEffect(() => {
        searchProvince()
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchDistrict(objectReq)
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

    const searchDistrict = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            inputCriteria.activeFlag = "Y"
            const jsonResponse = await callAPI(apiPath.searchDistrict, { ...jsonRequest, ...{ model: inputCriteria } })
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

    const addFunction = (item = null) => {
        if (item != null) {
            setInitData(item);

        } else {
            setInitData(null);
        }
        setShowModal(true);
    }

    const handleSave = async () => {

        let inputData = getInputData(inputRef, "N");

        if (!inputData.isInvalid) {
            const jsonRequest = {
                districtCode: initData.districtCode,
                provinceCode: inputData.data.provinceCode
            }


            const jsonResponse = await callAPI(apiPath.updDistrictByProvinceCode, jsonRequest);
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                searchDistrict(tableRef.current.getJsonReq());
                customAlert(msg.editSuccess)
            }
            closeModal()
        }
    }

    const searchProvince = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 2,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                activeFlag: "Y"
            }
        }
        const jsonResponse = await callAPI(apiPath.searchProvince, jsonRequest);
        setSelectData(jsonResponse.data ? jsonResponse.data : null);
    }

    const filterDataForSelect = () => {
        if (!(selectData && selectData.records)) return [];
        return formatObjForSelect(selectData.records, "provinceCode", "provinceNameTh");
    }

    return (
        <div className="col-12">
            <CriteriaCard onSearch={handleSearch} onClear={clear}>
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-6 mt-2">
                        <TextField label={msg.districtName} allowChar="THAI" value="" ref={el => criteriaRef.current.districtNameTh = el}></TextField>
                    </div>
                </div>
            </CriteriaCard>
            <Table
                onSelectPage={searchDistrict}
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
                <TextField label={msg.districtCode} disabled value={initData && initData.districtCode ? initData.districtCode : ""}></TextField>
                <TextField label={msg.districtName} disabled value={initData && initData.districtNameTh ? initData.districtNameTh : ""} ></TextField>
                <Select label={msg.provinceName} placeholder={msg.pleaseSelect} require options={filterDataForSelect()} defaultValue={initData && initData.provinceCode ? initData.provinceCode : ""} ref={el => inputRef.current.provinceCode = el} />
            </Modal>
        </div >


    )
}