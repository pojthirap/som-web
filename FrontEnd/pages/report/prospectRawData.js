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
    const [prospect, setProspect] = useState();
    const [prospectType, setProspectType] = useState();
    const [saleRepName, setSaleRepName] = useState();
    const [saleGroup, setSaleGroup] = useState();


    const [dateFromValue, setDateFromValue] = useState();
    const [dateToValue, setDateToValue] = useState();
    const today = moment()

    useEffect(() => {
        getProspectName();
        getProspectType();
        getSaleRepName();
        getSaleGroup();
    }, [])

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

    const getProspectType = async () => {
        const headerTabel = [{ title: "Customer", key: "2" }, { title: "Prospect", key: "0" }, { title: "ปั๊มเช่า", key: "1" }]
        setProspectType(headerTabel);
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

    const filterDataForSelectProspect = () => {
        if (!(prospect && prospect.records)) return [];
        return formatObjForSelect(prospect.records, "prospectId", ["prospectId", "accName"], " : ");
    }
    const filterDataForSelectProspectType = () => {
        if (!(prospectType)) return [];
        return formatObjForSelect(prospectType, "key", "title");
    }
    const filterDataForSelectSaleRepName = () => {
        if (!(saleRepName && saleRepName.records)) return [];
        return formatObjForSelect(saleRepName.records, "empId", ["empId", ["titleName", "firstName", "lastName"]], " : ");
    }
    const filterDataForSelectSaleGroup = () => {
        if (!(saleGroup && saleGroup.records)) return [];
        return formatObjForSelect(saleGroup.records, "groupCode", "descriptionTh");
    }
    return (
        <ReportBase
            {...pageProps}
            inputRef={inputRef}
            pageTitle={msg.prospectRawData}
            headerTabel={headerTabel}
            fetchAPIPath={apiPath.reportRep10ProspectRawData}
            exportAPIPath={apiPath.exportRep10ProspectRawData}
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
                        maxDate={dateFromValue ? moment(dateFromValue).add(365, 'days').format("YYYY-MM-DD").concat("T00:00:00") : null}
                    />
                </div>
                <div className="col-4">
                    <Select
                        label={msg.reportprospectName}
                        options={filterDataForSelectProspect()}
                        ref={el => inputRef.current.prospectId = el}
                    />
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-4">
                    <Select
                        label={msg.reportprospectStatus}
                        options={filterDataForSelectProspectType()}
                        ref={el => inputRef.current.prospectType = el}
                    />
                </div>
                <div className="col-4">
                    <Select
                        label={msg.reportSaleRepName}
                        options={filterDataForSelectSaleRepName()}
                        ref={el => inputRef.current.saleRepId = el}
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
        title: msg.reportProspectID,
        data: "prospectId",
        type: "code",
    },
    {
        title: msg.reportprospectName,
        data: "accName",
        type: "string",
    },
    {
        title: msg.status,
        data: "prospectType",
        type: "string",
    },
    {
        title: msg.latitude,
        data: "latitude",
        type: "code",
    },
    {
        title: msg.longitude,
        data: "longitude",
        type: "code",
    },
    {
        title: msg.reportSaleRepId,
        data: "saleRepId",
        type: "code",
    },
    {
        title: msg.reportSaleRepName,
        data: "empName",
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
        title: msg.reportCreateDate,
        data: "createDate",
        type: "code",
    },
    {
        title: msg.reportAddress,
        data: "address",
        type: "string",
    },
    {
        title: msg.reportSubdistrict,
        data: "subdistrictNameTh",
        type: "string",
    },
    {
        title: msg.reportDistrict,
        data: "districtNameTh",
        type: "string",
    },
    {
        title: msg.reportProvince,
        data: "provinceNameTh",
        type: "string",
    }
]