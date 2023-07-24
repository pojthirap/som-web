import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { toString, formatFullDate } from '@helper'
import Button from '@components/Button'
import Image from 'next/image'
import ImageFromApi from '@components/ImageFromApi'
import * as msg from '@msg'
import * as apiPath from '@apiPath'

function Main({ callAPI, redirect, customAlert, pathValue }) {
  const dispatch = useDispatch();
  const [recordMeterData, setRecordMeterData] = useState([]);
  useEffect(() => {
    searchRecordMeterTab()
  }, [])

  const goToQrMaster = () => {
    dispatch(redirect("/masterData/qrMaster", { custCode: pathValue.data.prospectAccount.custCode }));
  }

  const searchRecordMeterTab = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 1,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: {
        //prospId: "1",
        prospId: toString(pathValue.data.prospect.prospectId),
      }
    }
    const jsonResponse = await callAPI(apiPath.searchRecordMeterTab, jsonRequest)
    const data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : [];
    setRecordMeterData(data)
  }
  const meterItem = (data) => {
    return (
      <tr>
        <td className="padding-row">
          <div className="text-center">
            {toString(data.dispenserNo)}
          </div>
        </td>
        <td className="padding-row">
          <div className="text-center">
            {toString(data.nozzleNo)}
          </div>
        </td>
        <td className="padding-row">
          <div className="text-left">
            {toString(data.gasNameTh)}
          </div>
        </td>
        <td className="padding-row">
          <div className="text-center">
            {toString(data.recRunNo, false, false)}
          </div>
        </td>
        <td className="padding-row">
          <div className="text-center">
            {formatFullDate(data.createDtm)}
          </div>
        </td>
        <td className="padding-row">
          <div className="text-left">
            {toString(data.createUser)}
          </div>
        </td>
        <td>
          <ImageFromApi src={data.urlFile} dontShowWhenClick={data.urlFile==null}>
            <Image src="/img/icon/icon-meter.png" width="27" height="27" />
          </ImageFromApi>
        </td>
      </tr>
    )
  }

  return (
    <div className="py-5 container">
      <div className="row pb-2 justify-content-between">
        <span className="h1">{pathValue.data.prospectAccount.accName}</span>
        <div><Button type="primary" customLabel={msg.qrMaster} onClick={goToQrMaster} /></div>
      </div>
      {recordMeterData && recordMeterData.length > 0 ?
        <div className="px-4 pt-3">
          <div className="primary-table" style={{ overflow: "auto" }}>
            <table className="font-normal table table-striped table-bordered " style={{ width: "100%", minWidth: "800px" }}>
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>
                    {msg.dispenserNo}
                  </th>
                  <th style={{ width: "10%" }}>
                    {msg.nozzle}
                  </th>
                  <th style={{ width: "30%" }}>
                    {msg.meterProductName}
                  </th>
                  <th style={{ width: "10%" }}>
                    {msg.meterNo}
                  </th>
                  <th style={{ width: "15%" }}>
                    {msg.dateTime}
                  </th>
                  <th style={{ width: "20%" }}>
                    {msg.createBy}
                  </th>
                  <th style={{ width: "5%" }}>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recordMeterData.map((data) => {
                  return meterItem(data)
                })}
              </tbody>
            </table>
          </div>
        </div> :
        <div className="pt-4">
          <div className="d-flex justify-content-center mt-5">
            <span className="h1">
              {msg.tableNoData}
            </span>
          </div>
        </div>
      }
    </div>
  )
}


export default Main