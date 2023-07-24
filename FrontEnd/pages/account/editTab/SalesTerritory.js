import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { toString, formatObjForSelect, getInputData } from '@helper'
import Image from 'next/image'
import Modal from '@components/Modal'
import Select from '@components/Select'
import MultiSelect from '@components/MultiSelect';
import * as msg from '@msg'
import * as apiPath from '@apiPath'

function Main({ callAPI, redirect, customAlert, pathValue }) {
  const [showModal, setShowModal] = useState(false)
  const [dedicatedTerritoryData, setDedicatedTerritoryData] = useState([]);
  const [myTerritoryData, setMyTerritoryData] = useState([]);
  const [salesRepData, setSalesRepData] = useState([]);
  const [territoryOption, setTerritoryOption] = useState([]);
  const inputRef = useRef({});
  const isOtherProspectPage = pathValue.type == "3" || pathValue.isRecomentBu;
  useEffect(() => {
    searchSalesTerritoryTab();
    getTerritoryForDedicated();
  }, [])
  const handleAdd = () => {
    setShowModal(true)
  }

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
    const jsonResponse = await callAPI(apiPath.searchSalesTerritoryTab, jsonRequest)
    const data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : [];
    if (data.length > 0) {
      setDedicatedTerritoryData(data[0].dedicatedTerritory)
      setMyTerritoryData(data[0].myTerritory)
      setSalesRepData(data[0].salesRep)
    } else {
      setDedicatedTerritoryData([])
      setMyTerritoryData([])
      setSalesRepData([])
    }
  }

  const getTerritoryForDedicated = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: {
        propectId: toString(pathValue.data.prospect.prospectId),
        activeFlag: "Y"
      }
    }
    const jsonResponse = await callAPI(apiPath.getTerritoryForDedicated, jsonRequest);
    if (jsonResponse && jsonResponse.data) {
      setTerritoryOption(formatObjForSelect((jsonResponse.data.records ? jsonResponse.data.records : null), "territoryId", "territoryNameTh"));
    }
  }

  const handleSave = async () => {
    let inputData = getInputData(inputRef, "NE");
    if (!inputData.isInvalid) {
      const jsonRequest = inputData.data;
      jsonRequest.prospectId = toString(pathValue.data.prospect.prospectId)
      const jsonResponse = await callAPI(apiPath.addProspectDedicated, jsonRequest)
      if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
        setShowModal(false)
        customAlert(msg.addSuccess)
        searchSalesTerritoryTab();
        getTerritoryForDedicated();
      }
    }
  }
  const handleDelete = async (id) => {
    customAlert(msg.confirmDelete, "Q", async () => {
      const jsonRequest = {};
      jsonRequest.prospectId = toString(pathValue.data.prospect.prospectId)
      jsonRequest.prospDedicateId = toString(id);
      const jsonResponse = await callAPI(apiPath.delProspectDedicated, jsonRequest)
      if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
        customAlert(msg.deleteSuccess)
        searchSalesTerritoryTab();
        getTerritoryForDedicated();
      }
    });
  }

  const CardTerritories = ({ data, canDelete = false }) => {
    return (
      <div className="cardInTerritories">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="h2 mb-0">{data.territoryNameTh}</span>
          {canDelete && !isOtherProspectPage ?
            <div className="cursor-pointer" onClick={() => handleDelete(data.prospDedicateId)}>
              <FontAwesomeIcon icon={faTrash} className="navBarIcon" color="#777" size="1x" />
            </div>
            : null
          }
        </div>
        <div>
          <span >{msg.territoryId} : {data.territoryCode}</span>
        </div>
      </div >
    )
  }

  const CardSalesRep = ({ data, key }) => {
    return (
      <div className="cardInTerritories">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="h2 mb-0">{data.admEmployee.titleName} {data.admEmployee.firstName} {data.admEmployee.lastName}</span>
        </div>
        {data.listOrgTerritory.map((obj, index) => {
          let className = "territoririesTag tag-" + (index + 1) % 5
          return (
            <div className={className}>
              {obj.territoryNameTh}
            </div>
          )
        })}
        <div className="mt-3">
          <span >{msg.salesGroupName} : {data.orgSaleGroup.descriptionTh}</span>
        </div>
        <div className="mt-1">
          <span >{msg.role} : {data.admGroup.groupNameTh}</span>
        </div>
        <div className="d-flex align-items-center mt-1">
          <div className="d-flex align-items-center mr-1">
            <Image src="/img/icon/icon-phone.png" width="24" height="24" />
          </div>
          <span >{data.admEmployee.tellNo}</span>
        </div>
        <div className="d-flex align-items-center mt-1">
          <div className="d-flex align-items-center mr-1">
            <Image src="/img/icon/icon-email.png" width="24" height="24" />
          </div>
          <span >{data.admEmployee.email}</span>
        </div>
      </div >
    )
  }

  return (
    <div className="py-5 container">
      <div className="row pb-2">
        <span className="h1">{pathValue.data.prospectAccount.accName}</span>
      </div>
      <div className="row">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="salesTeritoryCard" >
            <div className="mb-2">
              <span className="h2">{msg.salesTterritories}</span>{myTerritoryData && myTerritoryData.length > 0 ? <span className="h2 text-green ml-1">({myTerritoryData.length})</span> : null}
            </div>
            {myTerritoryData.map((data, index) => {
              return <CardTerritories key={index} data={data} />
            })}
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <div className="salesTeritoryCard" >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="h2">{msg.dedicatedSalesTerritories}{dedicatedTerritoryData ? <span className="h2 text-green ml-1">({dedicatedTerritoryData.length})</span> : null}</span>
              {!isOtherProspectPage ?
                <div className="cursor-pointer" onClick={handleAdd}>
                  <Image src="/img/icon/icon-plus.png" width="24" height="24" />
                </div>
                :
                null
              }
            </div>
            {dedicatedTerritoryData.map((data, index) => {
              return <CardTerritories key={index} canDelete data={data} />
            })}
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <div className="salesTeritoryCard" >
            <div className="mb-2">
              <span className="h2">{msg.salesRep}</span>{salesRepData && salesRepData.length > 0 ? <span className="h2 text-green ml-1">({salesRepData.length})</span> : null}
            </div>
            {salesRepData.map((data, index) => {
              return <CardSalesRep key={index} data={data} />
            })}
          </div>
        </div>
      </div>

      <Modal
        isShow={showModal}
        onClose={() => setShowModal(false)}
        onSave={() => handleSave()}
        title={msg.dedicatedSalesTerritories}
      >
        <MultiSelect
          label={msg.territory}
          options={territoryOption}
          require
          returnArray
          ref={el => inputRef.current.territoryId = el}
        />
      </Modal>
    </div>
  )
}


export default Main