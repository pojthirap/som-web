import { useState, useRef, useEffect } from 'react';
import Modal from "@components/Modal";
import Table from "@components/Table";
import Select from "@components/Select";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import Switch from "@components/Switch"
import { getInputData, clearInputData, formatObjForSelect, toString } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
export default function LocationPage({ callAPI, customAlert }) {
    const criteriaRef = useRef({});
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [initData, setInitData] = useState(null);
    const [selectProvince, setSelectProvince] = useState();
    const [selectLocType, setSelectLocType] = useState();
    const headerTabel = [
        {
            title: msg.locationCode,
            data: "locCode",
            type: "code",
            width: "10%"
        },
        {
            title: msg.locationName,
            data: "locNameTh",
            type: "string",
            width: "20%"
        },
        {
            title: msg.provinceName,
            data: "provinceNameTh",
            type: "string",
            width: "15%"
        },
        {
            title: msg.coordinates,
            data: ["latitude", "longitude"],
            dataSeparator: ", ",
            type: "string",
            width: "20%"
        },
        {
            title: msg.locationType,
            data: "locTypeNameTh",
            type: "string",
            width: "15%"
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
        searchProvinceAndLocType();
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchLoc(objectReq)
    }, [inputCriteria])

    const searchProvinceAndLocType = async () => {
        const jsonRequestProvince = {
            searchOption: 0,
            searchOrder: 2,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: { activeFlag: "Y" }
        }
        const jsonRequestLocType = {
            searchOption: 0,
            searchOrder: 2,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: { activeFlag: "Y" }
        }
        const jsonResponseProvince = await callAPI(apiPath.searchProvince, jsonRequestProvince);
        const jsonResponseLocType = await callAPI(apiPath.searchLocType, jsonRequestLocType);
        setSelectProvince(jsonResponseProvince.data ? jsonResponseProvince.data : null);
        setSelectLocType(jsonResponseLocType.data ? jsonResponseLocType.data : null);
    }

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const searchLoc = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            // inputCriteria.activeFlag = "Y";
            const jsonResponse = await callAPI(apiPath.searchLoc, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const filterDataForSelectProvince = () => {
        if (!(selectProvince && selectProvince.records)) return [];
        return formatObjForSelect(selectProvince.records, "provinceCode", "provinceNameTh");
    }

    const filterDataForSelectLocationType = () => {
        if (!(selectLocType && selectLocType.records)) return [];
        return formatObjForSelect(selectLocType.records, "locTypeId", "locTypeNameTh");
    }

    const deleteFunction = (item) => {
        customAlert(msg.confirmDelete, "Q", async () => {
            let jsonRequest = {
                locId: toString(item.locId),
            }
            const jsonResponse = await callAPI(apiPath.cancelLoc, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                searchLoc(tableRef.current.getJsonReq());
                customAlert(msg.deleteSuccess)
            }
        })
    }

    const addEditFunction = (item = null) => {
        if (item != null) {
            setInitData(item);

        } else {
            setInitData(null);
        }
        setShowModal(true);
    }

    const clear = () => {
        clearInputData(criteriaRef)
        // setData(null)
        // tableRef.current.clear();
    }

    const closeModal = (item) => {
        setInitData(null)
        setShowModal(false);
    }

    function validateLatLng(lat, lng) {
        return (lat && isFinite(lat) && Math.abs(lat) <= 90) && (lng && isFinite(lng) && Math.abs(lng) <= 180);
    }
    const saveOrUpdate = async () => {
        let inputData = getInputData(inputRef, "N");

        if (inputData.data.latitude && inputData.data.longitude) {
            if (!validateLatLng(inputData.data.latitude, inputData.data.longitude)) return customAlert(msg.latOrLongWorng)
        } else if (inputAddressRefData.data.latitude || inputAddressRefData.data.longitude) {
            return customAlert(msg.enterBothLatAndLong)
        }
        if (!inputData.isInvalid) {
            if (initData == null) {
                let jsonRequest = {
                    locNameTh: inputData.data.locationName,
                    locNameEn: inputData.data.locationName,
                    provinceCode: inputData.data.provinceCode,
                    latitude: inputData.data.latitude,
                    longitude: inputData.data.longitude,
                    locTypeId: toString(inputData.data.locTypeId)
                };
                const jsonResponse = await callAPI(apiPath.addLoc, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    if (!inputCriteria) setInputCriteria({})
                    clearInputData(criteriaRef)
                    let criteriaData = getInputData(criteriaRef, "NE");
                    setInputCriteria(criteriaData.data);
                    customAlert(msg.addSuccess)
                }
            }
            else {
                let jsonRequest = {
                    locId: toString(initData.locId),
                    locNameTh: inputData.data.locationName,
                    locNameEn: inputData.data.locationName,
                    provinceCode: inputData.data.provinceCode,
                    latitude: inputData.data.latitude,
                    longitude: inputData.data.longitude,
                    locTypeId: toString(inputData.data.locTypeId),
                    activeFlag: inputData.data.activeFlag
                };
                const jsonResponse = await callAPI(apiPath.updLoc, jsonRequest)
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
                    <div className="col-12 col-md-4 mt-2">
                        <TextField label={msg.locationName} defaultValue="" ref={el => criteriaRef.current.locNameTh = el}></TextField>
                    </div>
                    <div className="col-12 col-md-3 mt-2">
                        <Select label={msg.provinceName} placeholder={msg.pleaseSelect} hideEmptyOption options={filterDataForSelectProvince()} ref={el => criteriaRef.current.provinceCode = el} />
                    </div>
                    <div className="col-12 col-md-3 mt-2">
                        <Select label={msg.locationType} placeholder={msg.pleaseSelect} hideEmptyOption options={filterDataForSelectLocationType()} ref={el => criteriaRef.current.locTypeId = el} />
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
                onSelectPage={searchLoc}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => saveOrUpdate()}
                title={msg.location}
            >
                {initData ?
                    <TextField label={msg.code} disabled defaultValue={initData && initData.locCode ? initData.locCode : ""} ref={el => inputRef.current.locCode = el}></TextField>
                    :
                    null
                }
                <TextField label={msg.locationName} require defaultValue={initData && initData.locNameTh ? initData.locNameTh : ""} ref={el => inputRef.current.locationName = el}></TextField>
                <Select label={msg.provinceName} placeholder={msg.pleaseSelect} require options={filterDataForSelectProvince()} defaultValue={initData && initData.provinceCode ? initData.provinceCode : ""} ref={el => inputRef.current.provinceCode = el} />

                <div className="row">
                    <div className="col-6 pl-0">
                        <TextField label={msg.latitude} allowChar="NUM OTHER" maxLength={50} require defaultValue={initData && initData.latitude ? initData.latitude : ""} ref={el => inputRef.current.latitude = el}></TextField>
                    </div>
                    <div className="col-6 pr-0">
                        <TextField label={msg.longitude} allowChar="NUM OTHER" maxLength={50} require defaultValue={initData && initData.longitude ? initData.longitude : ""} ref={el => inputRef.current.longitude = el}></TextField>
                    </div>

                </div>
                <Select label={msg.locationType} placeholder={msg.pleaseSelect} require options={filterDataForSelectLocationType()} defaultValue={initData && initData.locTypeId ? initData.locTypeId : ""} ref={el => inputRef.current.locTypeId = el} />

                {initData ?
                    <Switch
                        labelOnRight={msg.activeAndInActive}
                        label={msg.sysGroupStatus}
                        defaultValue={initData ? (initData.activeFlag && initData.activeFlag == "Y" ? true : false) : true}
                        ref={el => inputRef.current.activeFlag = el}
                        returnYAndN
                    />
                    :
                    null
                }
            </Modal>
        </div>
    )
}