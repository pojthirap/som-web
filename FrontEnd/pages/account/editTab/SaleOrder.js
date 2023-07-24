import { useState, useEffect, useRef } from 'react';
import { toString, getInputData, formatFullDate, formatDate } from '@helper'
import Button from '@components/Button'
import DatePicker from '@components/DatePicker';
import Image from 'next/image'
import moment from 'moment';
import * as msg from '@msg'
import * as apiPath from '@apiPath'

function Main({ callAPI, redirect, customAlert, pathValue }) {
  const criteriaRef = useRef({})
  const [criteriaInput, setCriteriaData] = useState({});
  const [surveyData, setSurveyData] = useState([])
  const [dateFromValue, setDateFromValue] = useState();
  const [dateToValue, setDateToValue] = useState();
  const today = moment()
  useEffect(() => {
    searchSurveyResultTab();
  }, [criteriaInput])

  const searchSurveyResultTab = async () => {
    let modelCriteria = { ...criteriaInput.data };
    //modelCriteria.prospId = "1"
    modelCriteria.custCode = toString(pathValue.data.prospectAccount.custCode);
    if (!modelCriteria.toDate) {
      modelCriteria.toDate = moment(modelCriteria.fromDate).add(365, 'days').format("YYYY-MM-DD").concat("T00:00:00")
    }
    else if (!modelCriteria.fromDate) {
      modelCriteria.fromDate = moment(modelCriteria.toDate).add(-365, 'days').format("YYYY-MM-DD").concat("T00:00:00")
    }
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: modelCriteria
    }
    const jsonResponse = await callAPI(apiPath.searchSaleOrderTab, jsonRequest)
    const data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : [];
    setSurveyData(data)
  }

  const handleSearch = () => {
    let criteriaData = getInputData(criteriaRef, "NE");
    if (!criteriaData.isInvalid) {
      setCriteriaData(criteriaData)
    }
  }

  const surveyCard = (data) => {
    const statusColorPart = data && data.condition1 && data.condition1.split("|").length == 2 ? data.condition1.split("|") : ["#E5F7ED", "#00AB4E"];
    return (
      <div className="px-3 container mb-3">
        <div className="mb-4 row">
          <div className="col-3 col-md-2 col-lg-1">
            <Image src="/img/iconProspect/ShoppingCart.png" width="77" height="77" />
          </div>
          <div className="col-9 col-md-10 col-lg-11">
            <div className="row">
              <div className="col-12 col-md-8">
                <span className="h2">{data.somOrderNo}</span>
              </div>
              <div className="col-12 col-md-4 row justify-content-end">
                <span className="font-normal text-gray">{msg.by} {toString(data.saleName, true)}</span>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-6 col-md-2 font-normal mb-3">
                <div className="text-gray">{msg.salesOrder}</div><div>{toString(data.sapOrderNo, true)}</div>
              </div>
              <div className="col-6 col-md-2 font-normal mb-3">
                <div className="text-gray">{msg.description}</div><div>{toString(data.description, true)}</div>
              </div>
              <div className="col-6 col-md-2 font-normal mb-3">
                <div className="text-gray">{msg.creationDate}</div><div>{data.somOrderDte ? formatFullDate(data.somOrderDte) : "-"}</div>
              </div>
              <div className="col-6 col-md-2 font-normal mb-3">
                <div className="text-gray">{msg.pricingDate}</div><div>{data.pricingDtm ? formatFullDate(data.pricingDtm) : "-"}</div>
              </div>
              <div className="col-6 col-md-2 font-normal mb-3">
                <div className="text-gray">{msg.message}</div><div>{toString(data.sapMsg, true)}</div>
              </div>
              <div className="col-6 col-md-2 font-normal mb-3">
                <div className="cardItemHeaderStatus" style={{ backgroundColor: statusColorPart[0], color: statusColorPart[1] }}>
                  {data.orderStatus}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }


  const dateBar = (dayDesc) => {
    return (
      <div className="bg-gray py-2 mb-3">
        <div className="container font-normal">
          {dayDesc}
        </div>
      </div>
    )
  }

  const renderQandA = (dataList) => {
    let renderList = []
    let processDataTmp = {}
    dataList.forEach((obj) => {
      let tmpCreateDate = moment(obj.somOrderDte);
      const objKey = tmpCreateDate.format("YYYYMMDD");
      if (processDataTmp[objKey]) {
        processDataTmp[objKey].QAList.push(obj)
      }
      else {
        processDataTmp[objKey] = { dateDesc: formatFullDate(obj.somOrderDte), QAList: [obj] }
      }
    })

    Object.keys(processDataTmp).forEach((key) => {
      renderList.push(dateBar(processDataTmp[key].dateDesc));
      processDataTmp[key].QAList.forEach((obj) => {
        renderList.push(surveyCard(obj));
      })
    })
    if (renderList.length == 0) {
      return (
        <div className="d-flex justify-content-center mt-5">
          <span className="h1">
            {msg.tableNoData}
          </span>
        </div>
      )
    }
    return renderList
  }

  return (
    <div className="py-5">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-4 p-0">
            <div className="row pb-2 justify-content-between">
              <span className="h1">{pathValue.data.prospectAccount.accName}</span>
            </div>
            <div>
              <span className="h2">
                {msg.allOrders} {surveyData ? <span className="h2 text-green ml-1">({surveyData.length})</span> : null}
              </span>
            </div>
          </div>

          <div className="col-12 col-md-8 p-0 row justify-content-end align-items-end">
            <div className="col-12 col-md-4">
              <DatePicker label={msg.from} showTodayButton ref={el => criteriaRef.current.fromDate = el} onChange={setDateFromValue} today={today} focusDate={dateToValue} />
            </div>
            <div className="col-12 col-md-4">
              <DatePicker label={msg.to} showTodayButton ref={el => criteriaRef.current.toDate = el} onChange={setDateToValue} today={today} focusDate={dateFromValue} currentFocus={dateFromValue} minDate={dateFromValue} maxDate={dateFromValue ? moment(dateFromValue).add(365, 'days').format("YYYY-MM-DD").concat("T00:00:00") : null} />
            </div>
            <div className="col-12 col-md-4 col-lg-3">
              <Button type="search" onClick={handleSearch} />
            </div>
          </div>
        </div>
      </div>
      <div className="pt-4">
        {renderQandA(surveyData)}
      </div>
    </div>
  )
}


export default Main