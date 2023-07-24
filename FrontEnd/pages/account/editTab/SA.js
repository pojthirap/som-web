import { useState, useEffect, useRef } from 'react';
import Button from '@components/Button';
import Select from '@components/Select';
import Switch from '@components/Switch';
import TextField from '@components/TextField';
import DatePicker from '@components/DatePicker';
import MultiSelect from '@components/MultiSelect';
import { useDispatch } from 'react-redux'
import * as apiPath from '@apiPath'
import * as msg from '@msg'
import { getInputData, formatObjForSelect, toString } from '@helper';
export default function Main({ callAPI, redirect, customAlert, pathValue }) {
  const dispatch = useDispatch();
  const [initData, setInitData] = useState();
  const [accountStatus, setAccountStatus] = useState();           // สถานะบัญชี
  const [locType, setLocType] = useState();                       // ประเภท Site
  const [serviceType, setServiceType] = useState();               // Service
  const [brand, setBrand] = useState();                           // แบรนด์
  const [brandCate, setBrandCate] = useState();                   // Type ของผลิตภัณฑ์
  const [gasStationStatus, setGasStationStatus] = useState();     // สถานะปั้มน้ำมัน
  const [licenseStatus, setLicenseStatus] = useState();           // สถานะใบอนุญาติ
  const [attentionCust, setAttentionCust] = useState();           // ความสนใจลูกค้า
  const [region, setRegion] = useState();                         // ภูมิภาค
  const [province, setProvince] = useState();                     // จังหวัด
  const [district, setDistrict] = useState();                     // อำเภอ
  const [subDistrict, setSubDistrict] = useState();               // ตำบล
  const inputRef = useRef({});
  const inputAccRef = useRef({});
  const inputAddrRef = useRef({});
  const inputContRef = useRef({});
  const isProspectPage = pathValue.type == "0";
  const isCustomerPage = pathValue.type == "2";
  const isRentstationPage = pathValue.type == "1";
  const isOtherProspectPage = pathValue.type == "3" || pathValue.isRecomentBu;
  const [dateValue, setDateValue] = useState();

  useEffect(() => {
    searchProspectSaTab();
    getAccountStatus();     // สถานะบัญชี
    getLocType()            // ประเภท Site
    getServiceType();       // Service
    getBrand()              // แบรนด์
    getBrandCate()          // Type ของผลิตภัณฑ์
    getGasStationStatus()   // สถานะปั้มน้ำมัน
    getLicenseStatus()      // สถานะใบอนุญาติ
    getAttentionCust()      // ความสนใจลูกค้า
    getRegion();            // ภูมิภาค
    getProvince();          // จังหวัด
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
      if (jsonResponse.data.records[0]) {
        setInitData(jsonResponse.data.records[0]);
        getDistrict(jsonResponse.data.records[0].provinceCode);          // อำเภอ
        getSubDistrict(jsonResponse.data.records[0].districtCode);       // ตำบล
      }
    }
  }
  const getAccountStatus = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 1,
      model: {
        lovKeyword: "PROSPECT_STATUS"
      }
    }
    const jsonResponse = await callAPI(apiPath.getConfigLov, jsonRequest);
    if (jsonResponse && jsonResponse.data) {
      setAccountStatus(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
    }
  }
  const getLocType = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 1,
      model: { activeFlag: "Y" }
    }
    const jsonResponse = await callAPI(apiPath.searchLocType, jsonRequest);
    if (jsonResponse && jsonResponse.data) {
      setLocType(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
    }
  }
  const getServiceType = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 1,
      model: { activeFlag: "Y" }
    }
    const jsonResponse = await callAPI(apiPath.searchServiceType, jsonRequest);
    if (jsonResponse && jsonResponse.data) {
      setServiceType(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
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
  const getBrandCate = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 1,
      model: { activeFlag: "Y" }
    }
    const jsonResponse = await callAPI(apiPath.searchBrandCate, jsonRequest);
    if (jsonResponse && jsonResponse.data) {
      setBrandCate(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
    }
  }
  const getGasStationStatus = async () => {
    const headerTabel = [{ title: "เปิดบริการ", key: "Y" }, { title: "ไม่เปิดบริการ", key: "N" }]
    setGasStationStatus(headerTabel);
  }
  const getLicenseStatus = async () => {
    const headerTabel = [{ title: "มี", key: "Y" }, { title: "ไม่มี", key: "N" }, { title: "อื่นๆ", key: "O", }]
    setLicenseStatus(headerTabel);
  }
  const getAttentionCust = async () => {
    const headerTabel = [{ title: "สนใจเช่า", key: "R" }, { title: "สนใจขาย", key: "S" }, { title: "อื่นๆ", key: "O" }]
    setAttentionCust(headerTabel);
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
  const getProvince = async () => {
    const jsonRequest = {
      searchOption: 0,
      searchOrder: 0,
      startRecord: 0,
      length: 0,
      pageNo: 1,
      model: { activeFlag: "Y" }
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
  const filterDataForSelectAccountStatus = () => {
    let account = []
    if (!(accountStatus && accountStatus.records)) return [];
    accountStatus.records.forEach((data) => {
      account.push({ value: toString(data.lovKeyvalue == 0 ? "0" : data.lovKeyvalue), label: data.lovNameTh })
    });
    return account;
  }
  const filterDataForSelectLocType = () => {
    if (!(locType && locType.records)) return [];
    return formatObjForSelect(locType.records, "locTypeId", "locTypeNameTh");
  }
  const filterDataForSelectServiceType = () => {
    if (!(serviceType && serviceType.records)) return [];
    return formatObjForSelect(serviceType.records, "serviceTypeId", "serviceNameTh");
  }
  const filterDataForSelectBrand = () => {
    if (!(brand && brand.records)) return [];
    return formatObjForSelect(brand.records, "brandId", "brandNameTh");
  }
  const filterDataForSelectBrandCate = () => {
    if (!(brandCate && brandCate.records)) return [];
    return formatObjForSelect(brandCate.records, "brandCateId", "brandCateNameTh");
  }
  const filterDataForSelectGasStationStatus = () => {
    if (!(gasStationStatus)) return [];
    return formatObjForSelect(gasStationStatus, "key", "title");
  }
  const filterDataForSelectLicenseStatus = () => {
    if (!(licenseStatus)) return [];
    return formatObjForSelect(licenseStatus, "key", "title");
  }
  const filterDataForSelectAttentionCust = () => {
    if (!(attentionCust)) return [];
    return formatObjForSelect(attentionCust, "key", "title");
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
  const saveFunctiion = async () => {
    let inputProspectData = getInputData(inputRef, "C");
    let inputProspectAccountData = getInputData(inputAccRef, "C");
    let inputProspectAddressData = getInputData(inputAddrRef, "C");
    let inputProspectContacData = getInputData(inputContRef, "C");
    if (!inputProspectData.isInvalid && !inputProspectAccountData.isInvalid) {
      inputProspectData.data.prospectId = toString(initData.prospectId)
      inputProspectAccountData.data.prospAccId = toString(initData.prospAccId)
      inputProspectAccountData.data.identifyId = toString(initData.identifyId)
      inputProspectAccountData.data.accGroupRef = toString(initData.accGroupRef)
      inputProspectAccountData.data.custCode = toString(initData.custCode)
      inputProspectAccountData.data.sourceType = toString(initData.sourceType)
      inputProspectAddressData.data.prospAddrId = toString(initData.prospAddrId)
      inputProspectContacData.data.prospContactId = toString(initData.prospContactId)

      if (isCustomerPage) {
        inputProspectData.data.prospectType = "2"
      }
      else {
        inputProspectData.data.prospectType = inputProspectData.data.prospectType ? "1" : "0"
      }
      inputProspectAccountData.data.accName = (initData.accName)

      let changeField = []
      if (inputProspectData.changeField) changeField.push(inputProspectData.changeField)
      if (inputProspectAccountData.changeField) changeField.push(inputProspectAccountData.changeField)
      if (inputProspectAddressData.changeField) changeField.push(inputProspectAddressData.changeField)
      if (inputProspectContacData.changeField) changeField.push(inputProspectContacData.changeField)
      inputProspectData.data.changeField = changeField.join(", ")

      let jsonRequest = {
        prospectModel: inputProspectData.data,
        prospectAccountModel: inputProspectAccountData.data,
        prospectAddressModel: inputProspectAddressData.data,
        prospectContactModel: inputProspectContacData.data
      }
      const jsonResponse = await callAPI(apiPath.updProspectSaTab, jsonRequest)
      if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
        customAlert(msg.addSuccess)
        if (isProspectPage && inputProspectData.data.prospectType == "1") {
          dispatch(redirect("/account/prospect"))
        }
        else if (isRentstationPage && inputProspectData.data.prospectType == "0") {
          dispatch(redirect("/account/rentstation"))
        }
        else {
          searchProspectSaTab();
        }
      }
    }
  }

  return (
    <div>
      <div className="container pt-4">
        <div className="row d-flex justify-content-between">
          <span className="h1 padding-row">{pathValue.data.prospectAccount.accName}</span>
          <div className="col-6">
            <TextField
              disabled
              label={msg.salesRep}
              defaultValue={initData && initData.saleRepId ? initData.saleRepId : "-"}
            />
          </div>
        </div>
      </div>
      <div className="container pt-4">
        <div className="pb-4">
          <div className="row d-flex justify-content-between">
            <span className="h2 padding-row mb-0 d-flex align-items-center">{(isCustomerPage ? msg.customerData : "") + (isRentstationPage ? msg.pumpData : "") + (isOtherProspectPage || isProspectPage ? msg.prospectData : "")}</span>
            {!isCustomerPage ?
              <div className="padding-row">
                <Switch
                  disabled={isOtherProspectPage ? true : false}
                  label="เป็นปั๊มเช่า"
                  // label={msg.customer}
                  defaultValue={initData && initData.prospectType && initData.prospectType == "1" ? true : false}
                  ref={el => inputRef.current.prospectType = el}
                />
              </div>
              : null}
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <Select
              require
              placeholder={isRentstationPage || isOtherProspectPage ? "-" : null}
              label={msg.accountStatus} // สถานะบัญชี
              options={filterDataForSelectAccountStatus()}
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.prospectStatus ? initData.prospectStatus : ""}
              ref={el => inputRef.current.prospectStatus = el}
            />
          </div>
          <div className="col-6">
            <Select
              require
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.siteType} // ประเภท Site
              options={filterDataForSelectLocType()}
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.locTypeId ? toString(initData.locTypeId) : ""}
              ref={el => inputRef.current.locTypeId = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <div className="setDropdownlist">
              <MultiSelect
                isNotValue={isOtherProspectPage}
                label={msg.service} // Service
                options={filterDataForSelectServiceType()}
                disabled={isOtherProspectPage ? false : true}
                defaultValue={initData && initData.servicesTypeId ? toString(initData.servicesTypeId).split(",") : ""}
                ref={el => inputRef.current.servicesTypeId = el}
              />
            </div>
          </div>
          <div className="col-6">
            <Select
              require
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.brand} // แบรนด์
              options={filterDataForSelectBrand()}
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.brandId ? toString(initData.brandId) : ""}
              ref={el => inputAccRef.current.brandId = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.stationName} // ชื่อสถานี
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.stationName ? initData.stationName : ""}
              ref={el => inputRef.current.stationName = el}
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.reasonForCancel} // เหตุผลการยกเลิก
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.reasonCancel ? initData.reasonCancel : ""}
              ref={el => inputRef.current.reasonCancel = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <Select
              require
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.gasStationStatus} // สถานะปั้มน้ำมัน
              options={filterDataForSelectGasStationStatus()}
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.stationOpenFlag ? initData.stationOpenFlag : ""}
              ref={el => inputRef.current.stationOpenFlag = el}
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.shopInStation} // ร้านค้าเช่าภายในสถานีเช่า
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.shopJoint ? initData.shopJoint : ""}
              ref={el => inputRef.current.shopJoint = el}
            />

          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <Select
              require
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.typeProduct} // Type ของผลิตภัณฑ์
              options={filterDataForSelectBrandCate()}
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.brandCateId ? toString(initData.brandCateId) : ""}
              ref={el => inputRef.current.brandCateId = el}
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.typeProductOther} // Type ของผลิตภัณฑ์(other)
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.brandCateOther ? initData.brandCateOther : ""}
              ref={el => inputRef.current.brandCateOther = el}
            />

          </div>
        </div>
        <div className="row mt-3">
          <div className="col-3">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              require
              allowChar="NUM"
              maxLength={6}
              label={msg.areaRai} // พื้นที่ (ไร่)
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.areaRai ? toString(initData.areaRai) : ""}
              ref={el => inputRef.current.areaRai = el}
              numberComma
            />
          </div>

          <div className="col-3">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              maxNum={3}
              require
              allowChar="NUM"
              maxLength={1}
              label={msg.areaNgan} // พื้นที่ (งาน)
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.areaNgan ? toString(initData.areaNgan) : ""}
              ref={el => inputRef.current.areaNgan = el}
            />
          </div>
          <div className="col-3">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              minNum={0}
              require
              allowChar="NUM"
              maxLength={2}
              label={msg.areaSquareWah} // พื้นที่ (ตารางวา)
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.areaSquareWa ? toString(initData.areaSquareWa) : ""}
              ref={el => inputRef.current.areaSquareWa = el}
            />

          </div>
          <div className="col-3">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              allowChar="NUM"
              maxLength={6}
              label={msg.widthMeters} // หน้ากว้าง(เมตร)
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.areaWidthMeter ? toString(initData.areaWidthMeter) : ""}
              ref={el => inputRef.current.areaWidthMeter = el}
              numberComma
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <Select
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.statusLicense} // สถานะใบอนุญาติ
              options={filterDataForSelectLicenseStatus()}
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.licenseStatus ? initData.licenseStatus : ""}
              ref={el => inputRef.current.licenseStatus = el}
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.statusLicenseOther} // สถานะใบอนุญาติ(กรณีอื่นๆ)
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.licenseOther ? initData.licenseOther : ""}
              ref={el => inputRef.current.licenseOther = el}
            />

          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <Select
              require
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.attentionCust} // ความสนใจลูกค้า
              options={filterDataForSelectAttentionCust()}
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.interestStatus ? initData.interestStatus : ""}
              ref={el => inputRef.current.interestStatus = el}
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.attentionCustOther} // ความสนใจลูกค้า(กรณีอื่นๆ)
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.interestOther ? initData.interestOther : ""}
              ref={el => inputRef.current.interestOther = el}
            />

          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              allowChar="NUM"
              maxLength={13}
              label={msg.salesMonthly} // ยอดขายต่อเดือน (ลิตร) 3 เดือนล่าสุด SaleVolume
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.saleVolume ? toString(initData.saleVolume) : ""}
              ref={el => inputRef.current.saleVolume = el}
              numberComma
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.dataSalesMonthly} // อ้างอิงยอดขาย 3 เดือนล่าสุด SaleVolumeRef
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.saleVolumeRef ? toString(initData.saleVolumeRef) : ""}
              ref={el => inputRef.current.saleVolumeRef = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <DatePicker
              notClearIsAfter
              onChange={setDateValue}
              isDisableClear={isOtherProspectPage}
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.yearOperation}
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.progressDate ? initData.progressDate : ""}
              ref={el => inputRef.current.progressDate = el}
            />
          </div>
          <div className="col-6">
            <DatePicker
              notClearIsAfter
              minDate={dateValue}
              isDisableClear={isOtherProspectPage}
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.expDateLease}
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.terminateDate ? initData.terminateDate : ""}
              ref={el => inputRef.current.terminateDate = el}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray py-2 mt-4"></div>

      {/* Address */}
      <div className="container pt-4">
        <div className="py-4">
          <div className="row">
            <span className="h2 padding-row mb-0">{msg.address}</span>
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              allowChar="NUM"
              maxLength={10}
              label={msg.deedCode} // เลขที่โฉนด
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.addrTitleDeedNo ? initData.addrTitleDeedNo : ""}
              ref={el => inputRef.current.addrTitleDeedNo = el}
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              allowChar="NUM"
              maxLength={10}
              label={msg.landCode} // เลขที่ดิน
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.addrParcelNo ? initData.addrParcelNo : ""}
              ref={el => inputRef.current.addrParcelNo = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.explore} // หน้าสำรวจ
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.addrTambonNo ? initData.addrTambonNo : ""}
              ref={el => inputRef.current.addrTambonNo = el}
            />
          </div>
          <div className="col-6">
            <TextField
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.deedType} // ประเภทโฉนดที่ดิน
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.addrCertUtilisation ? initData.addrCertUtilisation : ""}
              ref={el => inputRef.current.addrCertUtilisation = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <TextField
              disabled
              label={msg.addressNo}
              placeholder={initData && initData.addrNo ? null : "-"}
              defaultValue={initData && initData.addrNo ? initData.addrNo : ""}
              ref={el => inputAddrRef.current.addrNo = el}
            />
          </div>
          <div className="col-6">
            <TextField
              disabled
              label={msg.moo}
              placeholder={initData && initData.moo ? null : "-"}
              defaultValue={initData && initData.moo ? initData.moo : ""}
              ref={el => inputAddrRef.current.moo = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <TextField
              disabled
              label={msg.soi}
              placeholder={initData && initData.soi ? null : "-"}
              defaultValue={initData && initData.soi ? initData.soi : ""}
              ref={el => inputAddrRef.current.soi = el}
            />
          </div>
          <div className="col-6">
            <TextField
              disabled
              label={msg.road}
              placeholder={initData && initData.street ? null : "-"}
              defaultValue={initData && initData.street ? initData.street : ""}
              ref={el => inputAddrRef.current.street = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <TextField
              disabled
              label={msg.telNo}
              placeholder={initData && initData.tellNo ? null : "-"}
              defaultValue={initData && initData.tellNo ? initData.tellNo : ""}
              ref={el => inputAddrRef.current.tellNo = el}
            />
          </div>
          <div className="col-6">
            <TextField
              disabled
              label={msg.faxNo}
              placeholder={initData && initData.addressFaxNo ? null : "-"}
              defaultValue={initData && initData.addressFaxNo ? initData.addressFaxNo : ""}
              ref={el => inputAddrRef.current.faxNo = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-3">
            <TextField
              disabled
              label={msg.latitude}
              placeholder={initData && initData.latitude ? null : "-"}
              defaultValue={initData && initData.latitude ? initData.latitude : ""}
              ref={el => inputAddrRef.current.latitude = el}
            />
          </div>
          <div className="col-3">
            <TextField
              disabled
              label={msg.longitude}
              placeholder={initData && initData.longitude ? null : "-"}
              defaultValue={initData && initData.longitude ? initData.longitude : ""}
              ref={el => inputAddrRef.current.longitude = el}
            />
          </div>
          <div className="col-6">
            <Select
              placeholder="-"
              disabled
              label={msg.region}
              options={filterDataForSelectRegion()}
              defaultValue={initData && initData.regionCode ? initData.regionCode : ""}
              ref={el => inputAddrRef.current.regionCode = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <Select
              disabled
              placeholder="-"
              label={msg.province}
              options={filterDataForSelectProvince()}
              defaultValue={initData && initData.provinceCode ? initData.provinceCode : ""}
              ref={el => inputAddrRef.current.provinceCode = el}
            />
          </div>
          <div className="col-6">
            <Select
              disabled
              placeholder="-"
              label={msg.district}
              options={filterDataForSelectDistrict()}
              defaultValue={initData && initData.districtCode ? initData.districtCode : ""}
              ref={el => inputAddrRef.current.districtCode = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <Select
              disabled
              placeholder="-"
              label={msg.subDistrict}
              options={filterDataForSelectSubDistrict()}
              defaultValue={initData && initData.subdistrictCode ? initData.subdistrictCode : ""}
              ref={el => inputAddrRef.current.subdistrictCode = el}
            />
          </div>
          <div className="col-6">
            <TextField
              disabled
              label={msg.postCode}
              placeholder={initData && initData.postCode ? null : "-"}
              defaultValue={initData && initData.postCode ? initData.postCode : ""}
              ref={el => inputAddrRef.current.postCode = el}
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
              placeholder={isOtherProspectPage ? "-" : null}
              label={msg.remark} // หมายเหตุ
              disabled={isOtherProspectPage ? true : false}
              defaultValue={initData && initData.addressRemark ? initData.addressRemark : ""}
              ref={el => inputAddrRef.current.remark = el}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray py-2 mt-4"></div>

      {/* Contact Info */}
      <div className="container pt-4 pb-5">
        <div className="py-4">
          <div className="row">
            <span className="h2 padding-row mb-0">{msg.contactInfo}</span>
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <TextField
              disabled
              label={msg.name}
              placeholder={initData && initData.firstName ? null : "-"}
              defaultValue={initData && initData.firstName ? initData.firstName : ""}
              ref={el => inputContRef.current.firstName = el}
            />
          </div>
          <div className="col-6">
            <TextField
              disabled
              label={msg.lastName}
              placeholder={initData && initData.lastName ? null : "-"}
              defaultValue={initData && initData.lastName ? initData.lastName : ""}
              ref={el => inputContRef.current.lastName = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <TextField
              disabled
              label={msg.telNo}
              placeholder={initData && initData.phoneNo ? null : "-"}
              defaultValue={initData && initData.phoneNo ? initData.phoneNo : ""}
              ref={el => inputContRef.current.phoneNo = el}
            />
          </div>
          <div className="col-6">
            <TextField
              disabled
              label={msg.faxNo}
              placeholder={initData && initData.contactFaxNo ? null : "-"}
              defaultValue={initData && initData.contactFaxNo ? initData.contactFaxNo : ""}
              ref={el => inputContRef.current.faxNo = el}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <TextField
              disabled
              label={msg.mobileNo}
              placeholder={initData && initData.mobileNo ? null : "-"}
              defaultValue={initData && initData.mobileNo ? initData.mobileNo : ""}
              ref={el => inputContRef.current.mobileNo = el}
            />
          </div>
          <div className="col-6">
            <TextField
              disabled
              label={msg.email}
              placeholder={initData && initData.email ? null : "-"}
              defaultValue={initData && initData.email ? initData.email : ""}
              ref={el => inputContRef.current.email = el}
            />
          </div>
        </div>
        {isOtherProspectPage ? null :
          <div className="row mt-4">
            <div className="col-12 d-flex justify-content-center">
              <div className="col-3 p-0">
                <Button
                  type="save"
                  onClick={saveFunctiion}
                />
              </div>
            </div>
          </div>}
      </div>
    </div >
  )
}

