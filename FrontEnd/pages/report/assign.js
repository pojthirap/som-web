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
    const [saleRepName, setSaleRepName] = useState();
    const [templateSA, setTemplateSA] = useState();

    const today = moment()
    useEffect(() => {
        getSaleRepName();
        getTemplateSa();
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

    const getTemplateSa = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await pageProps.callAPI(apiPath.searchTemplateSa, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setTemplateSA(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
        }
    }

    const filterDataForSelectSaleRepName = () => {
        if (!(saleRepName && saleRepName.records)) return [];
        return formatObjForSelect(saleRepName.records, "empId", ["empId", ["titleName", "firstName", "lastName"]], " : ");
    }

    const filterDataForSelectTemplateSa = () => {
        if (!(templateSA && templateSA.records)) return [];
        return formatObjForSelect(templateSA.records, "tpSaFormId", "tpNameTh");
    }

    return (
        <ReportBase
            {...pageProps}
            inputRef={inputRef}
            pageTitle={msg.assignReport}
            fetchAPIPath={apiPath.reportRep16Assign}
            exportAPIPath={apiPath.exportRep16Assign}
            tablewidth="3000px"
            dynamicReport
        >
            <div className="row">
                <div className="col-3">
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
                <div className="col-3">
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
                <div className="col-3">
                    <Select
                        require
                        label={msg.reportAssignProjectName}
                        options={filterDataForSelectTemplateSa()}
                        ref={el => inputRef.current.tpSaFormId = el}
                    />
                </div>
                <div className="col-3">
                    <Select
                        label={msg.reportAssignEmpName}
                        options={filterDataForSelectSaleRepName()}
                        ref={el => inputRef.current.saleRepId = el}
                    />
                </div>
            </div>
        </ReportBase >
    )
}