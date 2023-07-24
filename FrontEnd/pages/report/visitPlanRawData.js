import { useState, useRef, useEffect } from 'react';
import { getInputData, formatObjForSelect, toString } from '@helper';
import Select from '@components/Select';
import DatePicker from '@components/DatePicker';
import ReportBase from "pages/report/components/ReportBase";
import moment from 'moment';
import * as apiPath from '@apiPath'
import * as msg from '@msg'
export default function Main(pageProps) {
    const inputRef = useRef({});
    const [dateFromValue, setDateFromValue] = useState();
    const [dateToValue, setDateToValue] = useState();
    const [prospect, setProspect] = useState();
    const [saleRepName, setSaleRepName] = useState();
    const today = moment()
    useEffect(() => {
        getSaleRepName();
        getProspectName();
    }, [])

    const getSaleRepName = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await pageProps.callAPI(apiPath.searchAdmEmpForReport, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setSaleRepName(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
        }
    }
    const getProspectName = async () => {
        const headerTabel = [{ title: "Prospect", key: "0" }, { title: "Customer", key: "2" }]
        setProspect(headerTabel);
    }
    const filterDataForSelectSaleRepName = () => {
        if (!(saleRepName && saleRepName.records)) return [];
        return formatObjForSelect(saleRepName.records, "empId", ["empId", ["titleName", "firstName", "lastName"]], " : ");
    }
    const filterDataForSelectProspect = () => {
        if (!(prospect)) return [];
        return formatObjForSelect(prospect, "key", "title");
    }
    return (
        <ReportBase
            {...pageProps}
            inputRef={inputRef}
            pageTitle={msg.visitPlanRawData}
            headerTabel={headerTabel}
            fetchAPIPath={apiPath.reportRep01VisitPlanRawData}
            exportAPIPath={apiPath.exportRep01VisitPlanRawData}
            tablewidth="3000px"
        >
            <div className="row">
                <div className="col-3">
                    <DatePicker
                        require
                        today={today}
                        showTodayButton
                        label={msg.reportStartDate}
                        ref={el => inputRef.current.startDate = el}
                        onChange={setDateFromValue}
                        focusDate={dateToValue}
                    />
                </div>
                <div className="col-3">
                    <DatePicker
                        require
                        today={today}
                        showTodayButton
                        label={msg.reportEndDate}
                        ref={el => inputRef.current.endDate = el}
                        onChange={setDateToValue} currentFocus={dateFromValue}
                        focusDate={dateFromValue}
                        minDate={dateFromValue}
                        maxDate={dateFromValue ? moment(dateFromValue).add(62, 'days').format("YYYY-MM-DD").concat("T00:00:00") : null}
                        lengthDate={62}
                    />
                </div>
                <div className="col-3">
                    <Select
                        label={msg.reportSaleRepName}
                        options={filterDataForSelectSaleRepName()}
                        ref={el => inputRef.current.saleRepId = el}
                    />
                </div>
                <div className="col-3">
                    <Select
                        label={msg.prospectAndCustomer}
                        options={filterDataForSelectProspect()}
                        ref={el => inputRef.current.prospectType = el}
                    />
                </div>
            </div>
        </ReportBase >
    )
}

const headerTabel = [
    {
        title: msg.numOrder,
        data: "companyCode",
        type: "rowNum",
    },
    {
        title: msg.reportSaleRepName,
        data: "saleRepName",
        type: "string",
    },
    {
        title: msg.reportSaleRepId,
        data: "saleRepId",
        type: "code",
    },
    {
        title: msg.reportVisitPlanId,
        data: "visitPlanId",
        type: "code",
    },
    {
        title: msg.reportVisitPlanName,
        data: "visitPlanName",
        type: "string",
    },
    {
        title: msg.reportVisitType,
        data: "visitType",
        type: "string",
    },
    {
        title: msg.reportVisitDate,
        data: "visitDate",
        type: "code",
    },
    {
        title: msg.reportName,
        data: "accName",
        type: "string",
    },
    {
        title: msg.reportNameCustomerAndProspect,
        data: "prospectType",
        type: "string",
    },
    {
        title: msg.reportMileStart,
        data: "startMileNo",
        type: "number",
    },
    {
        title: msg.reportMileEnd,
        data: "finishMileNo",
        type: "number",
    },
    {
        title: msg.reportTotalKMInput,
        data: "totalKmInput",
        type: "number",
    },
    {
        title: msg.reportTotalKMSystem,
        data: "totalKmSystem",
        type: "number",
    },
    {
        title: msg.reportPlannedStartDate,
        data: "planStartTime",
        type: "code",
    },
    {
        title: msg.reportPlannedEndDate,
        data: "planEndTime",
        type: "code",
    },
    {
        title: msg.reportActualChekInDate,
        data: "visitCheckinDtm",
        type: "code",
    },
    {
        title: msg.reportActualChekOutDate,
        data: "visitCheckoutDtm",
        type: "code",
    },
    {
        title: msg.reportPlanFailVisit,
        data: "reasonNameTh",
        type: "string",
    }
]