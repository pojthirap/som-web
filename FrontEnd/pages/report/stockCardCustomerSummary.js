import { useState, useRef, useEffect } from 'react';
import { getInputData, formatObjForSelect, toString } from '@helper';
import Select from '@components/Select';
import DatePicker from '@components/DatePicker';
import ReportBase from "pages/report/components/ReportBase";
import moment from 'moment';
import * as apiPath from '@apiPath'
import * as msg from '@msg'
import CheckBox from '@components/Checkbox'
export default function Main(pageProps) {
    const inputRef = useRef({});
    const [saleRepName, setSaleRepName] = useState();
    const [customer, setCustomer] = useState();
    const [territory, setTerritory] = useState();

    const [dateFromValue, setDateFromValue] = useState();
    const [dateToValue, setDateToValue] = useState();
    const today = moment()

    useEffect(() => {
        getSaleRepName();
        getCustomer();
        getTerritory();
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

    const getCustomer = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
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

    const getTerritory = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await pageProps.callAPI(apiPath.searchSaleGroup, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setTerritory(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
        }
    }

    const filterDataForSelectCustomer = () => {
        if (!(customer && customer.records)) return [];
        return formatObjForSelect(customer.records, "custCode", ["custCode", "custNameTh"], " : ");
    }

    const filterDataForSelectSaleRepName = () => {
        if (!(saleRepName && saleRepName.records)) return [];
        return formatObjForSelect(saleRepName.records, "empId", ["empId", ["titleName", "firstName", "lastName"]], " : ");
    }

    const filterDataForSelectSaleTerritory = () => {
        if (!(territory && territory.records)) return [];
        return formatObjForSelect(territory.records, "groupCode", "descriptionTh");
    }

    return (
        <ReportBase
            {...pageProps}
            inputRef={inputRef}
            pageTitle={msg.visitPlanTransaction}
            fetchAPIPath={apiPath.reportRep09StockCardCustomerSummary}
            exportAPIPath={apiPath.exportRep09StockCardCustomerSummary}
            //tablewidth="5000px"
            reportStockCardCustomerSummary
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
                        maxDate={dateFromValue ? moment(dateFromValue).add(365, 'days').format("YYYY-MM-DD").concat("T00:00:00") : null}
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
            <div className="row mt-3">
                <div className="col-4">
                    <Select
                        label={msg.customer}
                        options={filterDataForSelectCustomer()}
                        ref={el => inputRef.current.custCode = el}
                    />
                </div>
                <div className="col-4">
                    <Select
                        label={msg.saleGroup}
                        options={filterDataForSelectSaleTerritory()}
                        ref={el => inputRef.current.groupCode = el}
                    />
                </div>
                <div style={{ marginTop: "2.3rem" }} className="col-4">
                    <CheckBox
                        label="Unit Report"
                        ref={el => inputRef.current.reportUnitFalg = el}
                    />
                </div>
            </div>
        </ReportBase >
    )
}