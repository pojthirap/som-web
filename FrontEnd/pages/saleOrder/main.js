import { useState, useRef, useEffect } from 'react';
import { getInputData, formatObjForSelect, toString, clearInputData } from '@helper';
import { useDispatch, useSelector } from 'react-redux'
import Button from '@components/Button';
import Table from "@components/Table";
import Select from '@components/Select';
import TextField from '@components/TextField';
import DatePicker from '@components/DatePicker';
import Modal from "@components/Modal";
import moment from 'moment';
import * as msg from '@msg'
import * as apiPath from '@apiPath'

export default function Main({ callAPI, customAlert, redirect }) {
    const headerTabel = [
        {
            title: msg.soNoSom,
            data: "somOrderNo",
            type: "string",
        },
        {
            title: msg.soNoSap,
            data: "sapOrderNo",
            type: "code",
        },
        {
            title: msg.customerName,
            data: "custNameTh",
            type: "string",
        },
        {
            title: msg.soDateTime,
            data: "somOrderDte",
            type: "dateTime",
        },
        {
            title: msg.simulateDateTime,
            data: "simulateDtm",
            type: "dateTime",
        },
        {
            title: msg.documentType,
            data: "docTypeNameTh",
            type: "string",
        },
        {
            title: msg.status,
            data: "status",
            type: "string",
        },
        {
            title: msg.message,
            data: "sapMsg",
            type: "string",
        },
        {
            title: msg.pricingDateTime,
            data: "pricingDtm",
            type: "dateTime",
        },
        {
            title: msg.total,
            data: "total",
            type: "decimal",
        },
        {
            title: msg.totalNetValue,
            data: "netValue",
            type: "decimal",
        },
        {
            type: "button",
            button: "edit",
            width: "3%",
            editFunction: (item) => editFunction(item),
        }
    ]

    const headerTabelSaleArea = [
        {
            type: "button",
            button: "select",
            selectFunction: (item) => selectFunction(item),
        },
        {
            title: msg.saleOrganization,
            data: "orgNameTh",
            type: "string",
            width: "31%"
        },
        {
            title: msg.distributionChannel,
            data: "channelNameTh",
            type: "string",
            width: "31%"
        },
        {
            title: msg.divisionLabel,
            data: "divisionNameTh",
            type: "string",
            width: "31%"
        }
    ]

    const tableRef = useRef({});
    const inputRef = useRef({});
    const createInputRef = useRef({});
    const tableSaleAreaRef = useRef({});
    const qnoRef = useRef({});
    const userProfile = useSelector((state) => state.userProfile);
    const [dateFromValue, setDateFromValue] = useState();
    const [dateToValue, setDateToValue] = useState();
    const [data, setData] = useState();
    const [inputCriteria, setInputCriteria] = useState(null);
    const [showModal, setShowModal] = useState(false)
    const [docTypeSelectData, setDocTypeSelectData] = useState([])
    const [custSelectData, setCustSelectData] = useState([])
    const [currentCustCode, setCurrentCustCode] = useState(null)
    const [saleAreaData, setSaleAreaData] = useState(null);
    const [isShowTable, setIsShowTable] = useState(false)
    const [selectedSaleArea, setSelectSaleArea] = useState(null)
    const [shipToData, setShipToData] = useState([])
    const [shipToFullData, setShipToFullData] = useState([])
    const today = moment()
    const dispatch = useDispatch();
    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        fetchAPI(objectReq)
    }, [inputCriteria])

    useEffect(() => {
        if (tableSaleAreaRef.current && tableSaleAreaRef.current.getJsonReq instanceof Function) {
            let objectReq = tableSaleAreaRef.current.getJsonReq()
            searchCustomerSaleByCustCode(objectReq)
        }
    }, [currentCustCode])
    useEffect(() => {
        searchOrderDocType();
        searchCustomer();
    }, [])

    const handleSearch = () => {
        let inputData = getInputData(inputRef, "NE");
        if (!inputData.isInvalid) {
            if (Object.keys(inputData.data).length > 0) {
                setInputCriteria(inputData.data);
            } else {
                customAlert(msg.pleaseInputAtLestOneField, "W");
            }
        }

    }
    const fetchAPI = async (jsonRequestTmp) => {
        if (inputCriteria) {
            let jsonRequest = {
                ...jsonRequestTmp,
                model: inputCriteria
            }

            if (inputCriteria.fromDate && !inputCriteria.toDate) {
                jsonRequest.model.toDate = moment(inputCriteria.fromDate).add(365, 'd').format("YYYY-MM-DD").concat("T00:00:00");
            }
            else if (!inputCriteria.fromDate && inputCriteria.toDate) {
                jsonRequest.model.fromDate = moment(inputCriteria.fromDate).subtract(365, 'd').format("YYYY-MM-DD").concat("T00:00:00");
            }

            const jsonResponse = await callAPI(apiPath.searchSaleOrder, jsonRequest)
            setData(jsonResponse && jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const handleChangeCustCode = (value) => {
        setIsShowTable(false)
        setSelectSaleArea(null)
        setSaleAreaData(null)
        setCurrentCustCode(value)
        setShipToData([])
        setShipToFullData([])
        createInputRef.current.shipToCustCode.clearValue()
        createInputRef.current.shipToCustCode.clearValidate()
    }
    const closeModal = () => {
        clearInputData(inputRef)
        setIsShowTable(false)
        setSelectSaleArea(null)
        setSaleAreaData(null)
        setCurrentCustCode(null)
        setShipToData([])
        setShipToFullData([])
        createInputRef.current.shipToCustCode.clearValue()
        createInputRef.current.shipToCustCode.clearValidate()
        setShowModal(false)
    }
    const selectFunction = (item) => {
        setSelectSaleArea(item)
        setIsShowTable(false)
        searchShipToByCustSaleId(item.custSaleId)
    }

    const handleSaveCreate = async () => {
        let inputData = getInputData(createInputRef, "NE");
        if (!inputData.isInvalid) {
            if (selectedSaleArea) {
                if (inputData.data.shipToCustCode) {
                    const findObj = shipToFullData.find(el => el.custCode == inputData.data.shipToCustCode)
                    inputData.data.shipToCustPartnerId = toString(findObj.custPartnerId, false, false)
                } else {
                    inputData.data.shipToCustPartnerId = ""
                }

                //hardCode for test
                // inputData.data.shipToCustCode = "0011000506"
                // inputData.data.shipToCustPartnerId = "0011000506"
                //hardCode for test
                const jsonRequest = {
                    saleOrder: {
                        ...inputData.data,
                        custSaleId: toString(selectedSaleArea.custSaleId, false, false),
                        channelCode: toString(selectedSaleArea.channelCode, false, false),
                        divisionCode: toString(selectedSaleArea.divisionCode, false, false),
                        orgCode: toString(selectedSaleArea.orgCode, false, false)
                    }
                }
                const jsonResponse = await callAPI(apiPath.createSaleOrder, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    clearInputData(qnoRef)
                    customAlert(msg.addSuccess)
                    closeModal()
                    if (jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 && jsonResponse.data.records[0].somOrderNo)
                        setInputCriteria({
                            somOrderNo: jsonResponse.data.records[0].somOrderNo
                        });
                    setShowModal(false)
                }

            } else {
                customAlert(msg.pleaseSelectSaleArea, "W")
            }
        }
    }

    const searchOrderDocType = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.searchOrderDocType, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? formatObjForSelect(jsonResponse.data.records, "docTypeCode", ["docTypeCode", "docTypeNameTh"], " : ") : []
        setDocTypeSelectData(data)
    }

    const searchCustomer = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 1,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.searchCustomer, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? formatObjForSelect(jsonResponse.data.records, "custCode", ["custCode", ["custNameTh", "addressFullnm"]], " : ", 0) : []
        setCustSelectData(data)
    }

    const searchCustomerSaleByCustCode = async (jsonRequestTmp) => {
        const jsonRequest = {
            ...jsonRequestTmp,
            model: {
                custCode: currentCustCode
            }
        }
        const jsonResponse = await callAPI(apiPath.searchCustomerSaleByCustCode, jsonRequest);
        let data = jsonResponse && jsonResponse.data ? jsonResponse.data : null
        setSaleAreaData(data)
    }

    const searchShipToByCustSaleId = async (id) => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                custSaleId: id
            }
        }
        const jsonResponse = await callAPI(apiPath.searchShipToByCustSaleId, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : []
        setShipToData(formatObjForSelect(data, "custCode", ["custCode", "custNameTh"], " : "))
        setShipToFullData(data)
        if (data.length == 1) {
            if (createInputRef.current.shipToCustCode) createInputRef.current.shipToCustCode.setData(data[0].custCode)
        }
    }

    const editFunction = (item) => {
        dispatch(redirect("/saleOrder/addEdit", { editItem: item }))
    }


    const addQuotationNo = async () => {
        let inputData = getInputData(qnoRef, "NE");
        if (!inputData.isInvalid) {
            const jsonRequest = inputData.data
            const jsonResponse = await callAPI(apiPath.createSaleOrderByQuotationNo, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                customAlert(msg.addSuccess)

                // let objectReq = tableRef.current.getJsonReq()
                // fetchAPI(objectReq)

                if (jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 && jsonResponse.data.records[0].somOrderNo) {
                    setInputCriteria({
                        somOrderNo: toString(jsonResponse.data.records[0].somOrderNo, false)
                    });
                }
            }
        }

    }

    return (
        <div>
            <div className="bg-light-green">
                <div className="container pt-2 pb-4">
                    <div style={{ fontSize: 40, lineHeight: 1 }}>
                        {msg.preTitle}
                    </div>
                    <div style={{ fontSize: 75, lineHeight: 1, fontWeight: "bold" }}>
                        {msg.salesOrder}
                    </div>
                </div>
            </div>
            <div className="container pt-4 pb-3 border-bottom-grey">
                <div className="row">
                    <div className="col-3">
                        <Select
                            label={msg.customerName}
                            options={custSelectData}
                            ref={el => inputRef.current.custCode = el}
                        />
                    </div>
                    <div className="col-3">
                        <TextField
                            label={msg.saleOrderNo}
                            ref={el => inputRef.current.somOrderNo = el}
                        />
                    </div>
                    <div className="col-3">
                        <DatePicker
                            label={msg.from}
                            showTodayButton
                            ref={el => inputRef.current.fromDate = el}
                            onChange={setDateFromValue}
                            today={today}
                            focusDate={dateToValue}
                        />
                    </div>
                    <div className="col-3">
                        <DatePicker
                            label={msg.to}
                            showTodayButton
                            ref={el => inputRef.current.toDate = el}
                            onChange={setDateToValue}
                            today={today}
                            currentFocus={dateFromValue}
                            focusDate={dateFromValue}
                            minDate={dateFromValue}
                            maxDate={dateFromValue ? moment(dateFromValue).add(365, 'days').format("YYYY-MM-DD").concat("T00:00:00") : null}
                        />
                    </div>
                </div>
                <div className="d-flex justify-content-center padding-row mt-3">
                    <div>
                        <Button type="search" className="px-5" onClick={handleSearch} />
                    </div>
                </div>
            </div>
            <div className="container">
                <div className="row mt-3">
                    <div className="col-8">
                        <TextField
                            placeholder={msg.quatationNo}
                            ref={el => qnoRef.current.quotationNo = el}
                            require
                            maxLength={10}
                            allowChar="NUM"
                        />
                    </div>
                    <div className="col-2">
                        <Button type="add" onClick={addQuotationNo} />
                    </div>
                    <div className="col-2">
                        <Button customLabel={msg.create} onClick={() => setShowModal(true)} />
                    </div>
                </div>
                <div className="padding-row mt-3">
                    <Table
                        textHeaderBold
                        onSelectPage={fetchAPI}
                        dataTable={data}
                        headerTabel={headerTabel}
                        ref={tableRef}
                        tablewidth={"2000px"}
                    />
                </div>
            </div>
            <Modal
                isBtnClose={false}
                isShow={showModal}
                onClose={closeModal}
                onSave={handleSaveCreate}
                title={msg.createSaleOrder}
                size="lg"
            >
                <div className="row">
                    <div className="col-6 mt-2">
                        <Select
                            label={msg.documentType}
                            options={docTypeSelectData}
                            ref={el => createInputRef.current.docTypeCode = el}
                            require
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <Select
                            label={msg.customerName}
                            options={custSelectData}
                            onChange={handleChangeCustCode}
                            ref={el => createInputRef.current.custCode = el}
                            require
                        />
                    </div>
                    <div className="mt-2 font-normal col-12 pr-0">
                        <div className={isShowTable ? "d-none" : ""}>
                            <div>
                                {msg.saleOrganization} : <span className="font-bold">{selectedSaleArea && selectedSaleArea.orgNameTh ? toString(selectedSaleArea.orgNameTh) : "-"}</span>
                            </div>
                            <div>
                                {msg.distributionChannel} : <span className="font-bold">{selectedSaleArea && selectedSaleArea.channelNameTh ? toString(selectedSaleArea.channelNameTh) : "-"}</span>
                            </div>
                            <div>
                                {msg.divisionLabel} : <span className="font-bold">{selectedSaleArea && selectedSaleArea.divisionNameTh ? toString(selectedSaleArea.divisionNameTh) : "-"}</span>
                            </div>
                            <div className="mt-1 row">
                                <div>
                                    <Button customLabel={msg.selectSaleArea} onClick={() => setIsShowTable(true)} disabled={!currentCustCode} />
                                </div>
                            </div>
                        </div>
                        <div className={isShowTable ? "" : "d-none"}>
                            <div className={saleAreaData ? "d-none" : ""}>
                                Loading.....
                            </div>
                            <Table
                                onSelectPage={searchCustomerSaleByCustCode}
                                dataTable={saleAreaData}
                                headerTabel={headerTabelSaleArea}
                                ref={tableSaleAreaRef}
                                hideGoToPage
                            />
                            {/* <div className="mt-1 row">
                                    <div>
                                        <Button customLabel={msg.close} onClick={() => setIsShowTable(false)} />
                                    </div>
                                </div> */}
                        </div>
                    </div>

                    <div className="col-6 mt-2">
                        <Select
                            label={msg.shipTo}
                            options={shipToData}
                            require
                            disabled={!selectedSaleArea}
                            ref={el => createInputRef.current.shipToCustCode = el}
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <TextField
                            label={msg.description}
                            ref={el => createInputRef.current.description = el}
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <DatePicker
                            require
                            label={msg.reguesteDeliveryDate}
                            showTodayButton
                            ref={el => createInputRef.current.deliveryDte = el}
                            focusDate={dateFromValue}
                            minDate={moment().format("YYYY-MM-DD").concat("T00:00:00")}
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <div className="primaryLebel">
                            {msg.saleRef}
                        </div>
                        <div className="primaryLebel ">
                            {userProfile && userProfile.titleName ? toString(userProfile.titleName) : ""} {userProfile && userProfile.firstName ? toString(userProfile.firstName) : ""} {userProfile && userProfile.lastName ? toString(userProfile.lastName) : ""}
                        </div>
                    </div>
                    <div className="col-6 mt-2">
                        <div className="primaryLebel">
                            {msg.saleGroupLabel}
                        </div>
                        <div className="primaryLebel ">
                            {userProfile && userProfile.saleGroupSaleOfficeCustom && userProfile.saleGroupSaleOfficeCustom.length > 0 && userProfile.saleGroupSaleOfficeCustom[0].descriptionTh ? toString(userProfile.saleGroupSaleOfficeCustom[0].descriptionTh, true) : "-"}
                        </div>
                    </div>
                    <div className="col-6 mt-2">
                        <div className="primaryLebel">
                            {msg.territory}
                        </div>
                        <div className="primaryLebel ">
                            {userProfile && userProfile.saleGroupSaleOfficeCustom && userProfile.saleGroupSaleOfficeCustom.length > 0 && userProfile.saleGroupSaleOfficeCustom[0].territoryNameTh ? toString(userProfile.saleGroupSaleOfficeCustom[0].territoryNameTh, true) : "-"}
                        </div>
                    </div>
                    <div className="col-6 mt-2">
                        <TextField
                            label={msg.contactPerson}
                            ref={el => createInputRef.current.contactPerson = el}
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <TextField
                            isTextArea
                            label={msg.remark}
                            ref={el => createInputRef.current.remark = el}
                        />
                    </div>

                </div>
            </Modal>
        </div >
    )
}
