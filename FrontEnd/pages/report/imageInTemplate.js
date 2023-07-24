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
    const [template, setTemplate] = useState();
    const [prospect, setProspect] = useState();
    const [saleRepName, setSaleRepName] = useState();

    const [dateFromValue, setDateFromValue] = useState();
    const [dateToValue, setDateToValue] = useState();
    const today = moment()

    useEffect(() => {
        getTemplate();
        getSaleRepName();
        getProspectName();
    }, [])

    const getTemplate = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await pageProps.callAPI(apiPath.searchTemplateAppForm, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setTemplate(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
        }
    }

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

    const getProspectName = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await pageProps.callAPI(apiPath.searchProspectAll, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setProspect(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
        }
    }

    const filterDataForSelectTemplate= () => {
        if (!(template && template.records)) return [];
        return formatObjForSelect(template.records, "tpAppFormId", "tpNameTh");
    }
    const filterDataForSelectSaleRepName = () => {
        if (!(saleRepName && saleRepName.records)) return [];
        return formatObjForSelect(saleRepName.records, "empId", ["empId", ["titleName", "firstName", "lastName"]], " : ");
    }
    const filterDataForSelectProspect = () => {
        if (!(prospect && prospect.records)) return [];
        return formatObjForSelect(prospect.records, "prospectId", [["custCode", "prospectId"], "accName"], ":", 0);
    }
    return (
        <ReportBase
            {...pageProps}
            inputRef={inputRef}
            pageTitle={msg.imageInTemplate}
            headerTabel={headerTabel}
            fetchAPIPath={apiPath.reportRep17ImageInTemplate}
            exportAPIPath={apiPath.exportRep17ImageInTemplate}
            tablewidth="2500px"
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
                    />
                </div>
                <div className="col-4">
                    <Select
                        label={msg.taskTemplateName}
                        options={filterDataForSelectTemplate()}
                        ref={el => inputRef.current.tpAppFormId = el}
                    />
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-4">
                    <Select
                        label={msg.reportSaleRepName}
                        options={filterDataForSelectSaleRepName()}
                        ref={el => inputRef.current.saleRepId = el}
                    />
                </div>
                <div className="col-4">
                    <Select
                        label={msg.reportNameCustomerAndProspect}
                        options={filterDataForSelectProspect()}
                        ref={el => inputRef.current.saleRepId = el}
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
        title: msg.reportVisitPlanId,
        data: "visitPlanId",
        type: "code",
    },
    {
        title: msg.reportVisitPlanName,
        data: "visitPlanName",
        type: "string",
    },
    {
        title: msg.reportVisitDate,
        data: "visitDate",
        type: "code",
    },
    {
        title: msg.taskTemplateName,
        data: "templateName",
        type: "string",
    },
    {
        title: msg.reportImage,
        data: "imageUrl",
        type: "image",
    }
]