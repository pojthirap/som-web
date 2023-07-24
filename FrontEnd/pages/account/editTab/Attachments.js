import { useState, useEffect, useRef } from 'react';
import { toString, getInputData, formatFullDate, formatBytes, formatObjForSelect } from '@helper'
import Button from '@components/Button'
import DatePicker from '@components/DatePicker';
import ImageFromApi from '@components/ImageFromApi';
import FileFromApi from '@components/FileFromApi';
import Select from '@components/Select'
import * as msg from '@msg'
import * as apiPath from '@apiPath'
import moment from 'moment';

function Main({ callAPI, redirect, customAlert, pathValue }) {
  const criteriaRef = useRef({})
  const [criteriaInput, setCriteriaData] = useState({});
  const [attachmentData, setAttachmentData] = useState([])
  const [attachCateData, setAttachCateData] = useState([])
  const [dateFromValue, setDateFromValue] = useState();
  const [dateToValue, setDateToValue] = useState();
  const [totalData, setTotalData] = useState(0);
  const [isPhoto, setIsPhoto] = useState(false);
  const today = moment()
  const optionsType = [
    { label: "รูปภาพ", value: "Y" },
    { label: "ไฟล์", value: "N" }
  ]

  useEffect(() => {
    searchAttachmentTab();
    searchAttachCate();
  }, [criteriaInput])

  const searchAttachmentTab = async () => {
    let modelCriteria = { ...criteriaInput.data };

    if (modelCriteria.attachCate) modelCriteria.attachCateId = [modelCriteria.attachCate];
    //if (!modelCriteria.toDate) modelCriteria.toDate = moment().format("YYYY-MM-DD").concat("T00:00:00")

    if (!modelCriteria.toDate) {
      modelCriteria.toDate = moment(modelCriteria.fromDate).add(365, 'days').format("YYYY-MM-DD").concat("T00:00:00")
    }
    else if (!modelCriteria.fromDate) {
      modelCriteria.fromDate = moment(modelCriteria.toDate).add(-365, 'days').format("YYYY-MM-DD").concat("T00:00:00")
    }
    modelCriteria.prospId = toString(pathValue.data.prospect.prospectId);
    // modelCriteria.prospId = "1"
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: modelCriteria
    }
    const jsonResponse = await callAPI(apiPath.searchAttachmentTab, jsonRequest)
    const data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : [];
    setAttachmentData(data)
    let totalDataTmp = 0
    data.forEach((obj) => {
      totalDataTmp += obj.recordAppFormFileLst ? obj.recordAppFormFileLst.length : 0;
    })
    setTotalData(totalDataTmp)
  }
  const searchAttachCate = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 2,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: {
        activeFlag: "Y"
      }
    }
    const jsonResponse = await callAPI(apiPath.searchAttachCate, jsonRequest);
    const data = jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 ? formatObjForSelect(jsonResponse.data.records, "attachCateId", "attachCateNameTh") : [];
    setAttachCateData(data)

  }

  const handleSearch = () => {
    let criteriaData = getInputData(criteriaRef, "NE");
    if (!criteriaData.isInvalid) {
      setCriteriaData(criteriaData)
    }
  }

  const surveyCard = (data) => {
    return (
      <div className="px-3 container">
        <div className="row">
          <div className="col-3 col-md-2 col-lg-1 row align-items-center justify-content-center">
            {data.photoFlag == "Y" ?
              <ImageFromApi src={data.fileUrl} />
              :
              <FileFromApi src={data.fileUrl} />
            }
          </div>
          <div className="col-9 col-md-10 col-lg-11 py-2">
            <div className="row mt-1">
              <div className="col-12 col-md-8">
                <span className="h2">{data.fileName}</span>
              </div>
              <div className="col-12 col-md-4 row justify-content-end">
                <span className="font-normal text-gray">{msg.by} {toString(data.empName)}</span>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-6 col-md-2 font-normal">
                <div className="text-gray">
                  {formatBytes(data.fileSize)}
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
      <div className="bg-gray py-2 my-3">
        <div className="container font-normal">
          {dayDesc}
        </div>
      </div>
    )
  }

  const renderQandA = (data) => {
    let renderList = []
    renderList.push(dateBar(formatFullDate(data.updateDateTime)))
    if (data.recordAppFormFileLst && data.recordAppFormFileLst.length > 0) {
      data.recordAppFormFileLst.forEach(element => {
        renderList.push(surveyCard(element))
      });
    }
    return renderList
  }

  const handleOnChangeType = (value) => {
    setIsPhoto(value == "Y")
  }

  return (
    <div className="py-5">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-3 p-0">
            <div className="row pb-2 justify-content-between">
              <span className="h1">{pathValue.data.prospectAccount.accName}</span>
            </div>
            <div>
              <span className="h2">
                {msg.labelAttachments} <span className="h2 text-green ml-1">({totalData})</span>
              </span>
            </div>
          </div>

          <div className="col-12 col-md-9 p-0 row justify-content-end align-items-end">
            <div className="col-12 col-md-3">
              <DatePicker label={msg.from} showTodayButton ref={el => criteriaRef.current.fromDate = el} onChange={setDateFromValue} today={today} focusDate={dateToValue} />
            </div>
            <div className="col-12 col-md-3">
              <DatePicker label={msg.to} showTodayButton ref={el => criteriaRef.current.toDate = el} onChange={setDateToValue} today={today} focusDate={dateFromValue} currentFocus={dateFromValue} minDate={dateFromValue} maxDate={dateFromValue ? moment(dateFromValue).add(365, 'days').format("YYYY-MM-DD").concat("T00:00:00") : null} />
            </div>
            <div className="col-12 col-md-3">
              <Select label={msg.type} options={optionsType} onChange={handleOnChangeType} ref={el => criteriaRef.current.photoFlag = el} />
            </div>
            {isPhoto ?
              <div className="col-12 col-md-3" >
                <Select label={msg.photoType} options={attachCateData} ref={el => criteriaRef.current.attachCate = el} />
              </div>
              :
              null
            }
          </div>

          <div className="col-12 p-0 pt-4 row justify-content-end align-items-end">
            <div className="col-12 col-md-3 col-xl-2">
              <Button type="search" onClick={handleSearch} />
            </div>
          </div>
        </div>
      </div>
      <div className="pt-4">
        {attachmentData && attachmentData.length > 0 ?
          attachmentData.map((data) => {
            return renderQandA(data);
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
  )
}


export default Main