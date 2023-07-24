import { useState, useEffect, useRef } from 'react';
import { toString, getInputData } from '@helper'
import { Collapse } from "react-bootstrap";
import ContactsCarousel from 'pages/account/components/SalesDataCarousel'
import TextField from '@components/TextField';
import Button from '@components/Button'
import Modal from '@components/Modal'
import * as apiPath from '@apiPath'
import * as msg from '@msg'

function Main({ callAPI, redirect, customAlert, pathValue }) {
  const [saleOrder, setSaleOrder] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [inputCriteria, setInputCriteria] = useState({});
  const [currentSelect, setCurrentSelect] = useState(0);
  const [initData, setInitData] = useState({});
  const criteriaRef = useRef({});

  useEffect(() => {
    searchSaleDataTab()
  }, [])
  useEffect(() => {
    setInitData(filterData && filterData[currentSelect] ? filterData[currentSelect] : {})
  }, [currentSelect, filterData])
  useEffect(() => {
    filterSalesOrderData()
  }, [inputCriteria, saleOrder])
  const filterSalesOrderData = () => {
    let result = []
    if (inputCriteria && inputCriteria.orgNameTh) {
      result = saleOrder.filter(obj => (obj.orgNameTh).toUpperCase().match(inputCriteria.orgNameTh.toUpperCase()));
    } else {
      result = saleOrder
    }
    setFilterData(result)
  }
  const searchSaleDataTab = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: {
        custCode: pathValue.data.prospectAccount.custCode
      }
    }
    const jsonResponse = await callAPI(apiPath.searchSaleDataTab, jsonRequest)
    const data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : [];
    setSaleOrder(data)
  }
  const handleSearch = () => {
    let inputData = getInputData(criteriaRef, "NE");
    if (!inputData.isInvalid) {
      setInputCriteria(inputData.data);
    }
  }
  const handleOnChangeSelect = (data) => {
    setCurrentSelect(data)
  }
  return (
    <div>
      <div className="bg-gray pt-5">
        <div className="container">
          <div className="row">
            <div className="col-4">
              <span className="h1">{pathValue.data.prospectAccount.accName}</span>
            </div>
            <div className="col-8 row justify-content-end">
              <div className="col-6">
                <TextField
                  placeholder={msg.search}
                  ref={el => criteriaRef.current.orgNameTh = el}
                />
              </div>
              <div >
                <Button type="search" onClick={handleSearch} />
              </div>
            </div>
          </div>
        </div>
        {filterData.length == 0 ?
          <div style={{ padding: "25px" }} className="d-flex justify-content-center">
            <div className="py-5">
              <div className="py-5">
                <span className="h1">
                  {msg.tableNoData}
                </span>
              </div>
            </div>
          </div> :
          <ContactsCarousel slide={filterData} onChange={(page) => handleOnChangeSelect(page)} />}
      </div>

      {Object.keys(initData).length == 0 ?
        null :
        <div className="py-5 container">
          <div >
            <span className="h2 padding-row">
              {msg.details}
            </span>
          </div>
          <div className="row">
            <div className="col-6 mt-3">
              <div className="primaryLebel text-bold">
                {msg.saleOfficeLabel}
              </div>
              <div className="primaryLebel">
                {toString(initData.officeNameTh, true)}
              </div>
            </div>
            <div className="col-6 mt-3">
              <div className="primaryLebel text-bold">
                {msg.saleGroupLabel}
              </div>
              <div className="primaryLebel">
                {toString(initData.groupNameTh, true)}
              </div>
            </div>
            <div className="col-6 mt-3">
              <div className="primaryLebel text-bold">
                {msg.customerGroup}
              </div>
              <div className="primaryLebel">
                {toString(initData.custGroup, true)}
              </div>
            </div>
            <div className="col-6 mt-3">
              <div className="primaryLebel text-bold">
                {msg.paymentTerms}
              </div>
              <div className="primaryLebel">
                {toString(initData.paymentTerm, true)}
              </div>
            </div>
            <div className="col-6 mt-3">
              <div className="primaryLebel text-bold">
                {msg.incoterms}
              </div>
              <div className="primaryLebel">
                {toString(initData.incoterm, true)}
              </div>
            </div>
          </div>
        </div>}
    </div>
  )
}


export default Main