import { useState, useEffect } from 'react';
import TextField from '@components/TextField';
import Select from '@components/Select';
import * as apiPath from '@apiPath'
import * as msg from '@msg'
import { formatObjForSelect, toString } from '@helper';
import AddressCarousel from 'pages/account/components/AddressCarousel'
import CheckBox from '@components/Checkbox'
export default function Address({ callAPI, pathValue }) {
    const [addressData, setAddressData] = useState();
    const [filterData, setFilterData] = useState([]);
    const [initData, setInitData] = useState({});
    const [currentSelect, setCurrentSelect] = useState(0);
    const [region, setRegion] = useState();
    const [province, setProvince] = useState();
    const [district, setDistrict] = useState();
    const [subDistrict, setSubDistrict] = useState();
    const isProspectPage = pathValue.type == "0";
    const isCustomerPage = pathValue.type == "2";
    const isRentstationPage = pathValue.type == "1";
    const isOtherProspectPage = pathValue.type == "3" || pathValue.isRecomentBu;
    useEffect(() => {
        searchProspectAddress();
        searchRegion();
        searchProvince();
    }, [])
    useEffect(() => {
        if (filterData && filterData[currentSelect]) {
            setInitData(filterData[currentSelect])
            searchDistrict(filterData[currentSelect].provinceCode);
            searchSubDistrict(filterData[currentSelect].districtCode);
        }
    }, [currentSelect, filterData])
    useEffect(() => {
        filterAddressData()
    }, [addressData])

    const filterAddressData = () => {
        let result = []
        result = addressData
        setFilterData(result)
    }
    const searchProspectAddress = async () => {
        const jsonRequest = {
            searchOption: isCustomerPage ? 1 : 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 0,
            model: {
                prospectId: toString(pathValue.data.prospect.prospectId),
                prosAccId: toString(pathValue.data.prospect.prospAccId)
            }
        }
        if (isCustomerPage) jsonRequest.model.custCode = pathValue.data.prospectAccount.custCode
        const jsonResponse = await callAPI(apiPath.searchProspectAddress, jsonRequest);
        const data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : [];
        setAddressData(data);
    }
    const searchRegion = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await callAPI(apiPath.searchRegion, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setRegion(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
        }
    }
    const searchProvince = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await callAPI(apiPath.searchProvince, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setProvince(jsonResponse && jsonResponse.data ? jsonResponse.data : null);
        }
    }
    const searchDistrict = async (code) => {
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
    const searchSubDistrict = async code => {
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
    const handleOnChangeSelect = (data) => {
        setCurrentSelect(data)
    }
    return (
        <div>
            <div className="bg-gray pt-5">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <span className="h1">{pathValue.data.prospectAccount.accName}</span>
                        </div>
                    </div>
                </div>
                <AddressCarousel pathValue={pathValue} slide={filterData} onChange={(page) => handleOnChangeSelect(page)} />
            </div>
            <div className="py-5">
                <div className="container pt-4">
                    <div className="pb-4">
                        <div className="row">
                            <span className="h2 padding-row mb-0">{msg.details}</span>
                        </div>
                    </div>
                    {isCustomerPage ?
                        <div className="row">
                            <div className="col-2">
                                <CheckBox
                                    disabled
                                    label="Main Address"
                                    defaultValue={initData && initData.mainAddressFlag == "1" ? true : false}
                                />
                            </div>
                            <div className="col-2 d-flex align-items-end">
                                <CheckBox
                                    disabled
                                    label="Ship To"
                                    defaultValue={initData && initData.shiftToFlag == "1" ? true : false}
                                />
                            </div>
                            <div className="col-2 d-flex align-items-end">
                                <CheckBox
                                    disabled
                                    label="Bill To"
                                    defaultValue={initData && initData.billToFlag == "1" ? true : false}
                                />
                            </div>
                        </div> : null}
                    <div className={isCustomerPage ? "row mt-3" : "row"}>
                        <div className="col-6">
                            <TextField
                                disabled
                                label={msg.addressNo}
                                defaultValue={initData && initData.addrNo ? initData.addrNo : "-"}
                            />
                        </div>
                        <div className="col-6">
                            <TextField
                                disabled
                                label={msg.moo}
                                defaultValue={initData && initData.moo ? initData.moo : "-"}
                            />
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-6">
                            <TextField
                                disabled
                                label={msg.soi}
                                defaultValue={initData && initData.soi ? initData.soi : "-"}
                            />
                        </div>
                        <div className="col-6">
                            <TextField
                                disabled
                                label={msg.road}
                                defaultValue={initData && initData.street ? initData.street : "-"}
                            />
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-6">
                            <TextField
                                disabled
                                label={msg.telNo}
                                defaultValue={initData && initData.tellNo ? initData.tellNo : "-"}
                            />
                        </div>
                        <div className="col-6">
                            <TextField
                                disabled
                                label={msg.faxNo}
                                defaultValue={initData && initData.faxNo ? initData.faxNo : "-"}
                            />
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-3">
                            <TextField
                                disabled
                                label={msg.latitude}
                                defaultValue={initData && initData.latitude ? initData.latitude : "-"}
                            />
                        </div>
                        <div className="col-3">
                            <TextField
                                disabled
                                label={msg.longitude}
                                defaultValue={initData && initData.longitude ? initData.longitude : "-"}
                            />
                        </div>
                        <div className="col-6">
                            <Select
                                disabled
                                placeholder="-"
                                label={msg.region}
                                options={filterDataForSelectRegion()}
                                defaultValue={initData && initData.regionCode ? initData.regionCode : ""}
                            />
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-6">
                            <Select
                                disabled
                                require
                                placeholder="-"
                                label={msg.province}
                                options={filterDataForSelectProvince()}
                                defaultValue={initData && initData.provinceCode ? initData.provinceCode : ""}
                            />
                        </div>
                        <div className="col-6">
                            <Select
                                disabled
                                require
                                placeholder="-"
                                label={msg.district}
                                options={filterDataForSelectDistrict()}
                                defaultValue={initData && initData.districtCode ? initData.districtCode : ""}
                            />
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-6">
                            <Select
                                disabled
                                require
                                placeholder="-"
                                label={msg.subDistrict}
                                options={filterDataForSelectSubDistrict()}
                                defaultValue={initData && initData.subdistrictCode ? initData.subdistrictCode : ""}
                            />
                        </div>
                        <div className="col-6">
                            <TextField
                                disabled
                                label={msg.postCode}
                                defaultValue={initData && initData.postCode ? initData.postCode : "-"}
                            />
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-6">
                            <TextField
                                disabled
                                label={msg.remark}
                                defaultValue={initData && initData.remark ? initData.remark : "-"}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}