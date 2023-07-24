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

    const [saleOrg, setSaleOrg] = useState();
    const [division, setDivision] = useState();
    const [channel, setChannel] = useState();

    const [dateFromValue, setDateFromValue] = useState();
    const [dateToValue, setDateToValue] = useState();
    const today = moment()

    useEffect(() => {
        getSaleOrg();
        getDivision();
        getChannel();
    }, [])

    const getSaleOrg = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 2,
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
            searchOrder: 2,
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
            searchOrder: 2,
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
            pageTitle={msg.saleOrderRawData}
            headerTabel={headerTabel}
            fetchAPIPath={apiPath.reportRep13SaleOrderRawData}
            exportAPIPath={apiPath.exportRep13SaleOrderRawData}
            tablewidth="1500px"
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
                        label={msg.reportSaleOrderSaleOrg}
                        options={filterDataForSelectSaleOrg()}
                        ref={el => inputRef.current.saleOrg = el}
                    />
                </div>
            </div>
            <div className="row mt-3">
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
        title: msg.reportSaleOrderNoSAP,
        data: "sapOrderNo",
        type: "code",
    },
    {
        title: msg.reportSaleOrderNoSOM,
        data: "somOrderNo",
        type: "code",
    },
    {
        title: msg.reportSaleOrderStatus,
        data: "orderStatus",
        type: "string",
    },
    {
        title: msg.reportSaleOrderSaleOrg,
        data: "orgNameTh",
        type: "string",
    },
    {
        title: msg.reportSaleOrderDivision,
        data: "divisionNameTh",
        type: "string",
    },
    {
        title: msg.reportSaleOrderChannel,
        data: "channelNameTh",
        type: "string",
    },
    {
        title: msg.reportSaleOrderSaleGroup,
        data: "descriptionTh",
        type: "string",
    },
    {
        title: msg.reportSaleOrderNetValue,
        data: "netValue",
        type: "number",
    },
    {
        title: msg.reportSaleOrderCreateDate,
        data: "createDate",
        type: "code",
    },
    {
        title: msg.reportSaleOrderCreateBy,
        data: "empName",
        type: "string",
    }
]