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
        return formatObjForSelect(customer.records, "custCode", ["custCode", "custNameTh"], " : ");
    }

    return (
        <ReportBase
            {...pageProps}
            inputRef={inputRef}
            pageTitle={msg.materRawData}
            headerTabel={headerTabel}
            fetchAPIPath={apiPath.reportRep06MeterRawData}
            exportAPIPath={apiPath.exportRep06MeterRawData}
            tablewidth="3000px"
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
                        label={msg.customer}
                        options={filterDataForSelectCustomer()}
                        ref={el => inputRef.current.custCode = el}
                    />
                </div>
            </div>
        </ReportBase >
    )
}

const headerTabel = [
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
        title: msg.visitId,
        data: "planTripId",
        type: "code",
    },
    {
        title: msg.visitName,
        data: "planTripName",
        type: "string",
    },
    {
        title: msg.createdOn,
        data: "createDtm",
        type: "code",
    },
    {
        title: msg.changedOn,
        data: "recordDtm",
        type: "code",
    },
    {
        title: msg.productOld,
        data: "prevGasCode",
        type: "code",
    },
    {
        title: msg.productNameOld,
        data: "prevGasNameTh",
        type: "string",
    },
    {
        title: msg.productNew,
        data: "gasCode",
        type: "code",
    },
    {
        title: msg.productNameNew,
        data: "gasNameTh",
        type: "string",
    },
    {
        title: msg.dispenserReport,
        data: "dispenserNo",
        type: "code",
    },
    {
        title: msg.nozzleReport,
        data: "nozzleNo",
        type: "code",
    },
    {
        title: msg.meter_value,
        data: "recRunNo",
        type: "code",
    },
    {
        title: msg.dispenserCount,
        data: "cntDispenserNo",
        type: "code",
    },
    {
        title: msg.nozzleCount,
        data: "cntNozzle",
        type: "code",
    },
    {
        title: msg.checkInLatitude,
        data: "visitLatitude",
        type: "string",
    },
    {
        title: msg.checkInLongitude,
        data: "visitLongitude",
        type: "string",
    },
    {
        title: msg.employeeResponsibleForVisit,
        data: "saleRepName",
        type: "string",
    },
    {
        title: msg.employeeID,
        data: "saleRepId",
        type: "code",
    }
]