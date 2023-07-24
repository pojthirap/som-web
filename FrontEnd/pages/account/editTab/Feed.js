import { useState, useRef, useEffect } from 'react';
import Image from 'next/image'
import * as apiPath from '@apiPath'
import * as msg from '@msg'
import { toString } from '@helper';
function Main({ callAPI, pathValue }) {
  const [initData, setInitData] = useState([]);
  let str = ""
  useEffect(() => {
    searchFeedTab();
  }, [])
  const searchFeedTab = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: {
        prospectId: toString(pathValue.data.prospect.prospectId)
      }
    }
    const jsonResponse = await callAPI(apiPath.searchFeedTab, jsonRequest);
    if (jsonResponse && jsonResponse.data) {
      setInitData(jsonResponse.data.records ? jsonResponse.data.records : null);
    }
  }
  const convertDate = (datetimeStr) => {
    let date = new Date(datetimeStr)
    let dateLocaleTh = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    return dateLocaleTh
  }
  const convertTime = (datetimeStr) => {
    let date = new Date(datetimeStr)
    let timeLocaleTh = date.toLocaleTimeString('th-TH', { hour: 'numeric', minute: 'numeric' })
    return timeLocaleTh
  }
  const checkDateDiff = (dateStr) => {
    let date = new Date(dateStr)
    let dateLocale = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    if (dateLocale === str) {
      return false
    }
    else {
      str = dateLocale
      return true
    }
  }
  return (
    <div>
      <div className="container pt-4">
        <div className="row">
          <span className="h1 padding-row">{pathValue.data.prospectAccount.accName}</span>
        </div>
        <div className="row mt-2 pb-2">
          <span className="h2 padding-row mb-0 d-flex align-items-center">
            {msg.allUpdate} <span className="h2 text-green ml-1 mb-0">({initData.length})</span>
          </span>
        </div>
      </div>

      {initData.map((data) => (
        <div>
          {checkDateDiff(data.updateDtm) ?
            <div className="bg-gray py-2 mt-3">
              <div className="container">
                <span className="padding-row primaryInput">{convertDate(data.updateDtm)}</span>
              </div>
            </div>
            : null}
          <div className="mt-3">
            <div className="container">
              <div className="d-flex justify-content-between">
                <div style={{ display: "flex", fontSize: "1.25rem" }}>
                  <div className="padding-row">
                    {msg.account}
                  </div>
                  <div style={{ whiteSpace: "nowrap" }} className="text-green mx-1 mb-0">
                    {pathValue.data.prospectAccount.accName}
                  </div>
                  : {msg.editTh} {data.lovNameTh} , {data.description}
                </div>
                <div style={{ whiteSpace: "nowrap" }} className="padding-row d-flex align-items-top primaryInput">
                  {msg.by} {data.createFullName}
                </div>

              </div>
              <div className="padding-row d-flex align-items-center">
                <Image src="/img/icon-time.png" width="24" height="24" />
                <div className="padding-row primaryInput d-flex align-items-center">{convertTime(data.updateDtm)}</div>
              </div>
            </div>
          </div>
        </div>
      ))
      }
    </div >
  )






}


export default Main