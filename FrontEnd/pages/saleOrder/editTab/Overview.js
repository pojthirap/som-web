import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { getInputData, toString, formatObjForSelect, clearInputData, convertFormatFullDateTime } from '@helper';
import { useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import Button from '@components/Button';
import Table from "@components/Table";
import Select from '@components/Select';
import TextField from '@components/TextField';
import DatePicker from '@components/DatePicker';
import moment from 'moment';
import * as apiPath from '@apiPath'
import * as msg from '@msg'

function Main({ callAPI, pathValue, isShow, saleOrderData, clearTableData }, ref) {
    const headerTabelSaleArea = [
        {
            type: "button",
            button: "select",
            selectFunction: (item) => selectFunction(item, false),
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
    const priceListSelectData = [
        { value: "Z1", label: "Z1 : Wholesale" }
    ]
    const createInputRef = useRef({});
    const tableSaleAreaRef = useRef({});
    const [docTypeSelectData, setDocTypeSelectData] = useState([])
    const [custSelectData, setCustSelectData] = useState([])
    const [saleAreaData, setSaleAreaData] = useState(null);
    const [isShowTable, setIsShowTable] = useState(false)
    const [selectedSaleArea, setSelectSaleArea] = useState(null)
    const [initSelectedSaleArea, setInitSelectSaleArea] = useState(null)
    const [shipToData, setShipToData] = useState([])
    const [shipToFullData, setShipToFullData] = useState([])
    const [companyData, setCompanyData] = useState([])
    const [incotermData, setIncotermData] = useState([])
    const [orderReasonData, setOrderReasonData] = useState([])
    const [planData, setPlanData] = useState([])
    const [shippingPointData, setShippingPointData] = useState([])
    const [notiList, setNotiList] = useState([])
    const [currentCustCode, setCurrentCustCode] = useState(null)
    const [currentCompany, setCurrentCompany] = useState(null)
    const [currentPlan, setCurrentPlan] = useState(null)
    const [isOrderReasonReq, setIsOrderReasonReq] = useState(false)
    const permList = useSelector((state) => state.permList);
    const havingPerm = permList.some(perm => perm.permObjCode == "FE_SALEORD_S011");
    const addByQuotationNo = saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.quotationNo ? true : false;
    const isHaveSapOrderNo = saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.sapOrderNo && saleOrderData.saleOrder.sapOrderNo != "0"

    useImperativeHandle(ref, () => ({
        getData(type = "N") {
            if (!saleOrderData) return { isInvalid: true }
            let inputData = getInputData(createInputRef, type);
            if (selectedSaleArea) {
                inputData.data.custSaleId = toString(selectedSaleArea.custSaleId, false, false)
                inputData.data.channelCode = toString(selectedSaleArea.channelCode, false, false)
                inputData.data.divisionCode = toString(selectedSaleArea.divisionCode, false, false)
                inputData.data.orgCode = toString(selectedSaleArea.orgCode, false, false)
            } else {
                inputData.data.custSaleId = ""
                inputData.isInvalid = true
            }
            if (inputData.data.shipToCustCode) {
                const findObj = shipToFullData.find(el => el.custCode == inputData.data.shipToCustCode)
                if (findObj) {
                    inputData.data.shipToCustPartnerId = toString(findObj.custPartnerId, false, false)
                } else {
                    inputData.data.shipToCustCode = ""
                    inputData.data.shipToCustPartnerId = ""
                }
            } else {
                inputData.data.shipToCustPartnerId = ""
            }

            inputData.data = {
                ...saleOrderData.saleOrder,
                ...inputData.data
            }
            inputData.data.orderId = toString(inputData.data.orderId, false, false)
            inputData.data.tax = toString(inputData.data.tax, false, false)
            inputData.data.total = toString(inputData.data.total, false, false)
            inputData.data.netValue = toString(inputData.data.netValue, false, false)

            //hardCode for test
            // inputData.data.shipToCustCode = "0011000506"
            // inputData.data.shipToCustPartnerId = "0011000506"
            //hardCode for test

            inputData.dataSize = inputData.dataSize + 1;
            return inputData;
        },
        resetData() {
            // setInitSelectSaleArea(null)
            clearInputData(createInputRef);
            let objectReq = tableSaleAreaRef.current.getJsonReq()
            searchCustomerSaleByCustCode(objectReq)
            selectFunction(initSelectedSaleArea, true)


            let inputData = getInputData(createInputRef, "NV");
            inputData.data.custSaleId = toString(initSelectedSaleArea.custSaleId, false, false)
            inputData.data.channelCode = toString(initSelectedSaleArea.channelCode, false, false)
            inputData.data.divisionCode = toString(initSelectedSaleArea.divisionCode, false, false)
            inputData.data.orgCode = toString(initSelectedSaleArea.orgCode, false, false)
            if (inputData.data.shipToCustCode) {
                const findObj = shipToFullData.find(el => el.custCode == inputData.data.shipToCustCode)
                if (findObj) {
                    inputData.data.shipToCustPartnerId = toString(findObj.custPartnerId, false, false)
                } else {
                    inputData.data.shipToCustCode = ""
                    inputData.data.shipToCustPartnerId = ""
                }
            } else {
                inputData.data.shipToCustPartnerId = ""
            }


            inputData.data = {
                ...saleOrderData.saleOrder,
                ...inputData.data
            }
            inputData.data.orderId = toString(inputData.data.orderId, false, false)
            inputData.data.tax = toString(inputData.data.tax, false, false)
            inputData.data.total = toString(inputData.data.total, false, false)
            inputData.data.netValue = toString(inputData.data.netValue, false, false)
            inputData.dataSize = inputData.dataSize + 1;
            return inputData;
        }

    }));

    useEffect(() => {
        getNotifyTabOverview()
        if (saleOrderData) {
            searchOrderDocType();
            searchCustomer();
            searchOrderIncoterm();
            searchOrderReason();
        }
    }, [saleOrderData])

    const searchPlantByCompanyCode = async (code) => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                companyCode: code
            }
        }
        const jsonResponse = await callAPI(apiPath.searchPlantByCompanyCode, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? formatObjForSelect(jsonResponse.data.records, "plant", ["plant", "name2"], " : ") : []
        setPlanData(data)
    }

    const searchShippingPointByPlantCode = async (code, shippingCond = null) => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                plantCode: code,
                shippingConditions: shippingCond ? shippingCond : (selectedSaleArea && selectedSaleArea.shippingCond ? selectedSaleArea.shippingCond : null)

            }
        }
        const jsonResponse = await callAPI(apiPath.searchShippingPointByPlantCode, jsonRequest);

        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? formatObjForSelect(jsonResponse.data.records, "shipping_Point_Receiving_Pt", "shipping_Point_Receiving_Pt_Name") : []
        setShippingPointData(data)
    }

    const searchOrderReason = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 1,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.searchOrderReason, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? formatObjForSelect(jsonResponse.data.records, "reasonCode", "reasonNameTh") : []
        setOrderReasonData(data)
    }
    const searchOrderIncoterm = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.searchOrderIncoterm, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? formatObjForSelect(jsonResponse.data.records, "incotermCode", ["incotermCode", "description"], " : ") : []
        setIncotermData(data)
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
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? formatObjForSelect(jsonResponse.data.records, "docTypeCode", "docTypeNameTh") : []
        setDocTypeSelectData(data)
    }

    const searchCustomer = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.searchCustomer, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? formatObjForSelect(jsonResponse.data.records, "custCode", ["custCode", "custNameTh"], " : ") : []
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
        if (!initSelectedSaleArea && saleOrderData && data && jsonRequest.model.custCode) {
            if (data.records && data.records.length > 0 && saleOrderData && saleOrderData.saleOrder) {
                const initItem = {
                    channelCode: saleOrderData.saleOrder.channelCode,
                    channelNameTh: saleOrderData.saleOrder.channelNameTh,
                    custSaleId: saleOrderData.saleOrder.custSaleId,
                    divisionCode: saleOrderData.saleOrder.divisionCode,
                    divisionNameTh: saleOrderData.saleOrder.divisionNameTh,
                    orgCode: saleOrderData.saleOrder.orgCode,
                    orgNameTh: saleOrderData.saleOrder.orgNameTh,
                    shippingCond: saleOrderData.saleOrder.shippingCond
                }
                setInitSelectSaleArea(initItem)
                selectFunction(initItem, true)
                // if (createInputRef.current && createInputRef.current.priceList) createInputRef.current.priceList.clearValue()
            } else {
                setInitSelectSaleArea({})
            }
        }
    }

    const searchShipToByCustSaleId = async (id) => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                custSaleId: toString(id, false, false)
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

    const searchCompany = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                custCode: currentCustCode
            }
        }
        const jsonResponse = await callAPI(apiPath.searchCompany, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? formatObjForSelect(jsonResponse.data.records, "companyCode", ["companyCode", "companyNameTh"], " : ") : []
        setCompanyData(data)
    }


    useEffect(() => {
        if (tableSaleAreaRef.current && tableSaleAreaRef.current.getJsonReq instanceof Function) {
            let objectReq = tableSaleAreaRef.current.getJsonReq()
            searchCustomerSaleByCustCode(objectReq)
        }
        if (currentCustCode) searchCompany();
    }, [currentCustCode])

    const handleChangeCustCode = (value, isInit = false) => {
        setIsShowTable(false)
        setSelectSaleArea(null)
        setSaleAreaData(null)
        setCurrentCustCode(value)
        setShipToData([])
        setShipToFullData([])
        if (isInit) {
            createInputRef.current.shipToCustCode.clearValue()
            createInputRef.current.shipToCustCode.clearValidate()
        } else {

            createInputRef.current.shipToCustCode.clearToEmpty()
            createInputRef.current.shipToCustCode.clearValidate()
        }
        handleChangeCompany(null, isInit)
        handleChangePlan(null, isInit)
    }
    const handleChangeCompany = (value, isInit = false) => {
        if (value) {
            setPlanData([])
            searchPlantByCompanyCode(value);
        } else {
            setPlanData([])
        }
        setCurrentCompany(value)
        handleChangePlan(null, isInit)
        if (isInit) {
            createInputRef.current.plantCode.clearValue()
            createInputRef.current.plantCode.clearValidate()
        } else {

            createInputRef.current.plantCode.clearToEmpty()
            createInputRef.current.plantCode.clearValidate()
        }

    }

    const handleChangePlan = (value, isInit = false) => {
        if (value) {
            setShippingPointData([])
            searchShippingPointByPlantCode(value);
        } else {
            setShippingPointData([])
        }
        setCurrentPlan(value)
        if (isInit) {
            createInputRef.current.shipCode.clearValue()
            createInputRef.current.shipCode.clearValidate()
        } else {
            createInputRef.current.shipCode.clearToEmpty()
            createInputRef.current.shipCode.clearValidate()
        }
    }

    const selectFunction = (item, isInit = false) => {
        if (item && item.custSaleId) {
            setSelectSaleArea(item)
            setIsShowTable(false)
            searchShipToByCustSaleId(item.custSaleId)
            if (currentPlan) searchShippingPointByPlantCode(currentPlan, item.shippingCond)
            if (isInit) {
                createInputRef.current.shipToCustCode.clearValue()
                createInputRef.current.shipToCustCode.clearValidate()
            } else {
                createInputRef.current.shipToCustCode.clearToEmpty()
                createInputRef.current.shipToCustCode.clearValidate()
                if (createInputRef.current && createInputRef.current.priceList) createInputRef.current.priceList.clearToEmpty()
            }
        }
    }

    const getNotifyTabOverview = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                OrderId: toString(pathValue.editItem.orderId, false, false)
            }
        }
        const jsonResponse = await callAPI(apiPath.getNotifyTabOverview, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : []
        setNotiList(data)
    }

    const NotiItem = (data) => {
        return (
            <div className="alert-text-box">
                {data.orderActionName}: {data.somOrderNo ? data.somOrderNo : "-"}/{data.sapOrderNo ? data.sapOrderNo : "-"} : {convertFormatFullDateTime(data.createDtm)} : {data.sapStatus == "S" ? "Success" : "Fail"} : {data.sapMsg}
            </div>
        )
    }

    const onChangeDocType = (value) => {
        setIsOrderReasonReq(value === "ZSO8")
    }

    if (havingPerm) {
        return (
            <div className={"container py-4" + (isShow ? "" : " d-none")}>
                <div className="notification-container">
                    <div className="noti-header">
                        <FontAwesomeIcon icon={faBell} style={{ fontSize: 30 }} />
                        <span style={{ fontSize: 40, marginLeft: 10 }}>
                            {msg.notifications}
                        </span>
                    </div>
                    {notiList.map(data => (
                        NotiItem(data)
                    ))}
                </div>
                <div className="row">
                    <div className="col-6 mt-2">
                        <Select
                            label={msg.documentType}
                            options={docTypeSelectData}
                            ref={el => createInputRef.current.docTypeCode = el}
                            defaultValue={saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.docTypeCode ? toString(saleOrderData.saleOrder.docTypeCode) : ""}
                            onChange={onChangeDocType}
                            onInit={onChangeDocType}
                            require
                            disabled={isHaveSapOrderNo}
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <Select
                            label={msg.customerName}
                            options={custSelectData}
                            onInit={(item) => handleChangeCustCode(item, true)}
                            onChange={handleChangeCustCode}
                            ref={el => createInputRef.current.custCode = el}
                            defaultValue={saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.custCode ? toString(saleOrderData.saleOrder.custCode) : ""}
                            disabled
                            placeholder={addByQuotationNo ? "-" : null}
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
                                    <Button customLabel={msg.selectSaleArea} onClick={() => setIsShowTable(true)} disabled={!currentCustCode || addByQuotationNo || isHaveSapOrderNo}/>
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
                        </div>
                    </div>

                    <div className="col-6 mt-2">
                        <Select
                            label={msg.shipTo}
                            options={shipToData}
                            require
                            disabled={!selectedSaleArea || addByQuotationNo}
                            placeholder={addByQuotationNo ? "-" : null}
                            ref={el => createInputRef.current.shipToCustCode = el}
                            defaultValue={saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.shipToCustCode ? toString(saleOrderData.saleOrder.shipToCustCode) : ""}
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <Select
                            label={msg.priceList}
                            options={priceListSelectData}
                            disabled={!(selectedSaleArea && selectedSaleArea.channelCode == "30")}
                            defaultValue={saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.priceList ? toString(saleOrderData.saleOrder.priceList) : ""}
                            ref={el => createInputRef.current.priceList = el}
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <div className="primaryLebel">
                            {msg.salesOrderSap}
                        </div>
                        <div className="primaryLebel ">
                            {saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.sapOrderNo ? toString(saleOrderData.saleOrder.sapOrderNo, true) : "-"}
                        </div>
                    </div>
                    <div className="col-6 mt-2">
                        <TextField
                            label={msg.description}
                            ref={el => createInputRef.current.description = el}
                            defaultValue={saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.description ? toString(saleOrderData.saleOrder.description) : ""}
                            disabled={addByQuotationNo}
                            placeholder={addByQuotationNo ? "-" : null}
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <DatePicker
                            require
                            label={msg.reguesteDeliveryDate}
                            showTodayButton
                            ref={el => createInputRef.current.deliveryDte = el}
                            minDate={moment().format("YYYY-MM-DD").concat("T00:00:00")}
                            defaultValue={saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.deliveryDte ? toString(saleOrderData.saleOrder.deliveryDte) : ""}
                            disabled={addByQuotationNo}
                            placeholder={addByQuotationNo ? "-" : null}

                        />
                    </div>
                    <div className="col-6 mt-2">
                        <div className="primaryLebel">
                            {msg.saleRef}
                        </div>
                        <div className="primaryLebel ">
                            {saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.saleRep ? toString(saleOrderData.saleOrder.saleRep, true) : "-"}
                        </div>
                    </div>
                    <div className="col-6 mt-2">
                        <div className="primaryLebel">
                            {msg.saleGroupLabel}
                        </div>
                        <div className="primaryLebel ">
                            {saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.groupDescTh ? toString(saleOrderData.saleOrder.groupDescTh, true) : "-"}
                        </div>
                    </div>
                    <div className="col-6 mt-2">
                        <div className="primaryLebel">
                            {msg.territory}
                        </div>
                        <div className="primaryLebel ">
                            {saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.territory ? toString(saleOrderData.saleOrder.territory, true) : "-"}
                        </div>
                    </div>
                    <div className="col-6 mt-2">
                        <TextField
                            label={msg.PONumber}
                            ref={el => createInputRef.current.poNo = el}
                            defaultValue={saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.poNo ? toString(saleOrderData.saleOrder.poNo) : ""}
                            disabled={addByQuotationNo}
                            placeholder={addByQuotationNo ? "-" : null}
                            maxLength={13}
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <TextField
                            label={msg.contactPerson}
                            ref={el => createInputRef.current.contactPerson = el}
                            defaultValue={saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.contactPerson ? toString(saleOrderData.saleOrder.contactPerson) : ""}
                            disabled={addByQuotationNo}
                            placeholder={addByQuotationNo ? "-" : null}
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <TextField
                            isTextArea
                            label={msg.remark}
                            ref={el => createInputRef.current.remark = el}
                            defaultValue={saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.remark ? toString(saleOrderData.saleOrder.remark) : ""}
                            disabled={addByQuotationNo}
                            placeholder={addByQuotationNo ? "-" : null}
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <Select
                            label={msg.orderReason}
                            options={orderReasonData}
                            ref={el => createInputRef.current.reasonCode = el}
                            defaultValue={saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.reasonCode ? toString(saleOrderData.saleOrder.reasonCode) : ""}
                            disabled={addByQuotationNo}
                            placeholder={addByQuotationNo ? "-" : null}
                            require={isOrderReasonReq}
                        />
                    </div>
                    <div className="col-6 mt-2 row p-0">
                        <div className="col-8">
                            <div className="primaryLebel">
                                {msg.message}
                            </div>
                            <div className="primaryLebel ">
                                {saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.sapMsg ? toString(saleOrderData.saleOrder.sapMsg, true) : "-"}
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="primaryLebel">
                                {msg.creditStatus}
                            </div>
                            <div className="primaryLebel ">
                                {saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.creditStatus ? toString(saleOrderData.saleOrder.creditStatus, true) : "-"}
                            </div>
                        </div>
                    </div>
                    <div className="col-6 mt-2">
                        <div className="primaryLebel">
                            {msg.reasonForRejection}
                        </div>
                        <div className="primaryLebel ">
                            {saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.reasonReject ? toString(saleOrderData.saleOrder.reasonReject, true) : "-"}
                        </div>
                    </div>
                    <div className="col-6 mt-2">
                        <div className="primaryLebel">
                            {msg.netValueBySo}
                        </div>
                        <div className="primaryLebel ">
                            {saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.netValue ? saleOrderData.saleOrder.netValue.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "-"}
                        </div>
                    </div>
                    <div className="col-6 mt-2">
                        <div className="primaryLebel">
                            {msg.taxAmountBySo}
                        </div>
                        <div className="primaryLebel ">
                            {saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.tax ? saleOrderData.saleOrder.tax.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "-"}
                        </div>
                    </div>
                    <div className="col-6 mt-2">
                        <div className="primaryLebel">
                            {msg.totalNetValueBySo}
                        </div>
                        <div className="primaryLebel ">
                            {saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.total ? saleOrderData.saleOrder.total.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "-"}
                        </div>
                    </div>
                    <div className="col-6 mt-2">
                        <div className="primaryLebel">
                            {msg.paymentTerms}
                        </div>
                        <div className="primaryLebel ">
                            {saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.paymentTerm ? toString(saleOrderData.saleOrder.paymentTerm, true) : "-"}
                        </div>
                    </div>
                    <div className="col-6 mt-2">
                        <Select
                            label={msg.incoterms}
                            ref={el => createInputRef.current.incoterm = el}
                            defaultValue={saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.incoterm ? toString(saleOrderData.saleOrder.incoterm) : ""}
                            options={incotermData}
                            disabled={addByQuotationNo}
                            placeholder={addByQuotationNo ? "-" : null}
                            require
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <Select
                            label={msg.company}
                            options={companyData}
                            disabled={!currentCustCode || addByQuotationNo}
                            placeholder={addByQuotationNo ? "-" : null}
                            onChange={handleChangeCompany}
                            onInit={(item) => handleChangeCompany(item, true)}
                            ref={el => createInputRef.current.companyCode = el}
                            defaultValue={saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.companyCode ? toString(saleOrderData.saleOrder.companyCode) : ""}
                            require
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <Select
                            label={msg.plant}
                            disabled={!currentCompany || addByQuotationNo}
                            placeholder={addByQuotationNo ? "-" : null}
                            onChange={handleChangePlan}
                            onInit={(item) => handleChangePlan(item, true)}
                            options={planData}
                            ref={el => createInputRef.current.plantCode = el}
                            defaultValue={saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.plantCode ? toString(saleOrderData.saleOrder.plantCode) : ""}
                            require
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <Select
                            label={msg.shippingPoint}
                            disabled={!currentPlan || addByQuotationNo}
                            placeholder={addByQuotationNo ? "-" : null}
                            options={shippingPointData}
                            ref={el => createInputRef.current.shipCode = el}
                            defaultValue={saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.shipCode ? toString(saleOrderData.saleOrder.shipCode) : ""}
                            require
                        />
                    </div>
                    <div className="col-6 mt-2">
                        <div className="primaryLebel">
                            {msg.salesSupervisor}
                        </div>
                        <div className="primaryLebel ">
                            {saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.saleSup ? toString(saleOrderData.saleOrder.saleSup, true) : "-"}
                        </div>
                    </div>
                    <div className="col-6 mt-2">
                        <div className="primaryLebel">
                            {msg.status}
                        </div>
                        <div className="primaryLebel ">
                            {saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.orderStatusDesTh ? toString(saleOrderData.saleOrder.orderStatusDesTh, true) : "-"}
                        </div>
                    </div>

                </div>
            </div>
        )
    } else {
        return (
            <div className={"container py-4" + (isShow ? "" : " d-none")}>
                <div className="h1 huge-font mt-4 ml-4">
                    You don't have permission in this page.
                </div>
            </div>
        )
    }
}
export default forwardRef(Main)