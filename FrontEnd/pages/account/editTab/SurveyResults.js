import { useState, useEffect, useRef } from 'react';
import { toString, getInputData, formatFullDate, formatDate } from '@helper'
import Button from '@components/Button'
import Modal from '@components/Modal'
import Checkbox from '@components/Checkbox'
import Radio from '@components/Radio'
import DatePicker from '@components/DatePicker';
import Image from 'next/image'
import ImageFromApi from '@components/ImageFromApi';
import FileFromApi from '@components/FileFromApi';
import moment from 'moment';
import * as msg from '@msg'
import * as apiPath from '@apiPath'

function Main({ callAPI, showImg, customAlert, pathValue }) {
  const criteriaRef = useRef({})
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
    // modelCriteria.prospId = "1"
    modelCriteria.prospId = toString(pathValue.data.prospect.prospectId);

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
    const jsonResponse = await callAPI(apiPath.searchSurveyResultTab, jsonRequest)
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
        rceAppFormId: toString(id),
      }
    }
    const jsonResponse = await callAPI(apiPath.viewSurveyResult, jsonRequest)
    const data = jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 ? jsonResponse.data.records[0] : {};
    setCurrentSurveyData(data)
  }

  const handleOnClickView = (data) => {
    viewSurveyResult(data.recAppFormId);
    setCurrentSurvey(data);
    setShowModal(true);
  }

  const handleSearch = () => {
    let criteriaData = getInputData(criteriaRef, "NE");
    if (!criteriaData.isInvalid) {
      setCriteriaData(criteriaData)
    }
  }

  const surveyCard = (data) => {
    return (
      <div key={data.recAppFormId} className="px-3 container mb-3">
        <div className="mb-4 row">
          <div className="col-3 col-md-2 col-lg-1">
            <Image src="/img/iconProspect/Search.png" width="77" height="77" />
          </div>
          <div className="col-9 col-md-10 col-lg-11">
            <div className="row">
              <div className="col-12 col-md-8">
                <span className="h2">{data.tpNameTh}</span>
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

  const answerItem = (ansData, ansType, index) => {
    if (ansType == "1") {
      return (
        <div className="col-7">
          <div className="textQuestionLabel">
            {ansData && ansData.length > 0 ? ansData[0].val : "-"}
          </div>
        </div>
      )
    }
    else if (ansType == "2" || ansType == "4") {
      let ansList = [];
      let ansValue = "";
      ansData.forEach((obj, index) => {
        ansList.push({ value: toString(index, false, false), label: obj.ans })
        if (obj.val == "Y") ansValue = toString(index, false, false);
      });
      return (
        <div className="row col-7">

          <Radio
            name={"ansCheck" + toString(index)}
            options={ansList}
            defaultValue={ansValue}
            notInline
            disabled
          />
        </div>
      )
    }
    else if (ansType == "3") {
      return (
        <div className="row col-7">
          {ansData ? ansData.map((ansData, index) => {
            return (
              <div className="col-12 mb-1 p-0">
                <Checkbox
                  readOnly label={ansData.ans}
                  defaultValue={ansData.val == "Y"}
                />
              </div>
            )
          }) : null}
        </div>
      )
    }
    else if (ansType == "5") {
      return (
        <div className="row col-7">
          {ansData ? ansData.sort(compare).map((ansData, index) => {
            return (
              <div className="col-12 mb-1 p-0 primaryLebel">
                {index + 1}. {ansData.ans}
              </div>
            )
          }) : null}
        </div>
      )
    }
    else if (ansType == "6") {
      if (currentSurveyData && currentSurveyData.listFile && currentSurveyData.listFile.length > 0) {
        return (
          <div className="row col-12 p-0">
            {ansData ? ansData.map((ansData, index) => {
              if (ansData.val) {
                const foundImgObj = currentSurveyData.listFile.find(obj => toString(obj.fileId, false, false) == toString(ansData.val, false, false));
                if (foundImgObj) {
                  return (
                    <div className="col-3 col-lg-2 mb-1 px-2 d-flex align-items-center">
                      <ImageFromApi src={foundImgObj.fileUrl} />
                    </div>
                  )
                }
              }
              else {
                return null;
              }
            }) : null}
          </div>
        )
      }
      else {
        return (
          <div className="primaryLebel col-7 ">
            -
          </div>
        )
      }
    }
    else if (ansType == "7") {
      if (currentSurveyData && currentSurveyData.listFile && currentSurveyData.listFile.length > 0) {
        return (
          <div className="row col-12 p-0">
            {ansData ? ansData.map((ansData, index) => {
              if (ansData.val) {
                const foundImgObj = currentSurveyData.listFile.find(obj => toString(obj.fileId, false, false) == toString(ansData.val, false, false));
                if (foundImgObj) {
                  return (
                    <div className="col-3 col-lg-2 mb-1 px-2">
                      <FileFromApi src={foundImgObj.fileUrl} fileName={foundImgObj.fileName} fileExt={foundImgObj.fileExt} />
                    </div>
                  )
                }
              }
              else {
                return null;
              }
            }) : null}
          </div>
        )
      }
      else {
        return (
          <div className="primaryLebel col-7 ">
            -
          </div>
        )
      }
    }
    else if (ansType == "8") {
      return (
        <div className="row col-7">
          <div className="textFieldLabel col-5">
            {ansData && ansData.length > 0 ? formatDate(ansData[0].val) : "-"}
          </div>
          <div className="col-2 h3 m-0 d-flex justify-content-center align-items-center">
            -
          </div>
          <div className="textFieldLabel col-5">
            {ansData && ansData.length > 1 ? formatDate(ansData[1].val) : "-"}
          </div>

        </div>
      )
    }
    else if (ansType == "9") {
      return (
        <div className="col-7">
          <div className="textFieldLabel">
            {ansData && ansData.length > 0 ? formatDate(ansData[0].val) : "-"}
          </div>
        </div>
      )
    }
    else {
      return (
        <div className="primaryLebel col-7 ">
          -
        </div>
      )
    }
  }

  function compare(a, b) {
    if (a.val < b.val) {
      return 1;
    }
    if (a.val > b.val) {
      return -1;
    }
    return 0;
  }
  const qAndACard = (data, index) => {
    return (
      <div className="mt-3">
        <div className="primaryLebel">
          {index + 1}. {data.questionNm}
        </div>
        {answerItem(data.ansVal, data.ansType, index)}
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
      let tmpCreateDate = moment(obj.createDtm);
      const objKey = tmpCreateDate.format("YYYYMMDD");
      if (processDataTmp[objKey]) {
        processDataTmp[objKey].QAList.push(obj)
      }
      else {
        processDataTmp[objKey] = { dateDesc: formatFullDate(obj.createDtm), QAList: [obj] }
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
              <DatePicker label={msg.to} showTodayButton ref={el => criteriaRef.current.toDate = el} onChange={setDateToValue} today={today} currentFocus={dateFromValue} focusDate={dateFromValue} minDate={dateFromValue} maxDate={dateFromValue ? moment(dateFromValue).add(365, 'days').format("YYYY-MM-DD").concat("T00:00:00") : null} />
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

      <Modal
        isShow={showModal}
        onClose={() => setShowModal(false)}
        title={msg.templateSurveyResultModalHeader}
        btnPrint
        size="lg"
      >
        <div className="my-2">
          <div className="row h2">{currentSurvey.tpNameTh}</div>
          {currentSurveyData.objForm && currentSurveyData.objForm.length > 0 ?
            currentSurveyData.objForm[0].appForm.map((qtData, index) => {
              return qAndACard(qtData, index);
            })
            :
            null
          }
        </div>
      </Modal>
    </div>
  )
}


export default Main