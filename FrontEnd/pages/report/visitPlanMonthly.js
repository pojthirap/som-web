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
            searchOrder: 2,
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
            pageTitle={msg.visitPlanMonthly}
            headerTabel={headerTabel}
            fetchAPIPath={apiPath.reportRep03VisitPlanMonthly}
            exportAPIPath={apiPath.exportRep03VisitPlanMonthly}
            tablewidth="1500px"
            options={filterDataForSelectSaleRepName()}
            reportMonthly
            hidePerPage
            length={0}
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
                        maxDate={dateFromValue ? moment(dateFromValue).add(1, 'months').format("YYYY-MM-DD").concat("T00:00:00") : null}
                        unit={'months'}
                        lengthDate={1}
                    />
                </div>
                <div className="col-4">
                    <Select
                        require
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
        title: msg.reportDDMMYYYY,
        data: "visitDate",
        type: "code",
    },
    {
        title: msg.reportVisitTimeStart,
        data: "visitTimeStart",
        type: "code",
    },
    {
        title: msg.reportStartCheckinMileNo,
        data: "startDheckinMileNo",
        type: "number",
    },
    {
        title: msg.reportLocStartName,
        data: "locStartName",
        type: "string",
    },
    {
        title: msg.reportVisitTimeStop,
        data: "visitTimeStop",
        type: "code",
    },
    {
        title: msg.reportStopCheckinMileNo,
        data: "stopCheckinMileNo",
        type: "number",
    },
    {
        title: msg.reportLocEndName,
        data: "locEndName",
        type: "string",
    },
    {
        title: msg.reportContactName,
        data: "contactName",
        type: "string",
    },
    {
        title: msg.reportAddressAndPhone,
        data: "address",
        type: "string",
    },
    {
        title: msg.reportVisitDetail,
        data: "visitDetail",
        type: "string",
    },
    {
        title: msg.reportTotalKM,
        data: "totalKmInput",
        type: "number",
    }

]