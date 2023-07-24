import { useState, useEffect, useRef } from 'react';
import { toString, getInputData } from '@helper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import Button from '@components/Button'
import Modal from '@components/Modal'
import CheckBox from '@components/Checkbox'
import TimePicker from '@components/TimePicker'
import Image from 'next/image'
import * as msg from '@msg'
import * as apiPath from '@apiPath'

function Main({ callAPI, redirect, customAlert, pathValue }) {
  const [showModal, setShowModal] = useState(false)
  const [dayList, setDayList] = useState([])
  const [processData, setProcessData] = useState([])
  const [dataBeforeProcess, setDataBeforeProcess] = useState([])
  const dayRef = useRef([]);
  const timeRef = useRef({})
  const isOtherProspectPage = pathValue.type == "3" || pathValue.isRecomentBu;

  useEffect(() => {
    searchSalesTerritoryTab()
    getLOVDay()
  }, [])


  const searchSalesTerritoryTab = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: {
        prospectId: toString(pathValue.data.prospect.prospectId),
      }
    }
    const jsonResponse = await callAPI(apiPath.searchVisitHour, jsonRequest)
    const data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : [];
    setDataBeforeProcess(data)
    let processDataTmp = {}
    data.forEach((obj) => {
      if (processDataTmp[obj.daysCode]) {
        processDataTmp[obj.daysCode].timeList.push(obj)
      }
      else {
        processDataTmp[obj.daysCode] = { dayDesc: obj.lovNameTh, timeList: [obj] }
      }
    })
    let processArray = []
    Object.keys(processDataTmp).forEach((key) => {
      processDataTmp[key].timeList.sort(compare);
      processArray.push(processDataTmp[key])
    })
    setProcessData(processArray);
  }

  function compare(a, b) {
    if (a.hourStart < b.hourStart) {
      return -1;
    }
    if (a.hourStart > b.hourStart) {
      return 1;
    }
    return 0;
  }

  const getLOVDay = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 1,
      model: {
        lovKeyword: "DAYS_CODE"
      }
    }
    const jsonResponse = await callAPI(apiPath.getConfigLov, jsonRequest)
    const data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : [];
    setDayList(data)
  }

  const handleAdd = () => {
    setShowModal(true)
  }

  const handleDelete = (id) => {
    customAlert(msg.confirmDelete, "Q", async () => {
      const jsonRequest = {};
      jsonRequest.prospectId = toString(pathValue.data.prospect.prospectId)
      jsonRequest.prospVisitHrId = toString(id);
      const jsonResponse = await callAPI(apiPath.delVisitHour, jsonRequest)
      if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
        customAlert(msg.deleteSuccess)
        searchSalesTerritoryTab();
      }
    });
  }

  const handleSave = async () => {
    const timeInput = getInputData(timeRef)
    const dayInput = getInputData(dayRef)
    if (!timeInput.isInvalid && !dayInput.isInvalid) {
      const newHourStart = parseInt(timeInput.data.hourStart.replace(":", ""))
      const newHourEnd = parseInt(timeInput.data.hourEnd.replace(":", ""))
      let tmpDayCode = []
      let dupDayCodeList = {}
      if (newHourEnd <= newHourStart) return customAlert(msg.timeRangWrong, "W")
      dayInput.data.forEach((data, index) => {
        if (data) {
          const dayCode = dayList[index].lovKeyvalue;
          tmpDayCode.push(toString(dayCode))

          dataBeforeProcess.forEach((currData) => {
            if (dayCode == currData.daysCode) {
              const currHourStart = parseInt(currData.hourStart.replace(":", ""))
              const currHourEnd = parseInt(currData.hourEnd.replace(":", ""))
              if (
                (currHourStart <= newHourStart && newHourStart <= currHourEnd) ||
                (currHourStart <= newHourEnd && newHourEnd <= currHourEnd) ||
                (newHourStart <= currHourStart && currHourEnd <= newHourEnd)
              ) {
                if (dupDayCodeList[dayCode]) {
                  dupDayCodeList[dayCode].timeList.push(currData)
                }
                else {
                  dupDayCodeList[dayCode] = { dayDesc: currData.lovNameTh, timeList: [currData] }
                }
              }
            }
          })

        }
      });

      let dupListArr = []
      Object.keys(dupDayCodeList).forEach((key) => {
        dupDayCodeList[key].timeList.sort(compare);
        dupListArr.push(dupDayCodeList[key])
      })

      if (tmpDayCode.length == 0) return customAlert(msg.atLestOneDay, "W")
      if (dupListArr.length == 0) {
        let jsonRequest = timeInput.data
        jsonRequest.prospectId = toString(pathValue.data.prospect.prospectId)
        jsonRequest.daysCode = tmpDayCode

        const jsonResponse = await callAPI(apiPath.addVisitHour, jsonRequest)
        if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
          setShowModal(false)
          customAlert(msg.addSuccess)
          searchSalesTerritoryTab();
        }
      } else {

        customAlert((
          <div>
            <div><span>{msg.visitHourDup}</span></div>
            {dupListArr.map((data) => {
              return (
                <div className="pl-2">
                  <div><span>{data.dayDesc}</span></div>
                  {data.timeList.map((timeData) => {
                    return (
                      <div className="pl-2">
                        <span>{timeData.hourStart} - {timeData.hourEnd}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ), "W")
      }
    }
  }

  function checkBoxDay(data, index) {
    return (
      <div className="py-2">
        <CheckBox
          key={index}
          label={data.lovNameTh}
          ref={el => dayRef.current[index] = el}
        />
      </div>
    )
  }

  return (
    <div className="py-5 container">
      <div className="row pb-2 justify-content-between">
        <span className="h1">{pathValue.data.prospectAccount.accName}</span>
        {!isOtherProspectPage ?
          <div><Button type="add" onClick={handleAdd} /></div>
          : null
        }
      </div>
      <div>
        <span className="h2">
          {msg.allOrders} <span className="h2 text-green ml-1">({dataBeforeProcess && dataBeforeProcess.length > 0 ? dataBeforeProcess.length : 0})</span>
        </span>
      </div>
      <div className="pt-4 px-3">
        {processData && processData.length > 0 ?
          processData.map((data) => {
            return (
              <div className="row mb-4">
                <div className="col-3 col-md-2 col-lg-1">
                  <Image src="/img/iconProspect/Clock.png" width="77" height="77" />
                </div>
                <div className="col-9 col-md-10 col-lg-11">
                  <div className="row">
                    <div className="col-12">
                      <span className="h2">{data.dayDesc}</span>
                    </div>
                    {data.timeList.map((dataTime) => {
                      return (
                        <div className="col-12 row align-items-center">
                          <div className="d-flex align-items-center">
                            <Image src="/img/icon/icon-time.png" width="24" height="24" />
                          </div>
                          <div className="px-1">
                            <span className="font-normal">{dataTime.hourStart} - {dataTime.hourEnd}</span>
                          </div>

                          {!isOtherProspectPage ?
                            <div className="cursor-pointer pl-1" onClick={() => handleDelete(dataTime.prospVisitHrId)} >
                              <FontAwesomeIcon icon={faTrash} className="trash-icon" size="1x" />
                            </div>
                            :
                            null
                          }
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })
          :
          <div className="d-flex justify-content-center mt-5">
            <span className="h1">
              {msg.tableNoData}
            </span>
          </div>
        }


      </div>

      <Modal
        isShow={showModal}
        onClose={() => setShowModal(false)}
        title={msg.add}
        hideFooter
      >
        <div className="row justify-content-between pb-3">
          <div>
            <span className="h1">{msg.day}</span>
          </div>
          <div>
            <Button type="add" onClick={handleSave} />
          </div>
        </div>
        {dayList.map((data, index) => {
          return checkBoxDay(data, index)
        })}
        <div className="row border-top-grey my-3 pt-4">

          <div className="col-2 d-flex align-items-center justify-content-center">
            <span className="font-normal">{msg.time}</span>
          </div>
          <div className="col-5">
            <TimePicker ref={el => timeRef.current.hourStart = el} require hideLabel label={msg.time} defaultValue="00:00" />
          </div>
          <div className="col-5">
            <TimePicker ref={el => timeRef.current.hourEnd = el} require hideLabel label={msg.time} defaultValue="00:00" />
          </div>
        </div>

      </Modal>
    </div>
  )
}


export default Main