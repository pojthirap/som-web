import { useState, useRef, useEffect } from 'react';
import { getInputData, formatObjForSelect, toString } from '@helper';
import Select from '@components/Select';
import Radio from '@components/Radio'
import DatePicker from '@components/DatePicker';
import ReportBase from "pages/report/components/ReportBase";
import moment from 'moment';
import * as apiPath from '@apiPath'
import * as msg from '@msg'
const radioOption = [
    { value: "N", label: msg.reportTotalNagative },
    { value: "Y", label: msg.reportNotTotalNagative },
]
export default function Main(pageProps) {
    const inputRef = useRef({});
    const [customer, setCustomer] = useState();

    const [dateFromValue, setDateFromValue] = useState();
    const [dateToValue, setDateToValue] = useState();
    const today = moment()

    useEffect(() => {
        getCustomer();
    }, [])

    const getCustomer = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 1,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await pageProps.callAPI(apiPath.searchCustomer, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setCustomer(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
        }
    }

    const filterDataForSelectCustomer = () => {
        if (!(customer && customer.records)) return [];
        return formatObjForSelect(customer.records, "custCode", ["custCode","custNameTh"], " : ");
    }

    return (
        <ReportBase
            {...pageProps}
            inputRef={inputRef}
            pageTitle={msg.materTransaction}
            headerTabel={headerTabel}
            fetchAPIPath={apiPath.reportRep07MeterTransaction}
            exportAPIPath={apiPath.exportRep07MeterTransaction}
            tablewidth="2000px"
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
                        maxDate={dateFromValue ? moment(dateFromValue).add(365, 'days').format("YYYY-MM-DD").concat("T00:00:00") : null}
                    />
                </div>
                <div className="col-4">
                    <Select
                        label={msg.customer}
                        options={filterDataForSelectCustomer()}
                        ref={el => inputRef.current.custCode = el}
                    />
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-4">
                    <Radio
                        label={msg.reportMeterNagative}
                        options={radioOption}
                        defaultValue={"N"}
                        ref={el => inputRef.current.meterNegativeFalg = el}
                    />
                </div>
            </div>
        </ReportBase >
    )
}

const headerTabel = [
    {
        title: msg.reportSaleRepId,
        data: "empId",
        type: "code",
    },
    {
        title: msg.reportSaleRepName,
        data: "saleName",
        type: "string",
    },
    {
        title: msg.reportSaleGroupID,
        data: "groupCode",
        type: "code",
    },
    {
        title: msg.reportSaleGroupName,
        data: "descriptionTh",
        type: "string",
    },
    {
        title: msg.customerName,
        data: "custNameTh",
        type: "string",
    },
    {
        title: msg.customerId,
        data: "custCode",
        type: "code",
    },
    {
        title: msg.dispenserCount,
        data: "cntDispenserNno",
        type: "code",
    },
    {
        title: msg.nozzleCount,
        data: "cntNozzle",
        type: "code",
    },
    {
        title: msg.reportDateMeterLastTime,
        data: "prevRecDate",
        type: "code",
    },
    {
        title: msg.reportDateMaterLast,
        data: "recDate",
        type: "code",
    },
    {
        title: msg.reportVisitID1,
        data: "prevPlanTripId",
        type: "code",
    },
    {
        title: msg.reportVisitID2,
        data: "planTripId",
        type: "code",
    },
    {
        title: msg.meter_visit,
        data: "meterVisit",
        type: "number",
    },
    {
        title: msg.meter_summation,
        data: "meterSummation",
        type: "number",
    },
    {
        title: msg.remark,
        data: "remark",
        type: "string",
    }
]