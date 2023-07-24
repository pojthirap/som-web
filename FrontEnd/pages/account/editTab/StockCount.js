import { useState, useRef, useEffect } from 'react';
import Image from 'next/image'
import * as apiPath from '@apiPath'
import * as msg from '@msg'
import { toString } from '@helper';
function Main({ callAPI, redirect, customAlert, pathValue }) {
  const [initData, setInitData] = useState([]);
  useEffect(() => {
    searchStockCountTab();
  }, [])
  const searchStockCountTab = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: {
        prospId: toString(pathValue.data.prospect.prospectId)
      }
    }
    const jsonResponse = await callAPI(apiPath.searchStockCountTab, jsonRequest);
    if (jsonResponse && jsonResponse.data) {
      setInitData(jsonResponse.data.records ? jsonResponse.data.records : null);
    }
  }
  return (
    <div>
      <div className="container py-5">
        <div className="row">
          <span className="h1 padding-row">{pathValue.data.prospectAccount.accName}</span>
        </div>
        <div className="row mt-2 pb-4">
          <span className="h2 padding-row mb-0 d-flex align-items-center">
            {msg.stockCountLabel}
          </span>
        </div>

        <div className="padding-row pb-4">
          <div style={{ border: "1px solid #ccc" }} className="borderRadiusTable">

            <div className="row py-3 primaryHeaderTable">
              <div className="col-2 d-flex align-items-center justify-content-center">
                <span className="h2 mb-0">{msg.numOrder}</span>
              </div>
              <div className="col-2 d-flex align-items-center justify-content-center">
                <span className="h2 mb-0">{msg.productCodeLabel}</span>
              </div>
              <div className="col-2 d-flex align-items-center">
                <span className="h2 mb-0">{msg.productNameLabel}</span>
              </div>
              <div className="col-2 d-flex align-items-center justify-content-center">
                <span className="h2 mb-0">{msg.baseUnitLabel}</span>
              </div>
              <div className="col-2 d-flex align-items-center justify-content-center">
                <span className="h2 mb-0">{msg.qtyLabel}</span>
              </div>
              <div className="col-2 d-flex align-items-center justify-content-center">
                <span className="h2 mb-0">{msg.unitLabel}</span>
              </div>
            </div>
            {initData.length > 0 ? initData.map((data, index) => (
              <div style={index % 2 != 0 ? { borderTop: "1px solid #ccc" } : { background: "#f6f6f6" }} className="row">
                <div className="col-2">
                  <span className="primaryInput d-flex justify-content-center">{index + 1}</span>
                </div>
                <div className="col-2">
                  <span className="primaryInput d-flex justify-content-center">{data.productCode}</span>
                </div>
                <div className="col-2">
                  <span className="primaryInput d-flex">{data.productName}</span>
                </div>
                <div className="col-2">
                  <span className="primaryInput d-flex justify-content-center">{data.baseUnit}</span>
                </div>
                <div className="col-2">
                  {data.listRecQty.map((data) => (
                    <span className="primaryInput d-flex justify-content-center">{data.qry}</span>
                  ))}
                </div>
                <div className="col-2">
                  {data.listRecQty.map((data) => (
                    <span className="primaryInput d-flex justify-content-center">{data.altUnit}</span>
                  ))}
                </div>
              </div>
            )) :
              <div style={{ background: "#f6f6f6" }} className="col-12">
                <span className="primaryInput d-flex  justify-content-center">{msg.tableNoData}</span>
              </div>}
          </div>
        </div>
      </div>
    </div>
  )
}


export default Main