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
    const [saleGroup, setSaleGroup] = useState();

    const [dateFromValue, setDateFromValue] = useState();
    const [dateToValue, setDateToValue] = useState();
    const today = moment()

    useEffect(() => {
        getSaleGroup();
    }, [])

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
    const filterDataForSelectSaleGroup = () => {
        if (!(saleGroup && saleGroup.records)) return [];
        return formatObjForSelect(saleGroup.records, "groupCode", "descriptionTh");
    }

    return (
        <ReportBase
            {...pageProps}
            inputRef={inputRef}
            pageTitle={msg.prospectPerformancePerGroup}
            headerTabel={headerTabel}
            fetchAPIPath={apiPath.reportRep12ProspectPerformancePerSaleGroup}
            exportAPIPath={apiPath.exportRep12ProspectPerformancePerSaleGroup}
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
                        label={msg.reportSaleGroupName}
                        options={filterDataForSelectSaleGroup()}
                        ref={el => inputRef.current.groupCode = el}
                    />
                </div>
            </div>
        </ReportBase >
    )
}

const headerTabel = [
    {
        title: msg.reportSaleGroupID,
        data: "saleGroupCode",
        type: "code",
    },
    {
        title: msg.reportSaleGroupName,
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