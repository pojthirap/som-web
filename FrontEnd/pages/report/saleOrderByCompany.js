import { useState, useRef, useEffect } from 'react';
import { getInputData, formatObjForSelect, toString } from '@helper';
import Select from '@components/Select';
import DatePicker from '@components/DatePicker';
import ReportBase from "pages/report/components/ReportBase";
import moment from 'moment';
import * as apiPath from '@apiPath'
import * as msg from '@msg'
import MultiSelect from '@components/MultiSelect';
export default function Main(pageProps) {
    const inputRef = useRef({});

    const [company, setCompany] = useState();
    const [saleOrg, setSaleOrg] = useState();
    const [division, setDivision] = useState();
    const [channel, setChannel] = useState();

    const [dateFromValue, setDateFromValue] = useState();
    const [dateToValue, setDateToValue] = useState();
    const today = moment()

    useEffect(() => {
        getCompany();
        getSaleOrg();
        getDivision();
        getChannel();
    }, [])

    const getCompany = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await pageProps.callAPI(apiPath.searchCompanyReport, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setCompany(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
        }
    }

    const getSaleOrg = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await pageProps.callAPI(apiPath.searchOrg, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setSaleOrg(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
        }
    }

    const getDivision = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await pageProps.callAPI(apiPath.searchDivision, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setDivision(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
        }
    }

    const getChannel = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await pageProps.callAPI(apiPath.searchChannel, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setChannel(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
        }
    }

    const filterDataForSelectCompany = () => {
        if (!(company && company.records)) return [];
        return formatObjForSelect(company.records, "companyCode", ["companyCode", "companyNameEn"], " : ");
    }
    const filterDataForSelectSaleOrg = () => {
        if (!(saleOrg && saleOrg.records)) return [];
        return formatObjForSelect(saleOrg.records, "orgCode", "orgNameTh");
    }
    const filterDataForSelectDivision = () => {
        if (!(division && division.records)) return [];
        return formatObjForSelect(division.records, "divisionCode", "divisionNameTh");
    }
    const filterDataForSelectChannel = () => {
        if (!(channel && channel.records)) return [];
        return formatObjForSelect(channel.records, "channelCode", "channelNameTh");
    }

    return (
        <ReportBase
            {...pageProps}
            inputRef={inputRef}
            pageTitle={msg.saleOrderByCompany}
            headerTabel={headerTabel}
            fetchAPIPath={apiPath.reportRep15SaleOrderByCompany}
            exportAPIPath={apiPath.exportRep15SaleOrderByCompany}
            tablewidth="1500px"
            reportSaleOrderByCompany
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
                        maxDate={dateFromValue ? moment(dateFromValue).add(62, 'days').format("YYYY-MM-DD").concat("T00:00:00") : null}
                        lengthDate={62}
                    />
                </div>
                <div className="col-4 setDropdownlist">
                    <MultiSelect
                        require
                        label={msg.reportSaleOrderCompany}
                        options={filterDataForSelectCompany()}
                        ref={el => inputRef.current.listCompany = el}
                    />
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-4">
                    <Select
                        label={msg.reportSaleOrderSaleOrg}
                        options={filterDataForSelectSaleOrg()}
                        ref={el => inputRef.current.saleOrg = el}
                    />
                </div>
                <div className="col-4">
                    <Select
                        label={msg.distributionChannel}
                        options={filterDataForSelectChannel()}
                        ref={el => inputRef.current.saleChannel = el}
                    />
                </div>
                <div className="col-4">
                    <Select
                        label={msg.reportSaleOrderDivision}
                        options={filterDataForSelectDivision()}
                        ref={el => inputRef.current.saleDivision = el}
                    />
                </div>
            </div>
        </ReportBase >
    )
}

const headerTabel = [
    {
        title: "Company",
        title2: "- Channel",
        textAlign: "left",
        data: "columnName",
        type: "string"
    },
    {
        title: msg.reportTotalSaleOrder,
        data: "total_Sale_Order",
        type: "number",
    },
    {
        title: msg.reportSAP,
        data: "sO_SAP",
        type: "number",
    },
    {
        title: msg.reportSOMBySale,
        data: "sO_SOM",
        type: "number",
    },
    {
        title: msg.reportPercentSAP,
        data: "sO_div_SAP",
        type: "number",
    },
    {
        title: msg.reportPercentSOM,
        data: "sO_div_SOM",
        type: "number",
    }
]