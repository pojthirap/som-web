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
    const [saleGroup, setSaleGroup] = useState();
    const [bu, setBu] = useState();

    const [dateFromValue, setDateFromValue] = useState();
    const [dateToValue, setDateToValue] = useState();
    const today = moment()

    useEffect(() => {
        getSaleRepName();
        getSaleGroup();
        getBu();
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

    const getSaleGroup = async () => {
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
            setSaleGroup(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
        }
    }

    const getBu = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await pageProps.callAPI(apiPath.searchBusinessUnit, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setBu(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
        }
    }

    const filterDataForSelectSaleRepName = () => {
        if (!(saleRepName && saleRepName.records)) return [];
        return formatObjForSelect(saleRepName.records, "empId", ["empId", ["titleName", "firstName", "lastName"]], " : ");
    }
    const filterDataForSelectSaleGroup = () => {
        if (!(saleGroup && saleGroup.records)) return [];
        return formatObjForSelect(saleGroup.records, "groupCode", "descriptionTh");
    }
    const filterDataForSelectBusinessUnit = () => {
        if (!(bu && bu.records)) return [];
        return formatObjForSelect(bu.records, "buId", "buNameTh");
    }

    return (
        <ReportBase
            {...pageProps}
            inputRef={inputRef}
            pageTitle={msg.prospectPerformancePerSaleRep}
            headerTabel={headerTabel}
            fetchAPIPath={apiPath.reportRep11ProspectPerformancePerSaleRep}
            exportAPIPath={apiPath.exportRep11ProspectPerformancePerSaleRep}
            tablewidth="1500px"
            hidePerPage
            length={0}
            reportProspectPerformancePerSaleRepAndSaleGroup
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
                        label={msg.reportSaleGroupName}
                        options={filterDataForSelectSaleGroup()}
                        ref={el => inputRef.current.groupCode = el}
                    />
                </div>
                <div className="col-4">
                    <Select
                        label={msg.reportBusinessUnit}
                        options={filterDataForSelectBusinessUnit()}
                        ref={el => inputRef.current.buId = el}
                    />
                </div>
            </div>
        </ReportBase >
    )
}

const headerTabel = [
    {
        title: msg.reportSaleRepId,
        data: "saleRepId",
        type: "code",
    },
    {
        title: msg.reportSaleRepName,
        data: "saleRepName",
        type: "string",
    },
    {
        title: msg.reportSaleOrderSaleGroup,
        data: "saleGroupDesc",
        type: "string",
    },
    {
        title: msg.reportProspectNo,
        data: "totalProspect",
        type: "number",
    },
    {
        title: msg.reportCustFromProspect,
        data: "totalProspectChange",
        type: "number",
    },
    {
        title: msg.reportPercentRatio,
        data: "performPercent",
        type: "number",
    }
]