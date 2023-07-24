import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux'
import { getInputData } from '@helper';
import Button from '@components/Button';
import Table from "@components/Table";
import * as msg from '@msg'
import { formatDateTime } from '@helper';
import moment from 'moment';

export default function ReportBase(props) {
    const {
        children,
        callAPI,
        downloadFromAPI,
        pageTitle,
        headerTabel,
        inputRef,
        fetchAPIPath,
        exportAPIPath,
        tablewidth,
        isVisitPlanTransaction,
        dynamicReport,
        options,
        hidePerPage,
        length = 10,
        reportDaily,
        reportMonthly,
        reportVisitPlanActual,
        reportSaleOrderByChannel,
        reportSaleOrderByCompany,
        reportStockCardCustomerSummary,
        reportProspectPerformancePerSaleRepAndSaleGroup,
    } = props

    const tableRef = useRef({});
    const [data, setData] = useState();
    const [inputCriteria, setInputCriteria] = useState(null);
    const userProfile = useSelector((state) => state.userProfile);
    const [jsonRequest, setJsonRequest] = useState();
    const [dateTimeCreateDate, setDateTimeCreateDate] = useState();
    const [headerDynamic, setHeaderDynamic] = useState([]);
    const [tpNameTh, setTpNameTh] = useState([]);
    const [saleRep, setSaleRep] = useState({});
    const [hideTable, setHideTable] = useState(false);

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        fetchAPI(objectReq)
    }, [inputCriteria])

    const handleConfirm = () => {
        let inputData = getInputData(inputRef, "NE");
        if (!inputData.isInvalid) {
            let startDate = inputData.data.startDate ? inputData.data.startDate.split("T") : ""
            let endDate = inputData.data.endDate ? inputData.data.endDate.split("T") : ""
            inputData.data.startDate = moment(startDate[0]).format('YYYYMMDD')
            inputData.data.endDate = moment(endDate[0]).format('YYYYMMDD')
            if (reportDaily || reportMonthly || reportVisitPlanActual) {
                for (var i = 0; i < options.length; i++) {
                    if (options[i].value === inputData.data.saleRepId) {
                        setSaleRep(options[i]);
                        inputData.data.saleRepName = options[i].label
                    }
                }
            }
            else if (reportSaleOrderByChannel) {
                inputData.data.listSaleOrg = inputData.data.listSaleOrg ? inputData.data.listSaleOrg.split(",") : []
            }
            else if (reportSaleOrderByCompany) {
                inputData.data.listCompany = inputData.data.listCompany ? inputData.data.listCompany.split(",") : []
            }
            else if (reportStockCardCustomerSummary) {
                inputData.data.reportUnitFalg = inputData.data.reportUnitFalg ? "Y" : ""
            }
            setInputCriteria(inputData.data);
        }

        let dateObj = moment();
        let buddhaYear = dateObj.year() + 543;
        let dateStr = dateObj.format('DD/MM') + "/" + buddhaYear + " " + dateObj.format('HH:mm');
        setDateTimeCreateDate(dateStr);
    }
    const handleExport = async () => {
        jsonRequest.length = 0
        const jsonResponse = await downloadFromAPI(exportAPIPath, jsonRequest, true)
    }

    const fetchAPI = async (jsonRequestTmp) => {
        const jsonRequest = {
            ...jsonRequestTmp,
            model: inputCriteria
        }
        jsonRequest.length = length
        if (inputCriteria) {
            const jsonResponse = await callAPI(fetchAPIPath, jsonRequest)

            if (jsonResponse && jsonResponse.data && jsonResponse.data.records.length != 0) {
                if (reportProspectPerformancePerSaleRepAndSaleGroup) {
                    let summary = {
                        saleRepId: "Summary",
                        saleGroupCode: "Summary",
                        totalProspect: 0,
                        totalProspectChange: 0,
                        performPercent: 0
                    }
                    jsonResponse.data.records.forEach((e) => {
                        summary.totalProspect += Number(e.totalProspect)
                        summary.totalProspectChange += Number(e.totalProspectChange)
                    })
                    summary.performPercent = ((summary.totalProspectChange * 100) / summary.totalProspect).toFixed(2)
                    jsonResponse.data.records.push(summary)
                }
                else if (reportDaily) {
                    let arrayData = []
                    let summary = {
                        number: "Summary",
                        totalKmInput: 0,
                        totalKmSystem: 0
                    }
                    jsonResponse.data.records.forEach((e, index) => {
                        arrayData.push({
                            number: (index + 1).toString(),
                            ...e
                        })
                    })
                    arrayData.forEach((e) => {
                        summary.totalKmInput += Number(e.totalKmInput)
                        summary.totalKmSystem += Number(e.totalKmSystem)
                    })
                    arrayData.push(summary)
                    jsonResponse.data.records = arrayData
                }
                else if (reportMonthly) {
                    let summary = {
                        visitDate: "Summary",
                        totalKmInput: 0
                    }
                    jsonResponse.data.records.forEach((e) => {
                        summary.totalKmInput += Number(e.totalKmInput)
                    })
                    jsonResponse.data.records.push(summary)
                }
                else if (reportSaleOrderByChannel) {
                    let summary = {
                        channelDesc: "Summary",
                        saleGroupDesc: "",
                        totalOrder: 0,
                        totalSapOrder: 0,
                        totalSomOrder: 0,
                        percentSap: 0,
                        percentSom: 0
                    }
                    jsonResponse.data.records.forEach((e) => {
                        summary.totalOrder += Number(e.totalOrder)
                        summary.totalSapOrder += Number(e.totalSapOrder)
                        summary.totalSomOrder += Number(e.totalSomOrder)
                    })
                    summary.percentSap = ((summary.totalSapOrder * 100) / summary.totalOrder).toFixed(2)
                    summary.percentSom = ((summary.totalSomOrder * 100) / summary.totalOrder).toFixed(2)

                    jsonResponse.data.records.push(summary)
                }
                else if (reportSaleOrderByCompany) {
                    let arrayData = []

                    jsonResponse.data.records[0].company.forEach((company) => {
                        let index = arrayData.length
                        let total_Sale_Order = 0
                        let sO_SAP = 0
                        let sO_SOM = 0
                        let sO_div_SAP = 0
                        let sO_div_SOM = 0
                        arrayData.push({
                            columnName: company.company_Name_EN,
                            total_Sale_Order: total_Sale_Order,
                            sO_SAP: sO_SAP,
                            sO_SOM: sO_SOM,
                            sO_div_SAP: sO_div_SAP,
                            sO_div_SOM: sO_div_SOM
                        })
                        company.distribution.forEach((channel) => {
                            channel.sale_Order_Report.forEach((saleOrder) => {
                                total_Sale_Order += Number(saleOrder.total_Sale_Order)
                                sO_SAP += Number(saleOrder.sO_SAP)
                                sO_SOM += Number(saleOrder.sO_SOM)
                                arrayData.push({
                                    columnName: "- " + channel.distribution_Channel_Name,
                                    total_Sale_Order: saleOrder.total_Sale_Order,
                                    sO_SAP: saleOrder.sO_SAP,
                                    sO_SOM: saleOrder.sO_SOM,
                                    sO_div_SAP: saleOrder.sO_div_SAP,
                                    sO_div_SOM: saleOrder.sO_div_SOM
                                })
                            })
                        })
                        arrayData[index].total_Sale_Order = total_Sale_Order
                        arrayData[index].sO_SAP = sO_SAP
                        arrayData[index].sO_SOM = sO_SOM
                        arrayData[index].sO_div_SAP = (sO_SAP * 100) / total_Sale_Order
                        arrayData[index].sO_div_SOM = (sO_SOM * 100) / total_Sale_Order
                    })
                    jsonResponse.data.records = arrayData
                }
                else if (reportStockCardCustomerSummary) {
                    if (!jsonResponse.data.records[0].listSaleGroup.length) {
                        setHideTable(true)
                    }
                    else {
                        setHideTable(false)
                        let headerTabel = [{ title: "Sale Group", title2: "- Sale Rep Name", title3: "- Customer", title4: "- Month", data: "1", type: "headerRowCustomPadding", textAlign: "left" }]
                        let arrayData = []
                        let total = {}
                        total["1"] = "Grand Total"
                        jsonResponse.data.records[0].listSaleGroup.forEach((group) => {
                            let arrayGroup = {}
                            arrayGroup["1"] = "- " + group.groupDesc
                            arrayGroup["type"] = "group"
                            arrayData.push(arrayGroup)
                            group.listSaleRep.forEach((emp) => {
                                let arrayEmp = {}
                                arrayEmp["1"] = "- " + emp.empName
                                arrayEmp["type"] = "emp"
                                arrayData.push(arrayEmp)
                                emp.listCust.forEach((cust) => {
                                    let arrayCust = {}
                                    arrayCust["1"] = "- " + cust.custNameTh
                                    arrayCust["type"] = "cust"
                                    arrayData.push(arrayCust)
                                    cust.listMonth.forEach((month) => {
                                        let arrayMonth = {}
                                        arrayMonth["1"] = "- " + month.mon;
                                        arrayMonth["type"] = "month"
                                        month.listQty.forEach((qty) => {
                                            arrayMonth[qty.colmNo] = qty.recQty;
                                            if (!arrayCust[qty.colmNo]) {
                                                arrayCust[qty.colmNo] = Number(arrayMonth[qty.colmNo]);
                                                if (!arrayEmp[qty.colmNo]) {
                                                    arrayEmp[qty.colmNo] = arrayCust[qty.colmNo];
                                                    if (!arrayGroup[qty.colmNo]) {
                                                        arrayGroup[qty.colmNo] = arrayEmp[qty.colmNo];
                                                    }
                                                    else {
                                                        arrayGroup[qty.colmNo] += arrayEmp[qty.colmNo];
                                                    }
                                                }
                                                else if (arrayEmp[qty.colmNo]) {
                                                    arrayEmp[qty.colmNo] += arrayCust[qty.colmNo];
                                                    if (arrayGroup[qty.colmNo]) {
                                                        arrayGroup[qty.colmNo] += arrayCust[qty.colmNo];
                                                    }
                                                }
                                            }
                                            else {
                                                arrayCust[qty.colmNo] += Number(arrayMonth[qty.colmNo]);
                                                if (arrayEmp[qty.colmNo]) {
                                                    arrayEmp[qty.colmNo] += Number(arrayMonth[qty.colmNo]);
                                                    if (arrayGroup[qty.colmNo]) {
                                                        arrayGroup[qty.colmNo] += Number(arrayMonth[qty.colmNo]);
                                                    }
                                                }
                                            }
                                            if (!total[qty.colmNo]) {
                                                total[qty.colmNo] = arrayGroup[qty.colmNo]
                                            }
                                            else {
                                                total[qty.colmNo] += Number(arrayMonth[qty.colmNo])
                                            }
                                        })
                                        arrayData.push(arrayMonth)
                                    })
                                })
                            })
                        })
                        arrayData.push(total)
                        for (const header in jsonResponse.data.records[0].mapColmn) {
                            if (jsonResponse.data.records[0].mapColmn[header][0].indexOf("Report Unit") == 0) {
                                headerTabel.push({ title: jsonResponse.data.records[0].mapColmn[header][0], data: jsonResponse.data.records[0].mapColmn[header][1], type: "number", color: "#FAA272" })
                            }
                            else{
                                headerTabel.push({ title: jsonResponse.data.records[0].mapColmn[header][0], data: jsonResponse.data.records[0].mapColmn[header][1], type: "number" })
                            }
                        }
                        headerTabel.sort(function (a, b) {
                            return a.data - b.data
                        })
                        jsonResponse.data.records = arrayData
                        setHeaderDynamic(headerTabel)
                    }
                }
            }

            if (reportVisitPlanActual) {
                let totalPlanAccName = 0
                let totalActualAccName = 0
                let arrayVisitPlanActual = []
                jsonResponse.data.records.forEach((e, index) => {
                    arrayVisitPlanActual.push(e)
                    const objTotal = {
                        planAccName: 0,
                        actualAccName: 0
                    }
                    if (e.lastRecordFlag == "N") {
                        if (e.planAccName) {
                            totalPlanAccName++
                        }
                        if (e.actualAccName) {
                            totalActualAccName++
                        }
                    }
                    if (e.lastRecordFlag == "Y") {
                        if (e.planAccName) {
                            totalPlanAccName++
                        }
                        if (e.actualAccName) {
                            totalActualAccName++
                        }
                        objTotal.planAccName = totalPlanAccName
                        objTotal.actualAccName = totalActualAccName
                        arrayVisitPlanActual.push(objTotal)
                        totalActualAccName = 0
                        totalPlanAccName = 0
                    }
                })
                jsonResponse.data.records = arrayVisitPlanActual
            }


            if (isVisitPlanTransaction) {
                for (let i = 0; i < jsonResponse.data.records.length; i++) {
                    jsonResponse.data.records[i].startDate = moment(inputCriteria.startDate).format('DD/MM/YYYY')
                    jsonResponse.data.records[i].endDate = moment(inputCriteria.endDate).format('DD/MM/YYYY')
                }
            }

            if (dynamicReport) {
                setTpNameTh(jsonResponse.data.records[0].tpNameTh);
                let headerTabel = []
                let bodyTabel = []
                for (const header in jsonResponse.data.records[0].headColumn) {
                    if (jsonResponse.data.records[0].headColumn[header]) {
                        headerTabel.push({ title: jsonResponse.data.records[0].headColumn[header], data: header })
                    }
                }

                if (jsonResponse.data.records[0].bodyColumn.length > 0) {
                    jsonResponse.data.records[0].bodyColumn.forEach((e) => {
                        for (const [key, value] of Object.entries(e)) {
                            let result = moment(value, 'YYYYMMDD', true).isValid();
                            if (result) {
                                let dateObj = moment(value);
                                let dateStr = dateObj.format('DD/MM/YYYY');
                                e[key] = dateStr
                            }
                        }
                        bodyTabel.push(Object.fromEntries(Object.entries(e).slice(0, headerTabel.length)))
                    })
                }
                jsonResponse.data.records = bodyTabel
                setJsonRequest(jsonRequest)
                setHeaderDynamic(headerTabel)
                setData(jsonResponse && jsonResponse.data ? jsonResponse.data : null)
            }
            else {
                setJsonRequest(jsonRequest)
                setData(jsonResponse && jsonResponse.data ? jsonResponse.data : null)
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
                        {pageTitle}
                    </div>
                </div>
            </div>

            <div className="container pt-4 pb-3 border-bottom-grey">
                {children}
                <div className="d-flex justify-content-end padding-row mt-3">
                    <div>
                        <Button customLabel={msg.search} className="px-5" onClick={handleConfirm} />
                    </div>
                </div>
            </div>

            <div className="container mb-3">
                {data ?
                    <div className="py-3">
                        <div style={{ justifyContent: "space-between" }} className="row col-12">
                            <div>
                                <Button type="tertiary" customLabel={msg.exportMsg} className="px-5" onClick={handleExport} />
                            </div>
                            <div style={{ fontSize: "1.25rem" }} className="d-flex align-items-center">
                                <div className="text-bold">
                                    {msg.reportCreateBy} :
                                </div>
                                <div className="ml-1">
                                    {userProfile.firstName}
                                </div>
                                <div className="text-bold ml-5">
                                    {msg.reportCreateDate} :
                                </div>
                                <div className="ml-1">
                                    {dateTimeCreateDate}
                                </div>

                                {reportDaily || reportMonthly || reportVisitPlanActual ?
                                    <div className="row">
                                        <div className="text-bold ml-5">
                                            {msg.reportSaleRepName} :
                                        </div>
                                        <div className="ml-1">
                                            {saleRep.label}
                                        </div>
                                        <div className="text-bold ml-5">
                                            {msg.reportSaleRepId} :
                                        </div>
                                        <div className="ml-1">
                                            {saleRep.value}
                                        </div>
                                    </div> : null}
                            </div>
                        </div>
                        {dynamicReport ?
                            <div style={{ fontSize: "1.25rem", justifyContent: "end", height: "50px" }} className="d-flex align-items-center col-12">
                                <div className="text-bold">
                                    {msg.reportAssignProjectName} :
                                </div>
                                <div className="ml-1">
                                    {tpNameTh}
                                </div>
                            </div> : null}
                    </div>
                    :
                    null
                }
                <Table
                    onSelectPage={fetchAPI}
                    dataTable={data}
                    headerTabel={dynamicReport || reportStockCardCustomerSummary ? headerDynamic : headerTabel}
                    ref={tableRef}
                    tablewidth={tablewidth}
                    hidePerPage={hidePerPage}
                    hideTable={hideTable}
                />
            </div>
        </div>
    )

}