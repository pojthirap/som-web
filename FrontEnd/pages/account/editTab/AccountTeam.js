import { useState, useRef, useEffect } from 'react';
import { getInputData, formatObjForSelect } from '@helper';
import TextField from '@components/TextField';
import Button from '@components/Button';
import Image from 'next/image'
import * as apiPath from '@apiPath'
import * as msg from '@msg'
import { toString } from '@helper';
function Main({ callAPI, pathValue }) {
  const [initData, setInitData] = useState([]);
  const inputRef = useRef({});
  const [inputCriteria, setInputCriteria] = useState(null);

  useEffect(() => {
    searchAccountTeam()
  }, [])

  useEffect(() => {
    searchAccountTeam()
  }, [inputCriteria])

  const searchAccountTeam = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 0,
      model: {
        prospectId: toString(pathValue.data.prospect.prospectId),
        fullName: inputCriteria
      }
    }
    const jsonResponse = await callAPI(apiPath.searchSalesTerritoryTab, jsonRequest)
    if (jsonResponse && jsonResponse.data) {
      setInitData(jsonResponse.data.records[0].salesRep ? jsonResponse.data.records[0].salesRep : null);
    }
  }

  const handleSearch = () => {
    let inputData = getInputData(inputRef, "NE");
    setInputCriteria(inputData.data.fullName);
  }


  return (
    <div>
      <div className="container py-5">
        <div className="row">
          <div className="col-4">
            <span className="h1">{pathValue.data.prospectAccount.accName}</span>
          </div>
          <div className="col-8 row justify-content-end">
            <div className="col-6">
              <TextField
                placeholder={msg.search}
                ref={el => inputRef.current.fullName = el}
              />
            </div>
            <div >
              <Button type="search" onClick={handleSearch} />
            </div>
          </div>
        </div>
        <div className="row mt-2 pb-2">
          <span className="h2 padding-row mb-0 d-flex align-items-center">
            {msg.allUpdate} <span className="h2 text-green ml-1 mb-0">({initData.length})</span>
          </span>
        </div>

        {initData.length == 0 ?
          <div style={{ padding: "25px" }} className="d-flex justify-content-center">
            <div className="py-5">
              <div className="py-5">
                <span className="h1">
                  {msg.tableNoData}
                </span>
              </div>
            </div>
          </div>
          :
          initData.map((data) => (
            <div style={{ borderTop: "1px solid #d9d9d9" }} className="mt-3">
              <div className="row mt-3">
                <div className="col-2 col-md-2 col-lg-1">
                  <Image src="/img/iconProspect/Account.png" width="77" height="77" />
                </div>
                <div className="col-10 col-md-8 col-lg-11">
                  <span className="h2 padding-row d-flex align-items-center">
                    {data.admEmployee.titleName} {data.admEmployee.firstName} {data.admEmployee.lastName}
                  </span>
                  <div className="row">
                    <div className="col-2">
                      <span className="d-flex align-items-center secondaryInput">{msg.partyRole}</span>
                      <span style={{ wordBreak: "break-word" }} className="d-flex align-items-center primaryInput">{data.admGroup.groupNameTh}</span>
                    </div>
                    <div className="col-2">
                      <span className="d-flex align-items-center secondaryInput"> {msg.mobileNo}</span>
                      <span style={{ wordBreak: "break-word" }} className="d-flex align-items-center primaryInput"> {data.admEmployee.tellNo}</span>
                    </div>
                    <div className="col-2">
                      <span className="d-flex align-items-center secondaryInput"> {msg.email}</span>
                      <span style={{ wordBreak: "break-word" }} className="d-flex align-items-center primaryInput"> {data.admEmployee.email}</span>
                    </div>
                    <div className="col-2">
                      <span className="d-flex align-items-center secondaryInput"> {msg.saleGroup} </span>
                      <span style={{ wordBreak: "break-word" }} className="d-flex align-items-center primaryInput"> {data.orgSaleGroup.descriptionTh}</span>
                    </div>
                    <div className="col-4">
                      <span className="d-flex align-items-center secondaryInput">{msg.saleTerritory}</span>
                      {data.listOrgTerritory.map((list) => (
                        <span style={{ wordBreak: "break-word" }} className="d-flex align-items-center primaryInput">{list.territoryNameTh} </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}


export default Main