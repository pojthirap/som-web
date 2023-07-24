import { useState, useEffect, useRef } from 'react';
import { toString, getInputData } from '@helper'
import { Collapse } from "react-bootstrap";
import ContactsCarousel from 'pages/account/components/ContactsCarousel'
import TextField from '@components/TextField';
import Button from '@components/Button'
import Modal from '@components/Modal'
import * as apiPath from '@apiPath'
import * as msg from '@msg'
function Main({ callAPI, redirect, customAlert, pathValue }) {
  const [contactData, setContactData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [inputCriteria, setInputCriteria] = useState({});
  const [initData, setInitData] = useState({});
  const [currentSelect, setCurrentSelect] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [cantEdit, setCantEdit] = useState(true);
  const inputRef = useRef({});
  const inputAddRef = useRef({});
  const criteriaRef = useRef({});
  const isCustomerPage = pathValue.type == "2";
  const isOtherProspectPage = pathValue.type == "3" || pathValue.isRecomentBu;

  useEffect(() => {
    searchContact()
  }, [])
  useEffect(() => {
    setInitData(filterData && filterData[currentSelect] ? filterData[currentSelect] : {})
  }, [currentSelect, filterData])

  useEffect(() => {
    filterContactData()
  }, [inputCriteria, contactData])
  const searchContact = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: {
        activeFlag: "Y",
        prospectId: toString(pathValue.data.prospect.prospectId),
        prosAccId: toString(pathValue.data.prospect.prospAccId)
      }
    }
    const jsonResponse = await callAPI(apiPath.searchProspectContact, jsonRequest)
    const data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : [];
    setContactData(data)

  }
  const handleOnChangeSelect = (data) => {
    setCurrentSelect(data)
    setCantEdit(true)
  }
  const handleSearch = () => {
    let inputData = getInputData(criteriaRef, "NE");
    if (!inputData.isInvalid) {
      setInputCriteria(inputData.data);
    }
  }

  const filterContactData = () => {
    let result = []
    if (inputCriteria && inputCriteria.name) {
      result = contactData.filter(obj => (obj.firstName + " " + obj.lastName).toUpperCase().match(inputCriteria.name.toUpperCase()));
    } else {
      result = contactData
    }
    setFilterData(result)
  }

  const addContact = () => {
    setShowModal(true)
  }

  const saveAddContact = async () => {
    let inputData = getInputData(inputAddRef, "NE");
    if (!inputData.isInvalid) {
      const jsonRequest = inputData.data;
      jsonRequest.prospectId = toString(pathValue.data.prospect.prospectId)
      jsonRequest.prospAccId = toString(pathValue.data.prospect.prospAccId)
      const jsonResponse = await callAPI(apiPath.addContact, jsonRequest)
      if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
        setShowModal(false)
        customAlert(msg.addSuccess)
        criteriaRef.current.name.clearValue()
        setInputCriteria({})
        searchContact()
      }
    }
  }
  const editContact = () => {
    setCantEdit(false)
  }
  const saveContact = async () => {
    let inputData = getInputData(inputRef, "C");
    if (!inputData.isInvalid) {
      inputData.data.changeField = inputData.changeField
      const jsonRequest = inputData.data;
      jsonRequest.prospectId = toString(pathValue.data.prospect.prospectId)
      jsonRequest.prospAccId = toString(pathValue.data.prospect.prospAccId)
      jsonRequest.prospContactId = toString(initData.prospContactId)
      const jsonResponse = await callAPI(apiPath.updContact, jsonRequest)
      if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
        setShowModal(false)
        customAlert(msg.editSuccess)
        criteriaRef.current.name.clearValue()
        setInputCriteria({})
        searchContact()
      }
    }
  }
  const deleteContact = async () => {
    customAlert(msg.confirmDelete, "Q", async () => {
      const jsonRequest = {};
      jsonRequest.prospectId = toString(pathValue.data.prospect.prospectId)
      jsonRequest.prospAccId = toString(pathValue.data.prospect.prospAccId)
      jsonRequest.prospContactId = toString(initData.prospContactId)
      const jsonResponse = await callAPI(apiPath.delContact, jsonRequest)
      if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
        setShowModal(false)
        customAlert(msg.deleteSuccess)
        criteriaRef.current.name.clearValue()
        setInputCriteria({})
        searchContact()
      }
    });
  }


  return (
    <div>
      <div className="bg-gray pt-5">
        <div className="container p-0 ">
          <div className="row">
            <div className="col-4">
              <span className="h1">{pathValue.data.prospectAccount.accName}</span>
            </div>
            <div className="col-8 row justify-content-end">
              <div className="col-6">
                <TextField
                  placeholder={msg.search}
                  ref={el => criteriaRef.current.name = el}
                />
              </div>
              <div >
                <Button type="search" onClick={handleSearch} />
              </div>
              {isOtherProspectPage || isCustomerPage ?
                null
                :
                <div className="ml-2">
                  <Button type="add" onClick={addContact} />
                </div>
              }
            </div>
          </div>
        </div>
        <ContactsCarousel slide={filterData} onChange={(page) => handleOnChangeSelect(page)} />
      </div>
      {filterData && filterData.length > 0 ?
        <div className="py-5 container">
          <div className="pb-4">
            <div className="row">
              <span className="h2 padding-row mb-0">{msg.contactDetail}</span>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <TextField
                label={msg.name}
                require={!(initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId)}
                defaultValue={initData ? initData.firstName : ""}
                disabled={cantEdit || initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId}
                ref={el => inputRef.current.firstName = el}
                placeholder={cantEdit || initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId ? "-" : ""}
              />
            </div>
            <div className="col-6">
              <TextField
                label={msg.lastName}
                require={!(initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId)}
                defaultValue={initData ? initData.lastName : ""}
                disabled={cantEdit || initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId}
                ref={el => inputRef.current.lastName = el}
                placeholder={cantEdit || initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId ? "-" : ""}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-6">
              <TextField
                label={msg.telNo}
                defaultValue={initData ? initData.phoneNo : ""}
                disabled={cantEdit || initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId}
                allowChar="num thai eng"
                maxLength="100"
                ref={el => inputRef.current.phoneNo = el}
                placeholder={cantEdit || initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId ? "-" : ""}
              />
            </div>
            <div className="col-6">
              <TextField
                label={msg.faxNo}
                defaultValue={initData ? initData.faxNo : ""}
                disabled={cantEdit || initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId}
                allowChar="num"
                maxLength="10"
                ref={el => inputRef.current.faxNo = el}
                placeholder={cantEdit || initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId ? "-" : ""}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-6">
              <TextField
                label={msg.mobileNo}
                defaultValue={initData ? initData.mobileNo : ""}
                disabled={cantEdit || initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId}
                allowChar="num"
                maxLength="10"
                ref={el => inputRef.current.mobileNo = el}
                placeholder={cantEdit || initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId ? "-" : ""}
              />
            </div>
            <div className="col-6">
              <TextField
                type="email"
                label={msg.email}
                defaultValue={initData ? initData.email : ""}
                disabled={cantEdit || initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId}
                ref={el => inputRef.current.email = el}
                placeholder={cantEdit || initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId ? "-" : ""}
              />
            </div>
            {!isOtherProspectPage ?
              <Collapse className="col-12 row justify-content-center mt-5" in={!(initData && contactData[0] && initData.prospContactId == contactData[0].prospContactId)}>
                <div>
                  <div className="col-4 col-md-3 col-xl-2 px-4">
                    <Button type="delNew" onClick={deleteContact}></Button>
                  </div>
                  <div className="col-4 col-md-3 col-xl-2 px-4">
                    <Button type="editNew" onClick={editContact}></Button>
                  </div>
                  <div className="col-4 col-md-3 col-xl-2 px-4">
                    <Button type="save" disabled={cantEdit} onClick={saveContact}></Button>
                  </div>

                </div>
              </Collapse>
              :
              null
            }
          </div>
        </div>
        : null
      }
      <Modal
        isBtnClose={false}
        isShow={showModal}
        onClose={() => setShowModal(false)}
        onSave={() => saveAddContact()}
        title={msg.add}
        size="lg"
      >
        <div className="pb-2">
          <div className="row">
            <span className="h2 padding-row mb-0">{msg.contactDetail}</span>
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <TextField
              label={msg.name}
              require
              ref={el => inputAddRef.current.firstName = el}
            />
          </div>
          <div className="col-6">
            <TextField
              label={msg.lastName}
              require
              ref={el => inputAddRef.current.lastName = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <TextField
              label={msg.telNo}
              allowChar="num thai eng"
              maxLength="100"
              ref={el => inputAddRef.current.phoneNo = el}
            />
          </div>
          <div className="col-6">
            <TextField
              label={msg.faxNo}
              allowChar="num"
              maxLength="10"
              ref={el => inputAddRef.current.faxNo = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <TextField
              label={msg.mobileNo}
              allowChar="num"
              maxLength="10"
              ref={el => inputAddRef.current.mobileNo = el}
            />
          </div>
          <div className="col-6">
            <TextField
              type="email"
              label={msg.email}
              ref={el => inputAddRef.current.email = el}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}


export default Main