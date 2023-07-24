import { useState, useEffect, useRef } from 'react';
import { toString, getInputData, formatFullDate, formatDate } from '@helper'
import Button from '@components/Button'
import Modal from '@components/Modal'
import TextField from '@components/TextField';
import DatePicker from '@components/DatePicker';
import Image from 'next/image'
import ImageFromApi from '@components/ImageFromApi'
import * as msg from '@msg'
import * as apiPath from '@apiPath'
import moment from 'moment';

function Main({ callAPI, pathValue }) {
  const criteriaRef = useRef({})
  const [clickSearch, setClickSearch] = useState(false);
  const [criteriaInput, setCriteriaData] = useState({});
  const [showModal, setShowModal] = useState(false)
  const [surveyData, setSurveyData] = useState([])
  const [currentSurvey, setCurrentSurvey] = useState({})
  const [currentSurveyData, setCurrentSurveyData] = useState({})
  const [dateFromValue, setDateFromValue] = useState();
  const [dateToValue, setDateToValue] = useState();
  const today = moment()
  useEffect(() => {
    searchSurveyResultTab();
  }, [criteriaInput])

  const searchSurveyResultTab = async () => {
    let modelCriteria = { ...criteriaInput.data };
    // modelCriteria.prospectId = "1"
    modelCriteria.prospectId = toString(pathValue.data.prospect.prospectId);
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
    const jsonResponse = await callAPI(apiPath.searchTemplateSaResultTab, jsonRequest)
    const data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : [];
    setSurveyData(data)
  }

  const viewSurveyResult = async (id) => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: {
        recSaFormId: toString(id),
      }
    }
    const jsonResponse = await callAPI(apiPath.viewTemplateSaResult, jsonRequest)
    let data = jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 ? jsonResponse.data.records[0] : {};

    if (data && data.title && data.title.length > 0) {
      for (let i = 0; i < data.title.length; i++) {
        if (data.title[i].ansType == "L") {
          const lovResponse = await getMasterDataForTemplateSa(data.title[i].ansLovType);
          const foundLov = lovResponse.find(element => element.code == data.title[i].titleColmAns);
          data.title[i].ansLovTypeDesc = foundLov.description ? foundLov.description : "-";
        }
      }
    }
    setCurrentSurveyData(data)
  }

  const getMasterDataForTemplateSa = async (type) => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: {
        ansLovType: toString(type),
      }
    }
    const jsonResponse = await callAPI(apiPath.getMasterDataForTemplateSa, jsonRequest)
    const data = jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 ? jsonResponse.data.records : [];
    return data
  }

  const handleOnClickView = (data) => {
    viewSurveyResult(data.recSaFormId);
    setCurrentSurvey(data);
    setShowModal(true);
  }

  const handleSearch = () => {
    let criteriaData = getInputData(criteriaRef, "NE");
    if (!criteriaData.isInvalid) {
      setCriteriaData(criteriaData)
    }
    setClickSearch(true)
  }


  const surveyCard = (data, index) => {
    return (
      <div key={index} className="px-3 border-top-grey py-3">
        <div className="row">
          <div className="col-3 col-md-2 col-lg-1">
            <Image src="/img/iconProspect/Template.png" width="77" height="77" />
          </div>
          <div className="col-9 col-md-10 col-lg-11">
            <div className="row">
              <div className="col-12 col-md-8">
                <span className="h2">{index + 1}. {data.tpNameTh}</span>
              </div>
              <div className="col-12 col-md-4 text-right font-normal">
                {msg.by} {data.saleName}
              </div>
              <div className="col-12 col-md-9 col-xl-10 row align-items-center">
                <div className="d-flex align-items-center">
                  <Image src="/img/icon/icon-time.png" width="24" height="24" />
                </div>
                <div className="px-1">
                  <span className="font-normal">{formatFullDate(data.createDtm)}</span>
                </div>
              </div>
              <div className="col-6 col-md-3 col-xl-2">
                <Button type="primary" customLabel="View" onClick={() => handleOnClickView(data)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const answerItem = (data, index) => {
    if (data.ansType == "V") {
      if ("4" == toString(data.ansValType)) {
        const imgIdList = data.titleColmAns ? data.titleColmAns.split(",") : [];
        return (
          <div className="row col-12 p-0">
            {imgIdList && imgIdList.length > 0 ? imgIdList.map((imgId) => {
              if (imgId) {
                const foundImgObj = currentSurveyData.listFile.find(obj => toString(obj.fileId, false, false) == toString(imgId, false, false));
                return (
                  <div className="col-3 col-lg-2 mb-1 px-2 d-flex align-items-center">
                    <ImageFromApi src={foundImgObj.fileUrl} />
                  </div>
                )
              }
              else {
                return null;
              }
            }) : null}
          </div>
        )
      } else {
        if ("3" == toString(data.ansValType)) {
          return (
            <div className="col-7">
              <div className="textFieldLabel">
                {data.titleColmAns ? data.titleColmAns : "-"}
              </div>
            </div>
          )
        }
        return (
          <div className="col-7">
            <div className="textFieldLabel">
              {data.titleColmAns ? data.titleColmAns : "-"}
            </div>
          </div>
        )
      }
    }
    else if (data.ansType == "L") {
      return (
        <div className="col-7">
          <div className="textFieldLabel">
            {data.ansLovTypeDesc ? data.ansLovTypeDesc : "-"}
          </div>
        </div>
      )
    }
    else {
      return (
        <div className="font-normal ml-2">
          -
        </div>
      )
    }
  }

  const qAndACard = (data, index) => {
    return (
      <div className="mt-3" key={data.tpSaTitleId}>
        <div className="primaryLebel">
          {data.titleColmNo}. {data.titleNameTh}
        </div>
        {answerItem(data, index)}
      </div>
    )
  }

  return (
    <div className="py-5">
      <div className="container">
        <div className="row pb-2">
          <div className="col-12 col-md-4">
            <TextField
              label={msg.templateForSaTemplateName}
              ref={el => criteriaRef.current.tpNameTh = el}
            />
          </div>
          <div className="col-12 col-md-3">
            <DatePicker label={msg.from} showTodayButton ref={el => criteriaRef.current.fromDate = el} onChange={setDateFromValue} today={today} focusDate={dateToValue} />
          </div>
          <div className="col-12 col-md-3">
            <DatePicker label={msg.to} showTodayButton ref={el => criteriaRef.current.toDate = el} onChange={setDateToValue} today={today} focusDate={dateFromValue} currentFocus={dateFromValue} minDate={dateFromValue} maxDate={dateFromValue ? moment(dateFromValue).add(365, 'days').format("YYYY-MM-DD").concat("T00:00:00") : null} />
          </div>
          <div className="col-12 col-md-2 col-lg-2 padding-label d-flex">
            <Button type="search" onClick={handleSearch} />
          </div>
        </div>
        <div className="padding-row mt-3">
          <span className="h2">
            {msg.allOrders} {surveyData ? <span className="h2 text-green ml-1">({surveyData.length})</span> : null}
          </span>
        </div>
        <div className="pt-4">
          {surveyData.length > 0 ? surveyData.map((data, index) => {
            return surveyCard(data, index);
          })
            :
            <div className="d-flex justify-content-center mt-5">
              <span className="h1">
                {msg.tableNoData}
              </span>
            </div>
          }
        </div>
      </div>

      <Modal
        isShow={showModal}
        onClose={() => setShowModal(false)}
        title={msg.templateForSa}
        btnPrint
        size="lg"
      >
        <div className="my-2">
          <div className="row h2"><span>{currentSurvey.tpNameTh}</span></div>
          <div className="row font-normal">{msg.createBy} : <span className="ml-1">{currentSurvey.saleName}</span></div>
          <div className="row font-normal mb-3">{msg.lastUpdate} :<span className="text-green ml-1">{formatFullDate(currentSurvey.createDtm)}</span></div>
          {currentSurveyData.title ?
            currentSurveyData.title.map((qtData, index) => {
              return qAndACard(qtData, index);
            })
            :
            null
          }
        </div>
      </Modal>
    </div >
  )
}


export default Main