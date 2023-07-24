import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons'
import { toString, formatFullDate } from '@helper'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment';
import Calendar from "pages/visitPlan/components/Calendar";
import * as apiPath from '@apiPath'
import * as msg from '@msg'
function Home({ callAPI, redirect, customAlert }) {
  const [dates, setDates] = useState(moment().toDate());
  const [planEvent, setPlanEvents] = useState([])
  const [planStatus, setPlanStatus] = useState([])
  const [notiList, setNotiList] = useState([])
  const dispatch = useDispatch();

  useEffect(() => {
    getVisitPlanStatus();
    searchPlanTrip();
    searchEmailJobForPlanTrip();
  }, [])

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
  }

  const handleSelectDate = (selectDate) => {
    dispatch(redirect("/visitPlan/main", { initDate: selectDate }))
    // setDates(selectDate)
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

  const searchEmailJobForPlanTrip = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 1,
      model: {
      }
    }
    const jsonResponse = await callAPI(apiPath.searchEmailJobForPlanTrip, jsonRequest);
    const data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : []
    setNotiList(data)
  }
  const NotiItem = (data) => {
    if (data.emailTemplateId == "2") {
      return (
        <div className="alert-text-box">
          {data.emailTemplateName}: {data.saleSupName}, {data.planTripName}[{data.planTripId}], {formatFullDate(data.planTripDate)}
        </div>
      )
    }
    else if (data.emailTemplateId == "5" || data.emailTemplateId == "1") {
      return (
        <div className="alert-text-box">
          {data.emailTemplateName}: {data.saleRepName}, {data.planTripName}[{data.planTripId}], {formatFullDate(data.planTripDate)}
        </div>
      )
    } else {
      return (
        <div className="alert-text-box">
          {data.emailTemplateName}: {data.planTripName}[{data.planTripId}], {formatFullDate(data.planTripDate)}
        </div>
      )
    }
  }

  return (
    <div className="bg-light-green">
      <div className="container pt-2 pb-4">
        <div className="heade-title">
          <div className="row align-items-center">
            <p>{msg.preTitle}</p>
          </div>
        </div>
        <div className="notification-container noti-lg">
          <div className="noti-header">
            <FontAwesomeIcon icon={faBell} style={{ fontSize: 30 }} />
            <span style={{ fontSize: 40, marginLeft: 10 }}>
              {msg.notifications}
            </span>
          </div>
          {notiList.map(data => (
            NotiItem(data)
          ))}
        </div>
        <div className="py-5 mt-4">
          <div className="calendor-box1 col-12 col-md-4 d-flex align-items-center justify-content-center my-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="calendarIcon" color="#777" size="xs" />
            <span className="ml-2 d-flex align-items-center">{dates ? moment(dates).format('วันddddที่ D MMMM') + " " + toString(moment(dates).year() + 543) : "-"}</span>
          </div>
          <Calendar dates={dates} events={processEvent()} onSelect={handleSelectDate}></Calendar>
        </div>
      </div>
    </div>
  )
}


export default Home