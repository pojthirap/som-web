import { useState, useRef, useEffect } from 'react';
import { getInputData, formatObjForSelect } from '@helper';
import MultiSelect from '@components/MultiSelect';
import Button from '@components/Button';
import Image from 'next/image'
import * as apiPath from '@apiPath'
import * as msg from '@msg'
import { toString } from '@helper';
function Main({ callAPI, redirect, customAlert, pathValue }) {
  const inputProspectRecommendBuRef = useRef({});
  const [initData, setInitData] = useState([]);
  const [businessUnit, setBusinessUnit] = useState();

  const isProspectPage = pathValue.type == "0";
  const isCustomerPage = pathValue.type == "2";
  const isRentstationPage = pathValue.type == "1";
  const isOtherProspectPage = pathValue.type == "3" || pathValue.isRecomentBu;

  useEffect(() => {
    searchRecommendBuTab();
    getBusinessUnit();
  }, [])

  const searchRecommendBuTab = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: {
        prospectId: toString(pathValue.data.prospect.prospectId),
        activeFlag: "Y"
      }
    }
    const jsonResponse = await callAPI(apiPath.searchRecommendBuTab, jsonRequest);
    if (jsonResponse && jsonResponse.data) {
      setInitData(jsonResponse.data.records ? jsonResponse.data.records : null);
    }
  }

  const getBusinessUnit = async () => {
    const jsonRequest = {
      searchOption: 1,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: {
        prospectId: toString(pathValue.data.prospect.prospectId),
        activeFlag: "Y"
      }
    }

    const jsonResponse = await callAPI(apiPath.searchBusinessUnit, jsonRequest);
    setBusinessUnit(jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : null);
  }

  const filterDataForSelectBusinessUnit = () => {
    if (!(businessUnit)) return [];
    return formatObjForSelect(businessUnit, "buId", "buNameTh");
  }

  const addProspectRecommend = async () => {
    let inputProspectRecommendBU = getInputData(inputProspectRecommendBuRef, "NE");
    const jsonRequest = {
      prospectId: toString(pathValue.data.prospect.prospectId),
      buIdList: inputProspectRecommendBU.data.buId.split(",")
    }
    const jsonResponse = await callAPI(apiPath.addProspectRecommend, jsonRequest);
    if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
      inputProspectRecommendBuRef.current.buId.clearValue()
      searchRecommendBuTab();
      getBusinessUnit();
      customAlert(msg.addSuccess)
    }
  }

  async function delProspectRecommend(prospRecommId) {
    customAlert(msg.confirmDelete, "Q", async () => {
      const jsonRequest = {
        prospRecommId: toString(prospRecommId)
      }
      const jsonResponse = await callAPI(apiPath.delProspectRecommend, jsonRequest);
      if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
        searchRecommendBuTab();
        getBusinessUnit();
        customAlert(msg.deleteSuccess)
      }
    })
  }

  return (
    <div style={{ minHeight: 500 }} className="py-5 container">
      <div className="row">
        <div className="col-4">
          <span className="h1">{pathValue.data.prospectAccount.accName}</span>
        </div>
        {isRentstationPage || isCustomerPage || isOtherProspectPage ? null :
          <div className="col-8 row justify-content-end">
            <div className="col-6">
              <div className="setDropdownlist">
                <MultiSelect
                  options={filterDataForSelectBusinessUnit()}
                  ref={el => inputProspectRecommendBuRef.current.buId = el}
                />
              </div>
            </div>
            <div className="padding-row">
              <Button type="add" customLabel={msg.add} onClick={addProspectRecommend} />
            </div>
          </div>}
      </div>
      {initData && initData.length > 0 ?
        <div className="row">
          {initData.map((data) => {
            return (
              <div className="col-6 col-md-4 col-lg-4">
                <div className="cardRecommendBu">
                  <div style={{ padding: "5%" }} className="d-flex align-items-center justify-content-between">
                    <div className="h2 m-0">{data.buNameTh}</div>
                    {isRentstationPage || isCustomerPage || isOtherProspectPage ? null :
                      <Image src="/img/Vector.png" width="20" height="20" className="deleteRecommentBU" onClick={() => delProspectRecommend(data.prospRecommId)} />}
                  </div>
                </div>
              </div>
            )
          })}
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