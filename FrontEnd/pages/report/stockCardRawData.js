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
    const today = moment()

    return (
        <ReportBase
            {...pageProps}
            inputRef={inputRef}
            pageTitle={msg.stockCardRawData}
            headerTabel={headerTabel}
            fetchAPIPath={apiPath.reportRep08StockCardRawData}
            exportAPIPath={apiPath.exportRep08StockCardRawData}
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
            </div>
        </ReportBase >
    )
}

const headerTabel = [
    {
        title: msg.reportVisitPlan,
        data: "planTripName",
        type: "string",
    },
    {
        title: msg.reportVisitPlanId,
        data: "planTripId",
        type: "code",
    },
    {
        title: msg.reportSalesTerritoryID,
        data: "territoryId",
        type: "code",
    },
    {
        title: msg.reportSaleTeritoryName,
        data: "territoryNameTh",
        type: "string",
    },
    {
        title: msg.reportCheckInDateTime,
        data: "visitCheckinDtm",
        type: "code",
    },
    {
        title: msg.reportCheckOutDateTime,
        data: "visitCheckoutDtm",
        type: "code",
    },
    {
        title: msg.reportEmployeeResponsible,
        data: "empName",
        type: "string",
    },
    {
        title: msg.reportEmployeeID,
        data: "empId",
        type: "code",
    },
    {
        title: msg.reportCustomer,
        data: "custNameTh",
        type: "string",
    },
    {
        title: msg.reportCustomerID,
        data: "custCode",
        type: "code",
    },
    {
        title: msg.tableProductCategory,
        data: "prodCateDesc",
        type: "string",
    },
    {
        title: msg.reportProductCategoryCode,
        data: "prodCateCode",
        type: "string",
    },
    {
        title: msg.reportProductName,
        data: "prodNameTh",
        type: "string",
    },
    {
        title: msg.reportProductID,
        data: "prodCode",
        type: "code",
    },
    {
        title: msg.reportQuantity,
        data: "recQty",
        type: "number",
    },
    {
        title: msg.reportUOM,
        data: "altUnit",
        type: "string",
    }
]