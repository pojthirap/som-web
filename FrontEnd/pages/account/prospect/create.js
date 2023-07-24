import { useState, useRef, useEffect } from 'react';
import { getInputData, formatObjForSelect } from '@helper';
import { useDispatch } from 'react-redux'
import TextField from '@components/TextField';
import Select from '@components/Select';
import Button from '@components/Button';
import AccountTagHistory from '@components/AccountTagHistory'
import * as apiPath from '@apiPath'
import * as msg from '@msg'

export default function TemplateForSAEditPage({ callAPI, redirect, customAlert }) {
    const dispatch = useDispatch();
    const inputProspectInfoRef = useRef({});
    const inputAddressRef = useRef({});
    const inputContactInfoRef = useRef({});
    const [currentProvince, setCurrentProvince] = useState(null);
    const [currentDistrict, setCurrentDistrict] = useState(null);
    const [provinceData, setProvinceData] = useState([]);
    const [districtData, setDistrictData] = useState([]);
    const [subDistrictData, setSubDistrictData] = useState([]);
    const [brandData, setBrandData] = useState([]);
    const [districtDisabled, setDistrictDisabled] = useState(true);
    const [subDistrictDisabled, setSubDistrictDisabled] = useState(true);

    useEffect(() => {
        getProvinceData();
        getBrandData();
    }, [])

    const saveFunctiion = async () => {
        let inputProspectInfoData = getInputData(inputProspectInfoRef, "NE");
        let inputAddressRefData = getInputData(inputAddressRef, "NE");
        let inputContactInfoData = getInputData(inputContactInfoRef, "NE");
        if (!inputProspectInfoData.isInvalid && !inputAddressRefData.isInvalid && !inputContactInfoData.isInvalid) {

            const jsonRequest = {
                prospectAccountModel: inputProspectInfoData.data,
                prospectAddressModel: inputAddressRefData.data,
                prospectContactModel: inputContactInfoData.data,
            }
            const jsonResponse = await callAPI(apiPath.createProspect, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                customAlert(msg.addSuccess)
                back();

            }
        }
    }

    const back = () => {
        dispatch(redirect("/account/prospect/main"))
    }

    const getBrandData = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.searchBrand, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setBrandData(formatObjForSelect((jsonResponse.data.records ? jsonResponse.data.records : null), "brandId", "brandNameTh"));
        }
    }

    const getProvinceData = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.searchProvince, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setProvinceData(formatObjForSelect((jsonResponse.data.records ? jsonResponse.data.records : null), "provinceCode", "provinceNameTh"));
        }
    }

    const getDistrictData = async (code) => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                provinceCode: code
            }
        }
        const jsonResponse = await callAPI(apiPath.searchDistrict, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            setDistrictData(formatObjForSelect((jsonResponse.data.records ? jsonResponse.data.records : null), "districtCode", "districtNameTh"));
            setDistrictDisabled(false);
            setCurrentDistrict(null)
            setSubDistrictData([]);
            setSubDistrictDisabled(true);
        }
    }

    const getSubDistrictData = async (code) => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                districtCode: code
            }
        }
        const jsonResponse = await callAPI(apiPath.searchSubDistrict, jsonRequest);
        if (jsonResponse && jsonResponse.data) {
            const formatData = formatObjForSelect((jsonResponse.data.records ? jsonResponse.data.records : null), "subdistrictCode", "subdistrictNameTh");
            setSubDistrictData(formatData);
            setSubDistrictDisabled(false);
        }
    }

    const onProvinceChange = (code) => {
        if (code && code != currentProvince) {
            setCurrentProvince(code);
            getDistrictData(code);
        }
    }

    const onDistrictChange = (code) => {
        if (code && code != currentDistrict) {
            setCurrentDistrict(code)
            getSubDistrictData(code);
        }
    }

    return (
        <div>
            <AccountTagHistory />
            <div className="container pt-4">
                <div className="row d-flex justify-content-between">
                    <span className="h1 padding-row">{msg.create}</span>
                    <div className="padding-row">
                        <Button type="add" customLabel={msg.uploadFile} />
                    </div>
                </div>
            </div>
            <div className="container pt-4">
                <div className="pb-4">
                    <div className="row">
                        <span className="h2 padding-row mb-0">{msg.prospectInfo}</span>
                    </div>
                    <div className="row">
                        <span className="primaryLabel padding-row">{msg.newAccount}</span>
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <TextField
                            label={msg.name}
                            ref={el => inputProspectInfoRef.current.accName = el}
                            require
                        />
                    </div>
                    <div className="col-6">
                        <Select
                            label={msg.brand}
                            ref={el => inputProspectInfoRef.current.brandId = el}
                            options={brandData}
                        />
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6">
                        <TextField
                            label={msg.taxNumberOrIDCard}
                            ref={el => inputProspectInfoRef.current.identifyId = el}
                        />
                    </div>
                    <div className="col-6">
                        <TextField
                            label={msg.prospectGroupRef}
                            ref={el => inputProspectInfoRef.current.accGroupRef = el}
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
                            label={msg.addressNo}
                            ref={el => inputAddressRef.current.addrNo = el}
                        />
                    </div>
                    <div className="col-6">
                        <TextField
                            label={msg.moo}
                            ref={el => inputAddressRef.current.moo = el}
                        />
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6">
                        <TextField
                            label={msg.soi}
                            ref={el => inputAddressRef.current.soi = el}
                        />
                    </div>
                    <div className="col-6">
                        <TextField
                            label={msg.road}
                            ref={el => inputAddressRef.current.street = el}
                        />
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6">
                        <TextField
                            label={msg.telNo}
                            ref={el => inputAddressRef.current.tellNo = el}
                        />
                    </div>
                    <div className="col-6">
                        <TextField
                            label={msg.faxNo}
                            ref={el => inputAddressRef.current.faxNo = el}
                        />
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6 row px-0">
                        <div className="col-6">
                            <TextField
                                label={msg.latitude}
                                ref={el => inputAddressRef.current.latitude = el}
                            />
                        </div>
                        <div className="col-6">
                            <TextField
                                label={msg.longitude}
                                ref={el => inputAddressRef.current.longitude = el}
                            />
                        </div>
                    </div>
                    <div className="col-6">
                        <Select
                            label={msg.province}
                            ref={el => inputAddressRef.current.provinceCode = el}
                            require
                            options={provinceData}
                            onChange={onProvinceChange}
                        />
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6">
                        <Select
                            label={msg.district}
                            ref={el => inputAddressRef.current.districtCode = el}
                            require
                            options={districtData}
                            onChange={onDistrictChange}
                            disabled={districtDisabled}

                        />
                    </div>
                    <div className="col-6">
                        <Select
                            label={msg.subDistrict}
                            ref={el => inputAddressRef.current.subdistrictCode = el}
                            require
                            options={subDistrictData}
                            disabled={subDistrictDisabled}
                        />
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6">
                        <TextField
                            label={msg.postCode}
                            ref={el => inputAddressRef.current.postCode = el}
                        />
                    </div>
                    <div className="col-6">
                        <TextField
                            label={msg.remark}
                            ref={el => inputAddressRef.current.remark = el}
                        />
                    </div>
                </div>
            </div>
            <div className="bg-gray py-2 mt-4"></div>

            <div className="container pt-4 pb-5">
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
                            label={msg.name}
                            ref={el => inputContactInfoRef.current.firstName = el}
                        />
                    </div>
                    <div className="col-6">
                        <TextField
                            label={msg.lastName}
                            ref={el => inputContactInfoRef.current.lastName = el}
                        />
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6">
                        <TextField
                            label={msg.telNo}
                            ref={el => inputContactInfoRef.current.phoneNo = el}
                        />
                    </div>
                    <div className="col-6">
                        <TextField
                            label={msg.faxNo}
                            ref={el => inputContactInfoRef.current.faxNo = el}
                        />
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6">
                        <TextField
                            label={msg.mobileNo}
                            ref={el => inputContactInfoRef.current.mobileNo = el}
                        />
                    </div>
                    <div className="col-6">
                        <TextField
                            label={msg.email}
                            ref={el => inputContactInfoRef.current.email = el}
                        />
                    </div>
                </div>
                <div className="row mt-4">
                    <div className="col-6 d-flex justify-content-end">
                        <div className="col-5 p-0">
                            <Button
                                type="save"
                                onClick={saveFunctiion}
                            />
                        </div>
                    </div>
                    <div className="col-6 d-flex justify-content-start">
                        <div className="col-5 p-0">
                            <Button
                                type="cancle"
                                onClick={back}
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}