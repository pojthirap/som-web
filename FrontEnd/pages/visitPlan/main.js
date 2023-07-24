import { useState, useRef, useEffect } from 'react';
import { toString, getInputData, formatObjForSelect, formatFullDateWithDateStr, clearInputData } from '@helper'
import { useDispatch, useSelector } from 'react-redux'
import Calendar from "pages/visitPlan/components/Calendar";
import Button from '@components/Button';
import Select from '@components/Select';
import moment from 'moment';
import * as apiPath from '@apiPath'
import * as msg from '@msg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons'
function Main({ callAPI, redirect, customAlert, getPathValue }) {
    const dispatch = useDispatch();
    const [planData, setPlanData] = useState([])
    const [planEvent, setPlanEvents] = useState([])
    const [dates, setDates] = useState(moment().toDate());
    const [planStatus, setPlanStatus] = useState([])
    const [planStatusSelectData, setPlanStatusSelectData] = useState([])
    const [empSelectData, setEmpSelectData] = useState([])
    const pathValue = getPathValue(useSelector((state) => state.pathValue));
    const criteriaRef = useRef({})
    const userProfile = useSelector((state) => state.userProfile);
    const isLeader = userProfile.admGroup_GroupCode == "SUPEPVISOR" || userProfile.admGroup_GroupCode == "MANAGER"
    const [isAfterToday, setIsAfterToday] = useState(false);
    useEffect(() => {
        searchPlanTrip();
        getVisitPlanStatus();
        getEmpForAssignPlanTrip();
        if (pathValue && pathValue.initDate) {
            setDates(pathValue.initDate)
        }
    }, [])
    const clearCriteria = () => {
        clearInputData(criteriaRef)
    }
    const searchPlanTrip = async () => {
        let jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 0,
            model: {
            }
        }

        const inputData = getInputData(criteriaRef, "NE")
        if (inputData.data.assignEmpId) {
            jsonRequest.model.assignEmpId = inputData.data.assignEmpId;
        }
        if (inputData.data.status) {
            jsonRequest.model.status = [inputData.data.status];

        }


        const jsonResponse = await callAPI(apiPath.searchPlanTrip, jsonRequest);
        const data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : [];
        let processDataTmp = {}
        let processEventTmp = []
        data.forEach((obj) => {
            let tmpCreateDate = moment(obj.planTripDate);
            const objKey = tmpCreateDate.format("YYYYMMDD");
            processEventTmp.push({
                id: obj.planTripId,
                title: obj.planTripName,
                start: moment(obj.planTripDate),
                end: moment(obj.planTripDate),
                status: obj.status
            })
            if (processDataTmp[objKey]) {
                processDataTmp[objKey].push(obj)
            }
            else {
                processDataTmp[objKey] = [obj]
            }
        })
        setPlanData(processDataTmp);
        setPlanEvents(processEventTmp);
    }

    const getVisitPlanStatus = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                lovKeyword: "PLAN_TRIP_STATUS",
                activeFlag: "Y"
            }
        }
        const jsonResponse = await callAPI(apiPath.getConfigLov, jsonRequest);
        const data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : []
        setPlanStatus(data);

        const filterData = data.filter(element => element.lovKeyvalue != "5");
        setPlanStatusSelectData(formatObjForSelect(filterData, "lovKeyvalue", "lovNameTh"))
    }
    const getEmpForAssignPlanTrip = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.getEmpForAssignPlanTrip, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : []
        //data = data.filter(element => element.empId != userProfile.empId);
        setEmpSelectData(formatObjForSelect(data, "empId", ["empId", ["titleName", "firstName", "lastName"]], " : "))
    }

    const processEvent = () => {
        let processEventTmp = []
        planEvent.forEach((obj) => {
            const statusData = planStatus.find(el => {
                return toString(el.lovKeyvalue, false, false) == toString(obj.status);
            })
            const statusColorPart = statusData && statusData.condition1 && statusData.condition1.split("|").length == 2 ? statusData.condition1.split("|") : ["#E5F7ED", "#00AB4E"];
            processEventTmp.push({
                ...obj,
                color: statusColorPart[1]
            })
        })
        return processEventTmp
    }

    function getStatusData(status) {
        const statusData = planStatus.find(obj => {
            return toString(obj.lovKeyvalue, false, false) == toString(status);
        })
        const statusName = statusData && statusData.lovNameTh ? statusData.lovNameTh : "-"
        const statusColorPart = statusData && statusData.condition1 && statusData.condition1.split("|").length == 2 ? statusData.condition1.split("|") : ["#E5F7ED", "#00AB4E"];

        return (
            <div className="cardItemHeaderStatus ml-2" style={{ backgroundColor: statusColorPart[0], color: statusColorPart[1] }}>
                {statusName}
            </div>
        )
    }

    const handleSelectDate = (selectDate) => {
        setDates(selectDate)
        if (selectDate) {
            let today = moment().format("YYYY-MM-DD");
            setIsAfterToday(moment(selectDate).isAfter(today))
        } else {
            setIsAfterToday(false)
        }
    }

    const planItem = (data) => {
        const canAccept = data.status == 7 && !isLeader && isAfterToday;
        let viewMode = "V";
        if (data.status == 2 && isLeader) viewMode = "A"
        if (data.status == 1 || data.status == 3 || data.status == 4) viewMode = "E"
        return (
            <div className="planItem mt-4">
                <div className="row">
                    <div className="col-12 col-md-8">
                        <div className="row">
                            <span className="h2 m-0">
                                {toString(data.planTripName)}
                            </span>
                            {getStatusData(data.status)}
                        </div>
                        <div className="font-normal">
                            {msg.dateVisit} : {formatFullDateWithDateStr(data.planTripDate)}
                        </div>
                        <div className="font-normal">
                            {msg.createDateTime} : {formatFullDateWithDateStr(data.createDtm)}
                        </div>

                    </div>
                    <div className="col-12 col-md-4 row justify-content-end">
                        <div className="row col-12 p-0 font-normal justify-content-end">
                            {msg.by} : {toString(data.firstName)} {toString(data.lastName)}
                        </div>
                        {canAccept ? <div><Button customLabel={msg.accept} onClick={() => acceptPlanTrip(data.planTripId)}></Button></div> : null}

                        <div className="ml-2"><Button customLabel={msg.view} onClick={() => viewPlan(data, viewMode)}></Button></div>

                    </div>
                </div>
            </div>
        )
    }

    const acceptPlanTrip = async (id) => {
        const jsonRequest = {
            mergPlanTripId: toString(id, false, false),
        }
        const jsonResponse = await callAPI(apiPath.mergPlanTrip, jsonRequest)
        if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
            customAlert(msg.saveSuccess)
            searchPlanTrip();
        }
    }


    function compare(a, b) {
        const aMoment = moment(a.updateDtm)
        const bMoment = moment(b.updateDtm)
        if (aMoment.isBefore(bMoment)) {
            return -1;
        }
        if (aMoment.isAfter(bMoment)) {
            return 1;
        }
        return 0;
    }
    const renderPlanList = () => {
        let tmpSelectDate = moment(dates);
        const objKey = tmpSelectDate.format("YYYYMMDD");
        let tmpPlanList = planData[objKey] ? planData[objKey] : [];
        if (tmpPlanList.length > 0) {

            let renderList = [];
            tmpPlanList.forEach((data) => {
                renderList.push(planItem(data))
            })
            return renderList
        } else {
            return <div className="text-center h1">
                {msg.tableNoData}
            </div>
        }
    }

    const createPlan = (type) => {
        dispatch(redirect("/visitPlan/createOrEdit", { type: type }))
    }

    const viewPlan = (data, viewMode) => {
        dispatch(redirect("/visitPlan/createOrEdit", { type: viewMode, planTripId: data.planTripId }))
    }

    return (
        <div>
            <div className="bg-light-green">
                <div className="container pt-2 pb-4">
                    <div className="heade-title">
                        <div className="row align-items-center">
                            <div className="col-12 col-md-6">
                                <p>{msg.preTitle}</p>
                                <h1>{msg.visitPlantHeader}</h1>
                            </div>
                            <div className="col-12 col-md-6 row justify-content-end">
                                <div><Button customLabel={msg.createForMe} bigButton onClick={() => createPlan("M")}></Button></div>
                                {isLeader ? <div className="ml-2"><Button customLabel={msg.createForOther} bigButton onClick={() => createPlan("O")}></Button></div> : null}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="calendor-box1 col-12 col-md-4 d-flex align-items-center justify-content-center my-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="calendarIcon" color="#777" size="xs" />
                            <span className="ml-2 d-flex align-items-center">{dates ? moment(dates).format('วันddddที่ D MMMM') + " " + toString(moment(dates).year() + 543) : "-"}</span>
                        </div>
                        <Calendar dates={dates} events={processEvent()} onSelect={handleSelectDate}></Calendar>
                    </div>
                </div>
            </div>
            <div className="container pb-5 pt-3">
                <div className="row">
                    <div className="col-12 col-lg-2 d-flex align-items-center" >
                        <div className="h1 font-huge">
                            {msg.plan}
                        </div>
                    </div>
                    <div className="row col-12 col-lg-6 px-0 justify-content-end">

                        {isLeader ?
                            <div className="col-12 col-lg-6">
                                <Select
                                    label={msg.salesRep}
                                    options={empSelectData}
                                    ref={el => criteriaRef.current.assignEmpId = el}
                                    shadowBorder
                                    hideClearBtn
                                />
                            </div>
                            :
                            null
                        }
                        <div className="col-12 col-lg-6">
                            <Select
                                label={msg.planStatus}
                                options={planStatusSelectData}
                                ref={el => criteriaRef.current.status = el}
                                shadowBorder
                                hideClearBtn
                            />
                        </div>
                    </div>
                    <div className="col-12 col-lg-2 d-flex align-items-end pt-4">
                        <Button type="search" bigButton onClick={searchPlanTrip} />
                    </div>
                    <div className="col-12 col-lg-2 d-flex align-items-end pt-4">
                        <Button type="clear" bigButton onClick={clearCriteria} />
                    </div>
                </div>
                <div className="font-weight-bold padding-row h1 pt-4">
                    {dates ? moment(dates).format('วันddddที่ D MMMM') + " " + toString(moment(dates).year() + 543) : "-"}
                </div>
                <div className="my-5">
                    {renderPlanList()}
                </div>
            </div>
        </div>
    )
}

export default Main;