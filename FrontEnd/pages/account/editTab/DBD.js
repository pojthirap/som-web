import { useState, useEffect, useRef } from 'react';
import { toString, getInputData, clearInputData } from '@helper'
import TextField from '@components/TextField';
import Radio from '@components/Radio'
import Button from '@components/Button'
import * as msg from '@msg'
import * as apiPath from '@apiPath'
const radioOption = [
  { value: "C", label: msg.money },
  { value: "D", label: msg.credit },
]
function Main({ callAPI, customAlert, pathValue }) {
  const [initData, setInitData] = useState({});
  const inputRef = useRef({})
  const isOtherProspectPage = pathValue.type == "3" || pathValue.isRecomentBu;
  useEffect(() => {
    searchSalesTerritoryTab();
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
    const jsonResponse = await callAPI(apiPath.searchProspectSaTab, jsonRequest)
    const data = jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 ? jsonResponse.data.records[0] : {};
    setInitData(data)
  }
  const saveFunctiion = async () => {
    let inputData = getInputData(inputRef, "C");
    if (!inputData.isInvalid) {
      inputData.data.dbdRegCapital = inputData.data.dbdRegCapital ? inputData.data.dbdRegCapital.replaceAll(",", "") : null
      inputData.data.dbdTotalIncome = inputData.data.dbdTotalIncome ? inputData.data.dbdTotalIncome.replaceAll(",", "") : null
      inputData.data.dbdProfitLoss = inputData.data.dbdProfitLoss ? inputData.data.dbdProfitLoss.replaceAll(",", "") : null
      inputData.data.dbdTotalAsset = inputData.data.dbdTotalAsset ? inputData.data.dbdTotalAsset.replaceAll(",", "") : null
      inputData.data.dbdOilConsuption = inputData.data.dbdOilConsuption ? inputData.data.dbdOilConsuption.replaceAll(",", "") : null
      inputData.data.dbdCarWheel4 = inputData.data.dbdCarWheel4 ? inputData.data.dbdCarWheel4.replaceAll(",", "") : null
      inputData.data.dbdCarWheel6 = inputData.data.dbdCarWheel6 ? inputData.data.dbdCarWheel6.replaceAll(",", "") : null
      inputData.data.dbdCarWheel8 = inputData.data.dbdCarWheel8 ? inputData.data.dbdCarWheel8.replaceAll(",", "") : null
      inputData.data.dbdCaravan = inputData.data.dbdCaravan ? inputData.data.dbdCaravan.replaceAll(",", "") : null
      inputData.data.dbdCarTrailer = inputData.data.dbdCarTrailer ? inputData.data.dbdCarTrailer.replaceAll(",", "") : null
      inputData.data.dbdCarContainer = inputData.data.dbdCarContainer ? inputData.data.dbdCarContainer.replaceAll(",", "") : null
      inputData.data.dbdMachine = inputData.data.dbdMachine ? inputData.data.dbdMachine.replaceAll(",", "") : null

      inputData.data.changeField = inputData.changeField
      let jsonRequest = inputData.data
      jsonRequest.ProspectId = toString(pathValue.data.prospect.prospectId)
      const jsonResponse = await callAPI(apiPath.updProspectDbdTab, jsonRequest)
      if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
        customAlert(msg.addSuccess)
        searchSalesTerritoryTab();

      }
    }
  }
  const handleCancel = () => {
    clearInputData(inputRef);
  }
  return (
    <div className="py-5 container">
      <div className="row pb-2 padding-row">
        <span className="h1">{pathValue.data.prospectAccount.accName}</span>
      </div>
      <div >
        <span className="h2 padding-row">
          {msg.details}
        </span>
      </div>

      <div className="row">
        <div className="col-6 mt-3">
          <div className="primaryLebel text-bold">
            {msg.contactName}
          </div>
          <div className="primaryLebel">
            {initData.firstName || initData.lastName ? (initData.firstName ? toString(initData.firstName) : "") + " " + (initData.lastName ? toString(initData.lastName) : "") : "-"}
          </div>
        </div>
        <div className="col-6 mt-3">
          <div className="primaryLebel text-bold">
            {msg.contactNumber}
          </div>
          <div className="primaryLebel">
            {toString(initData.mobileNo, true)}
          </div>
        </div>
        <div className="col-6 mt-3">
          <div className="primaryLebel text-bold">
            {msg.prospectName}
          </div>
          <div className="primaryLebel">
            {toString(initData.accName, true)}
          </div>
        </div>
        <div className="col-6 mt-3">
          <div className="primaryLebel text-bold">
            {msg.vatNumber}
          </div>
          <div className="primaryLebel">
            {toString(initData.identifyId, true)}
          </div>
        </div>
        <div className="col-6 mt-3">
          <div className="primaryLebel text-bold">
            {msg.province}
          </div>
          <div className="primaryLebel">
            {toString(initData.provinceNameTh, true)}
          </div>
        </div>
        <div className="col-6 mt-3">
          <div className="primaryLebel text-bold">
            {msg.codeDBD}
          </div>
          <div className="primaryLebel">
            {toString(initData.dbdCode, true)}
          </div>
        </div>
        <div className="col-6 mt-3">
          <div className="primaryLebel text-bold">
            {msg.corporateType}
          </div>
          <div className="primaryLebel">
            {toString(initData.dbdCorpType, true)}
          </div>
        </div>
        <div className="col-6 mt-3">
          <div className="primaryLebel text-bold">
            {msg.juristicStatus}
          </div>
          <div className="primaryLebel">
            {toString(initData.dbdJuristicStatus, true)}
          </div>
        </div>
        <div className="col-6 mt-3">
          <div className="primaryLebel text-bold">
            {msg.latitude}
          </div>
          <div className="primaryLebel">
            {toString(initData.latitude, true)}
          </div>
        </div>
        <div className="col-6 mt-3">
          <div className="primaryLebel text-bold">
            {msg.longitude}
          </div>
          <div className="primaryLebel">
            {toString(initData.longitude, true)}
          </div>
        </div>
        <div className="col-6 mt-3">
          <TextField
            decimalFormat
            isAllowed={9999999999999.99}
            allowChar="NUM DOT"
            label={msg.registerCapital}
            placeholder={isOtherProspectPage ? "-" : null}
            defaultValue={initData.dbdRegCapital ? toString(initData.dbdRegCapital) : ""}
            ref={el => inputRef.current.dbdRegCapital = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            decimalFormat
            isAllowed={9999999999999.99}
            allowChar="NUM DOT"
            label={msg.totalIncome}
            placeholder={isOtherProspectPage ? "-" : null}
            defaultValue={initData.dbdTotalIncome ? toString(initData.dbdTotalIncome) : ""}
            ref={el => inputRef.current.dbdTotalIncome = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            decimalFormat
            isAllowed={9999999999999.99}
            allowChar="NUM DOT"
            label={msg.profitLoss}
            placeholder={isOtherProspectPage ? "-" : null}
            defaultValue={initData.dbdProfitLoss ? toString(initData.dbdProfitLoss) : ""}
            ref={el => inputRef.current.dbdProfitLoss = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            decimalFormat
            isAllowed={9999999999999.99}
            allowChar="NUM DOT"
            label={msg.totalAssets}
            placeholder={isOtherProspectPage ? "-" : null}
            defaultValue={initData.dbdTotalAsset ? toString(initData.dbdTotalAsset) : ""}
            ref={el => inputRef.current.dbdTotalAsset = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>


        <div className="col-6 mt-3">
          <TextField
            allowChar="NUM"
            maxLength={20}
            label={msg.fleetCard}
            defaultValue={initData.dbdFleetCard ? initData.dbdFleetCard : isOtherProspectPage ? "-" : ""}
            ref={el => inputRef.current.dbdFleetCard = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            allowChar="NUM"
            maxLength={20}
            label={msg.corporateCard}
            defaultValue={initData.dbdCorpCard ? initData.dbdCorpCard : isOtherProspectPage ? "-" : ""}
            ref={el => inputRef.current.dbdCorpCard = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            decimalFormat
            isAllowed={99999999999999999999}
            allowChar="NUM"
            label={msg.fuelUsed}
            placeholder={isOtherProspectPage ? "-" : null}
            defaultValue={initData.dbdOilConsuption ? initData.dbdOilConsuption : ""}
            ref={el => inputRef.current.dbdOilConsuption = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            label={msg.currentStation}
            defaultValue={initData.dbdCurrentStation ? initData.dbdCurrentStation : isOtherProspectPage ? "-" : ""}
            ref={el => inputRef.current.dbdCurrentStation = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <Radio
            label={msg.payType}
            name="payType"
            options={radioOption}
            defaultValue={initData.dbdPayChannel ? initData.dbdPayChannel : "C"}
            ref={el => inputRef.current.dbdPayChannel = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            decimalFormat
            isAllowed={9999999999}
            allowChar="NUM"
            label={msg.fourWheelCar}
            placeholder={isOtherProspectPage ? "-" : null}
            defaultValue={initData.dbdCarWheel4 ? initData.dbdCarWheel4 : ""}
            ref={el => inputRef.current.dbdCarWheel4 = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            decimalFormat
            isAllowed={9999999999}
            allowChar="NUM"
            label={msg.sixWheelCar}
            placeholder={isOtherProspectPage ? "-" : null}
            defaultValue={initData.dbdCarWheel6 ? initData.dbdCarWheel6 : ""}
            ref={el => inputRef.current.dbdCarWheel6 = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            decimalFormat
            isAllowed={9999999999}
            allowChar="NUM"
            label={msg.eightWheelCar}
            placeholder={isOtherProspectPage ? "-" : null}
            defaultValue={initData.dbdCarWheel8 ? initData.dbdCarWheel8 : ""}
            ref={el => inputRef.current.dbdCarWheel8 = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            decimalFormat
            isAllowed={9999999999}
            allowChar="NUM"
            label={msg.chainCar}
            placeholder={isOtherProspectPage ? "-" : null}
            defaultValue={initData.dbdCaravan ? initData.dbdCaravan : ""}
            ref={el => inputRef.current.dbdCaravan = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            decimalFormat
            isAllowed={9999999999}
            allowChar="NUM"
            label={msg.trailerCar}
            placeholder={isOtherProspectPage ? "-" : null}
            defaultValue={initData.dbdCarTrailer ? initData.dbdCarTrailer : ""}
            ref={el => inputRef.current.dbdCarTrailer = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            decimalFormat
            isAllowed={9999999999}
            allowChar="NUM"
            label={msg.containerTrailer}
            placeholder={isOtherProspectPage ? "-" : null}
            defaultValue={initData.dbdCarContainer ? initData.dbdCarContainer : ""}
            ref={el => inputRef.current.dbdCarContainer = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            decimalFormat
            isAllowed={9999999999}
            allowChar="NUM"
            label={msg.machinery}
            placeholder={isOtherProspectPage ? "-" : null}
            defaultValue={initData.dbdMachine ? initData.dbdMachine : ""}
            ref={el => inputRef.current.dbdMachine = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            label={msg.other}
            defaultValue={initData.dbdOther ? initData.dbdOther : isOtherProspectPage ? "-" : ""}
            ref={el => inputRef.current.dbdOther = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            label={msg.withTank}
            defaultValue={initData.dbdTank ? initData.dbdTank : isOtherProspectPage ? "-" : ""}
            ref={el => inputRef.current.dbdTank = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            label={msg.fuelStation}
            defaultValue={initData.dbdStation ? initData.dbdStation : isOtherProspectPage ? "-" : ""}
            ref={el => inputRef.current.dbdStation = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            label={msg.bothType}
            defaultValue={initData.dbdType2 ? initData.dbdType2 : isOtherProspectPage ? "-" : ""}
            ref={el => inputRef.current.dbdType2 = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            label={msg.maintenanceCenter}
            defaultValue={initData.dbdMaintainCenter ? initData.dbdMaintainCenter : isOtherProspectPage ? "-" : ""}
            ref={el => inputRef.current.dbdMaintainCenter = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            label={msg.garage}
            defaultValue={initData.dbdGeneralGarage ? initData.dbdGeneralGarage : isOtherProspectPage ? "-" : ""}
            ref={el => inputRef.current.dbdGeneralGarage = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            label={msg.companyMaintenanceDepartment}
            defaultValue={initData.dbdMaintainDept ? initData.dbdMaintainDept : isOtherProspectPage ? "-" : ""}
            ref={el => inputRef.current.dbdMaintainDept = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            label={msg.recommender}
            defaultValue={initData.dbdRecommender ? initData.dbdRecommender : isOtherProspectPage ? "-" : ""}
            ref={el => inputRef.current.dbdRecommender = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            label={msg.saleMan}
            defaultValue={initData.dbdSale ? initData.dbdSale : isOtherProspectPage ? "-" : ""}
            ref={el => inputRef.current.dbdSale = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            label={msg.afterSalesOfficer}
            defaultValue={initData.dbdSaleSupport ? initData.dbdSaleSupport : isOtherProspectPage ? "-" : ""}
            ref={el => inputRef.current.dbdSaleSupport = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
        <div className="col-6 mt-3">
          <TextField
            label={msg.remark}
            defaultValue={initData.dbdRemark ? initData.dbdRemark : isOtherProspectPage ? "-" : ""}
            ref={el => inputRef.current.dbdRemark = el}
            disabled={isOtherProspectPage ? true : false}
          />
        </div>
      </div>
      {
        isOtherProspectPage ? null :
          <div className="row mt-5">
            <div className="col-6 d-flex justify-content-end">
              <div className="col-5 p-0">
                <Button
                  type="cancle"
                  onClick={handleCancel}
                />
              </div>
            </div>
            <div className="col-6 d-flex justify-content-start">
              <div className="col-5 p-0">
                <Button
                  type="save"
                  onClick={saveFunctiion}
                />
              </div>
            </div>
          </div>
      }
    </div>
  )
}


export default Main