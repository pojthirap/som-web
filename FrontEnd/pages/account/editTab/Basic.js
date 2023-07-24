import { useState, useRef, useEffect } from 'react';
import TextField from '@components/TextField';
import Select from '@components/Select';
import Button from '@components/Button';
import Switch from "@components/Switch";
import VatNumber from '../components/VatNumber';
import { useDispatch } from 'react-redux'
import * as apiPath from '@apiPath'
import * as msg from '@msg'
import { getInputData, formatObjForSelect, toString, clearInputData } from '@helper';
function Main({ callAPI, redirect, customAlert, pathValue, updateProspectData }) {
  const dispatch = useDispatch();
  const [initData, setInitData] = useState();
  const [defaultProvince, setDefaultProvince] = useState();
  const [defaultDistrict, setDefaultDistrict] = useState();
  const [defaultSubDistrict, setDefaultSubDistrict] = useState();

  const [defaultProvince1, setDefaultProvince1] = useState();
  const [defaultDistrict1, setDefaultDistrict1] = useState();
  const [defaultSubDistrict1, setDefaultSubDistrict1] = useState();


  // const [isOtherProspectPage, setIsOtherProspectPage] = useState(pathValue.type == "3" || pathValue.isRecomentBu);

  const [brand, setBrand] = useState();                           // แบรนด์
  const [region, setRegion] = useState();                         // ภูมิภาค
  const [province, setProvince] = useState();                     // จังหวัด
  const [district, setDistrict] = useState();                     // อำเภอ
  const [subDistrict, setSubDistrict] = useState();               // ตำบล

  const [districtDisabled, setDistrictDisabled] = useState(true);
  const [subDistrictDisabled, setSubDistrictDisabled] = useState(true);

  const [switchEvent, setSwitchEvent] = useState(true);

  const inputProspectRef = useRef({});
  const inputProspectInfoRef = useRef({});
  const inputAddressRef = useRef({});
  const inputContactInfoRef = useRef({});

  const [editGeneralDataFlag, setEditGeneralDataFlag] = useState(false);
  const isProspectPage = pathValue.type == "0";
  const isCustomerPage = pathValue.type == "2";
  const isRentstationPage = pathValue.type == "1";
  const isOtherProspectPage = pathValue.type == "3" || pathValue.isRecomentBu;

  useEffect(() => {
    searchProspectSaTab();
    getBrand()              // แบรนด์
    getRegion();            // ภูมิภาค
    // getProvince();          // จังหวัด
    // getDistrict();          // อำเภอ
    // getSubDistrict();       // ตำบล

  }, [])

  const searchProspectSaTab = async () => {
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
    const jsonResponse = await callAPI(apiPath.searchProspectSaTab, jsonRequest);
    if (jsonResponse && jsonResponse.data) {
      if (jsonResponse.data.records[0].editGeneralDataFlag == "N") {
        setEditGeneralDataFlag(true)
      }
      if (jsonResponse.data.records[0].provinceCode && jsonResponse.data.records[0].districtCode && jsonResponse.data.records[0].subdistrictCode) {
        setDistrictDisabled(false)
        setSubDistrictDisabled(false)
      }
      setInitData(jsonResponse.data.records[0] ? jsonResponse.data.records[0] : null);
      setDefaultProvince(jsonResponse.data.records[0] ? jsonResponse.data.records[0] : null)
      setDefaultProvince1(jsonResponse.data.records[0] ? jsonResponse.data.records[0] : null)
      setDefaultDistrict(jsonResponse.data.records[0] ? jsonResponse.data.records[0] : null)
      setDefaultDistrict1(jsonResponse.data.records[0] ? jsonResponse.data.records[0] : null)
      setDefaultSubDistrict(jsonResponse.data.records[0] ? jsonResponse.data.records[0] : null)
      setDefaultSubDistrict1(jsonResponse.data.records[0] ? jsonResponse.data.records[0] : null)

      getProvince(jsonResponse.data.records[0].regionCode ? jsonResponse.data.records[0].regionCode : null);          // จังหวัด
      if (jsonResponse.data.records[0].provinceCode) getDistrict(jsonResponse.data.records[0].provinceCode);          // อำเภอ
      if (jsonResponse.data.records[0].districtCode) getSubDistrict(jsonResponse.data.records[0].districtCode);       // ตำบล
    }
  }
  const getBrand = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 2,
      startRecord: 0,
      length: 0,
      pageNo: 1,
      model: { activeFlag: "Y" }
    }
    const jsonResponse = await callAPI(apiPath.searchBrand, jsonRequest);
    if (jsonResponse && jsonResponse.data) {
      setBrand(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
    }
  }
  const getRegion = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 1,
      model: { activeFlag: "Y" }
    }
    const jsonResponse = await callAPI(apiPath.searchRegion, jsonRequest);
    if (jsonResponse && jsonResponse.data) {
      setRegion(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
    }
  }
  const getProvince = async (code) => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 1,
      model: {
        regionCode: code,
        activeFlag: "Y"
      }
    }
    const jsonResponse = await callAPI(apiPath.searchProvince, jsonRequest);
    if (jsonResponse && jsonResponse.data) {
      setProvince(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
    }
  }
  const getDistrict = async (code) => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 1,
      model: {
        provinceCode: code,
        activeFlag: "Y"
      }
    }
    const jsonResponse = await callAPI(apiPath.searchDistrict, jsonRequest);
    if (jsonResponse && jsonResponse.data) {
      setDistrict(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
    }
  }
  const getSubDistrict = async (code) => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 1,
      model: {
        districtCode: code,
        activeFlag: "Y"
      }
    }
    const jsonResponse = await callAPI(apiPath.searchSubDistrict, jsonRequest);
    if (jsonResponse && jsonResponse.data) {
      setSubDistrict(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
    }
  }
  const filterDataForSelectBrand = () => {
    if (!(brand && brand.records)) return [];
    return formatObjForSelect(brand.records, "brandId", "brandNameTh");
  }
  const filterDataForSelectRegion = () => {
    if (!(region && region.records)) return [];
    return formatObjForSelect(region.records, "regionCode", "regionNameTh");
  }
  const filterDataForSelectProvince = () => {
    if (!(province && province.records)) return [];
    return formatObjForSelect(province.records, "provinceCode", "provinceNameTh");
  }
  const filterDataForSelectDistrict = () => {
    if (!(district && district.records)) return [];
    return formatObjForSelect(district.records, "districtCode", "districtNameTh");
  }
  const filterDataForSelectSubDistrict = () => {
    if (!(subDistrict && subDistrict.records)) return [];
    return formatObjForSelect(subDistrict.records, "subdistrictCode", "subdistrictNameTh");
  }

  const onRegionChange = (code) => {
    inputAddressRef.current.provinceCode.clearValue();
    inputAddressRef.current.provinceCode.clearValidate();
    inputAddressRef.current.districtCode.clearValue();
    inputAddressRef.current.districtCode.clearValidate();
    inputAddressRef.current.subdistrictCode.clearValue();
    inputAddressRef.current.subdistrictCode.clearValidate();
    setProvince([])
    setDistrict([])
    setSubDistrict([])
    setDistrictDisabled(true);
    setSubDistrictDisabled(true);
    if (code) {
      getProvince(code);
      setDefaultProvince(null)
    }
    else if (!code) {
      getProvince();
      setDefaultProvince(null)
    }
  }

  const onProvinceChange = (code) => {
    inputAddressRef.current.districtCode.clearValue();
    inputAddressRef.current.districtCode.clearValidate();
    inputAddressRef.current.subdistrictCode.clearValue();
    inputAddressRef.current.subdistrictCode.clearValidate();
    setDistrict([])
    setSubDistrict([]);
    if (code) {
      getDistrict(code);
      setDefaultDistrict(null)
      setDefaultSubDistrict(null)
      setDistrictDisabled(false);
      setSubDistrictDisabled(true);
    }
    else {
      setDefaultDistrict(defaultDistrict1)
      setDefaultSubDistrict(defaultSubDistrict1)
      setDistrictDisabled(true);
      setSubDistrictDisabled(true);
    }
  }

  const onDistrictChange = (code) => {
    inputAddressRef.current.subdistrictCode.clearValue();
    inputAddressRef.current.subdistrictCode.clearValidate();
    setSubDistrict([]);
    if (code) {
      getSubDistrict(code);
      setDefaultSubDistrict(null)
      setSubDistrictDisabled(false);
    }
    else {
      setDefaultSubDistrict(defaultSubDistrict1)
      setSubDistrictDisabled(true);
    }
  }

  const handleCancel = () => {
    clearInputData(inputProspectRef);
    clearInputData(inputProspectInfoRef);
    clearInputData(inputAddressRef);
    clearInputData(inputContactInfoRef);

    setDefaultProvince(defaultProvince1)
    setDefaultDistrict(defaultDistrict1)
    setDefaultSubDistrict(defaultSubDistrict1)

    setDistrictDisabled(false);
    setSubDistrictDisabled(false);

    setSwitchEvent(true)
    // getProvince();
    // getDistrict();
    // getSubDistrict();
  }

  const delFunctiion = async () =>{
    customAlert(msg.confirmDelete, "Q", async () => {
      const jsonRequest = {};
      jsonRequest.prospectId = toString(pathValue.data.prospect.prospectId)
      const jsonResponse = await callAPI(apiPath.delProspect, jsonRequest)
      if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
        customAlert(msg.deleteSuccess)
        dispatch(redirect("/account/prospect"))
      }
    });
  }

  const saveFunctiion = async () => {
    let inputProspectData = getInputData(inputProspectRef, "C");
    let inputProspectInfoData = getInputData(inputProspectInfoRef, "C");
    let inputAddressRefData = getInputData(inputAddressRef, "C");
    let inputContactInfoData = getInputData(inputContactInfoRef, "C");

    if (inputAddressRefData.data.latitude && inputAddressRefData.data.longitude) {
      if (!validateLatLng(inputAddressRefData.data.latitude, inputAddressRefData.data.longitude)) return customAlert(msg.latOrLongWorng)
    } else if (inputAddressRefData.data.latitude || inputAddressRefData.data.longitude) {
      return customAlert(msg.enterBothLatAndLong)
    }
    if (!inputProspectInfoData.isInvalid && !inputAddressRefData.isInvalid && !inputContactInfoData.isInvalid) {
      inputProspectData.data.prospectId = toString(initData.prospectId)
      inputProspectInfoData.data.prospAccId = toString(initData.prospAccId)
      inputAddressRefData.data.prospAddrId = toString(initData.prospAddrId)
      inputContactInfoData.data.prospContactId = toString(initData.prospContactId)

      inputProspectInfoData.data.brandId = inputProspectInfoData.data.brandId == "" ? null : inputProspectInfoData.data.brandId

      if (isProspectPage) inputProspectData.data.prospectType = inputProspectData.data.prospectType ? "2" : "0"
      else if (isRentstationPage) inputProspectData.data.prospectType = inputProspectData.data.prospectType ? "2" : "1"
      else if (isCustomerPage) inputProspectData.data.prospectType = inputProspectData.data.prospectType ? "2" : "0"
      inputProspectInfoData.data.accGroupRef = inputProspectInfoData.data.accGroupRef ? inputProspectInfoData.data.accGroupRef : inputProspectInfoData.data.identifyId
      inputAddressRefData.data.provinceDbd = initData.provinceDbd

      let changeField = []
      if (inputProspectInfoData.changeField) changeField.push(inputProspectInfoData.changeField)
      if (inputAddressRefData.changeField) changeField.push(inputAddressRefData.changeField)
      if (inputContactInfoData.changeField) changeField.push(inputContactInfoData.changeField)
      inputProspectData.data.changeField = changeField.join(", ")

      const jsonRequest = {
        prospectModel: inputProspectData.data,
        prospectAccountModel: inputProspectInfoData.data,
        prospectAddressModel: inputAddressRefData.data,
        prospectContactModel: inputContactInfoData.data,
      }
      const jsonResponse = await callAPI(apiPath.updProspectBasicTab, jsonRequest)
      if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
        customAlert(msg.addSuccess)
        if (isProspectPage && inputProspectData.data.prospectType == "2") {
          dispatch(redirect("/account/prospect"))
        }
        else if (isCustomerPage && inputProspectData.data.prospectType == "0") {
          dispatch(redirect("/account/customer"))
        }
        else if (isRentstationPage && inputProspectData.data.prospectType == "2") {
          dispatch(redirect("/account/rentstation"))
        }
        else {
          searchProspectSaTab();
          updateProspectData();
        }
      }
    }
  }

  function validateLatLng(lat, lng) {
    return (lat && isFinite(lat) && Math.abs(lat) <= 90) && (lng && isFinite(lng) && Math.abs(lng) <= 180);
  }
  return (
    <div className="py-5">
      <div className="container">
        <div className="row d-flex justify-content-between">
          <span className="h1 padding-row">{pathValue.data.prospectAccount.accName}</span>
          <div className="col-6">

          </div>
        </div>
      </div>
      <div className="container">
        <div className="pb-4">
          <div className="row d-flex justify-content-between">
            <span className="h2 padding-row mb-0 d-flex align-items-center">
              {(isCustomerPage ? msg.customerData : (isProspectPage || isOtherProspectPage ? msg.prospectData : "")) + (isRentstationPage ? msg.pumpData : "")}
            </span>
            <div className="padding-row">
              <Switch
                label={msg.customer}
                defaultValue={initData && initData.prospectType == "2" ? true : false}
                ref={el => inputProspectRef.current.prospectType = el}
                disabled={initData && initData.custCode == "" ? true : false}
                onChange={(e) => setSwitchEvent(e)}
              />
            </div>
          </div>
          <div className="row">
            <span className="primaryLabel padding-row">{msg.newAccount}</span>
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || isRentstationPage || editGeneralDataFlag ? "-" : null}
              require
              label={msg.name}
              defaultValue={initData && initData.accName ? initData.accName : ""}
              ref={el => inputProspectInfoRef.current.accName = el}
              disabled={isCustomerPage || isOtherProspectPage || isRentstationPage || editGeneralDataFlag ? true : false}
            />
          </div>
          <div className="col-6">
            <Select
              label={msg.brand}
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              options={filterDataForSelectBrand()}
              ref={el => inputProspectInfoRef.current.brandId = el}
              defaultValue={initData && initData.brandId ? toString(initData.brandId) : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            {/* <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              allowChar="NUM"
              maxLength={13}
              label={msg.taxNumberOrIDCard}
              ref={el => inputProspectInfoRef.current.identifyId = el}
              defaultValue={initData && initData.identifyId ? initData.identifyId : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            /> */}
            <VatNumber
              // placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              ref={el => inputProspectInfoRef.current.identifyId = el}
              defaultValue={initData && initData.identifyId ? initData.identifyId : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              maxLength={20}
              label={msg.prospectGroupRef}
              ref={el => inputProspectInfoRef.current.accGroupRef = el}
              defaultValue={initData && initData.accGroupRef ? initData.accGroupRef : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
        </div>
      </div>
      <div className="container pt-4">
        <div className="py-4">
          <div className="row">
            <span className="h2 padding-row mb-0">{msg.address}</span>
          </div>
          <div className="row">
            <span className="primaryLabel padding-row">{msg.newAccount}</span>
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              allowChar="NUM SLASH"
              maxLength={50}
              label={msg.addressNo}
              ref={el => inputAddressRef.current.addrNo = el}
              defaultValue={initData && initData.addrNo ? initData.addrNo : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              maxLength={50}
              label={msg.moo}
              ref={el => inputAddressRef.current.moo = el}
              defaultValue={initData && initData.moo ? initData.moo : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              maxLength={50}
              label={msg.soi}
              ref={el => inputAddressRef.current.soi = el}
              defaultValue={initData && initData.soi ? initData.soi : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              maxLength={50}
              label={msg.road}
              ref={el => inputAddressRef.current.street = el}
              defaultValue={initData && initData.street ? initData.street : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              allowChar="NUM ENG THAI"
              maxLength={20}
              label={msg.telNo}
              ref={el => inputAddressRef.current.tellNo = el}
              defaultValue={initData && initData.tellNo ? initData.tellNo : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              allowChar="NUM"
              maxLength={10}
              label={msg.faxNo}
              ref={el => inputAddressRef.current.faxNo = el}
              defaultValue={initData && initData.addressFaxNo ? initData.addressFaxNo : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6 row px-0">
            <div className="col-6">
              <TextField
                placeholder={isOtherProspectPage ? "-" : null}
                allowChar="NUM DOT DAT"
                maxLength={50}
                label={msg.latitude}
                ref={el => inputAddressRef.current.latitude = el}
                defaultValue={initData && initData.latitude ? initData.latitude : ""}
                disabled={isOtherProspectPage ? true : false}
              />
            </div>
            <div className="col-6">
              <TextField
                placeholder={isOtherProspectPage ? "-" : null}
                allowChar="NUM DOT DAT"
                maxLength={50}
                label={msg.longitude}
                ref={el => inputAddressRef.current.longitude = el}
                defaultValue={initData && initData.longitude ? initData.longitude : ""}
                disabled={isOtherProspectPage ? true : false}
              />
            </div>
          </div>
          <div className="col-6">
            <Select
              placeholder={isCustomerPage || isOtherProspectPage ? "-" : null}
              label={msg.region}
              options={filterDataForSelectRegion()}
              defaultValue={initData && initData.regionCode ? initData.regionCode : ""}
              ref={el => inputAddressRef.current.regionCode = el}
              onChange={onRegionChange}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <Select
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              require
              label={msg.province}
              ref={el => inputAddressRef.current.provinceCode = el}
              defaultValue={defaultProvince && defaultProvince.provinceCode ? defaultProvince.provinceCode : ""}
              options={filterDataForSelectProvince()}
              onChange={onProvinceChange}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />

          </div>
          <div className="col-6">
            <Select
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              require
              label={msg.district}
              defaultValue={defaultDistrict && defaultDistrict.districtCode ? defaultDistrict.districtCode : ""}
              ref={el => inputAddressRef.current.districtCode = el}
              options={filterDataForSelectDistrict()}
              onChange={onDistrictChange}
              disabled={(isCustomerPage || isOtherProspectPage) || editGeneralDataFlag || districtDisabled ? true : false}
            />

          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <Select
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              require
              label={msg.subDistrict}
              defaultValue={defaultSubDistrict && defaultSubDistrict.subdistrictCode ? defaultSubDistrict.subdistrictCode : ""}
              ref={el => inputAddressRef.current.subdistrictCode = el}
              options={filterDataForSelectSubDistrict()}
              disabled={(isCustomerPage || isOtherProspectPage) || editGeneralDataFlag || subDistrictDisabled ? true : false}
            />

          </div>
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              allowChar="NUM"
              maxLength={5}
              label={msg.postCode}
              ref={el => inputAddressRef.current.postCode = el}
              defaultValue={initData && initData.postCode ? initData.postCode : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <TextField
              isTextArea
              fixSize
              preventEnter
              maxLength={150}
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              label={msg.remark}
              ref={el => inputAddressRef.current.remark = el}
              defaultValue={initData && initData.addressRemark ? initData.addressRemark : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
        </div>
      </div>
      <div className="bg-gray py-2 mt-4"></div>
      <div className="container pt-4">
        <div className="py-4">
          <div className="row">
            <span className="h2 padding-row mb-0">{msg.contactInfo}</span>
          </div>
          <div className="row">
            <span className="primaryLabel padding-row">{msg.newAccount}</span>
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              label={msg.name}
              ref={el => inputContactInfoRef.current.firstName = el}
              defaultValue={initData && initData.firstName ? initData.firstName : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              label={msg.lastName}
              ref={el => inputContactInfoRef.current.lastName = el}
              defaultValue={initData && initData.lastName ? initData.lastName : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              allowChar="NUM ENG THAI"
              maxLength={100}
              label={msg.telNo}
              ref={el => inputContactInfoRef.current.phoneNo = el}
              defaultValue={initData && initData.phoneNo ? initData.phoneNo : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              label={msg.faxNo}
              allowChar="NUM"
              maxLength={10}
              ref={el => inputContactInfoRef.current.faxNo = el}
              defaultValue={initData && initData.contactFaxNo ? initData.contactFaxNo : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              allowChar="NUM"
              maxLength={10}
              label={msg.mobileNo}
              ref={el => inputContactInfoRef.current.mobileNo = el}
              defaultValue={initData && initData.mobileNo ? initData.mobileNo : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? "-" : null}
              type="email"
              label={msg.email}
              ref={el => inputContactInfoRef.current.email = el}
              defaultValue={initData && initData.email ? initData.email : ""}
              disabled={isCustomerPage || isOtherProspectPage || editGeneralDataFlag ? true : false}
            />
          </div>
        </div>
        {isProspectPage || isRentstationPage || isCustomerPage ?
          <div>
            {(isProspectPage || isRentstationPage) && !pathValue.isRecomentBu ?
              <div>
                {isProspectPage && !pathValue.isTerritory ?
                  <div className="col-12 row justify-content-center mt-4">
                    <div className="col-4 col-md-3 col-xl-2 px-4">
                      <Button
                        type="delNew"
                        onClick={delFunctiion}
                      />
                    </div>
                    <div className="col-4 col-md-3 col-xl-2 px-4">
                      <Button
                        type="cancle"
                        onClick={handleCancel}
                      />
                    </div>
                    <div className="col-4 col-md-3 col-xl-2 px-4">
                      <Button
                        type="save"
                        onClick={saveFunctiion}
                      />
                    </div>
                  </div>
                  :
                  <div className="row mt-4">
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
              :
              <div>
                {isCustomerPage && initData && initData.custCode ?
                  <div className="row mt-4">
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
                  :
                  null
                }
              </div>
            }
          </div>
          :
          <div>
            {!isOtherProspectPage ?
              <div className="row mt-4">
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

              </div> : null}
          </div>
        }
      </div>
    </div>
  )
}

export default Main