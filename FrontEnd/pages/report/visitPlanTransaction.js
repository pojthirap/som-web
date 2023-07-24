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
    const [saleRepName, setSaleRepName] = useState();

    const [dateFromValue, setDateFromValue] = useState();
    const [dateToValue, setDateToValue] = useState();
    const today = moment()

    useEffect(() => {
        getSaleRepName();
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

    const filterDataForSelectSaleRepName = () => {
        if (!(saleRepName && saleRepName.records)) return [];
        return formatObjForSelect(saleRepName.records, "empId", ["empId", ["titleName", "firstName", "lastName"]], " : ");
    }

    return (
        <ReportBase
            {...pageProps}
            inputRef={inputRef}
            pageTitle={msg.visitPlanTransaction}
            headerTabel={headerTabel}
            fetchAPIPath={apiPath.reportRep02VisitPlanTransaction}
            exportAPIPath={apiPath.exportRep02VisitPlanTransaction}
            tablewidth="1500px"
            isVisitPlanTransaction
        >
            <div className="row">
                <div className="col-4">
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
                <div className="col-4">
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
                <div className="col-4">
                    <Select
                        label={msg.reportSaleRepName}
                        options={filterDataForSelectSaleRepName()}
                        ref={el => inputRef.current.saleRepId = el}
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
        title: msg.reportSaleId,
        data: "saleRepId",
        type: "code",
    },
    {
        title: msg.reportSaleRepName,
        data: "saleRepName",
        type: "string",
    },
    {
        title: msg.reportStartDate,
        data: "startDate",
        type: "date",
    },
    {
        title: msg.reportEndDate,
        data: "endDate",
        type: "date",
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
    }
]