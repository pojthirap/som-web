import { useState, useRef, useEffect } from 'react';
import { getInputData, formatObjForSelect } from '@helper';
import { useDispatch } from 'react-redux'
import TextField from '@components/TextField';
import Select from '@components/Select';
import Button from '@components/Button';
import AccountTagHistory from 'pages/account/components/AccountTagHistory'
import PermissionChecker from '@components/PermissionChecker';
import VatNumber from './components/VatNumber';
import * as apiPath from '@apiPath'
import * as msg from '@msg'
import { useDropzone } from 'react-dropzone';
import Modal from "@components/Modal";
export default function CreateProspect({ callAPI, redirect, customAlert }) {
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
    const [showModal, setShowModal] = useState(false);
    const [showModalSuccess, setShowModalSuccess] = useState(false);
    const [disableUpload, setDisableUpload] = useState(true);
    const [file, setFile] = useState();
    const [resFileUpload, setResFileUpload] = useState();
    const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
        // Disable click and keydown behavior
        accept: 'application/vnd.ms-excel , application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        noClick: true,
        noKeyboard: true
    });

    useEffect(() => {
        if (file) {
            setDisableUpload(false)
        }
    }, [file])

    useEffect(() => {
        setFile(acceptedFiles[0])
    }, [acceptedFiles])

    useEffect(() => {
        getProvinceData();
        getBrandData();
    }, [])


    function validateLatLng(lat, lng) {
        return (lat && isFinite(lat) && Math.abs(lat) <= 90) && (lng && isFinite(lng) && Math.abs(lng) <= 180);
    }
    const saveFunctiion = async () => {
        let inputProspectInfoData = getInputData(inputProspectInfoRef, "NE");
        let inputAddressRefData = getInputData(inputAddressRef, "NE");
        let inputContactInfoData = getInputData(inputContactInfoRef, "NE");


        if (inputAddressRefData.data.latitude && inputAddressRefData.data.longitude) {
            if (!validateLatLng(inputAddressRefData.data.latitude, inputAddressRefData.data.longitude)) return customAlert(msg.latOrLongWorng)
        } else if (inputAddressRefData.data.latitude || inputAddressRefData.data.longitude) {
            return customAlert(msg.enterBothLatAndLong)
        }
        if (!inputProspectInfoData.isInvalid && !inputAddressRefData.isInvalid && !inputContactInfoData.isInvalid) {
            inputProspectInfoData.data.accGroupRef = inputProspectInfoData.data.accGroupRef ? inputProspectInfoData.data.accGroupRef : inputProspectInfoData.data.identifyId
            const jsonRequest = {
                prospectAccountModel: inputProspectInfoData.data,
                prospectAddressModel: inputAddressRefData.data,
                prospectContactModel: inputContactInfoData.data,
            }
            const jsonResponse = await callAPI(apiPath.createProspect, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                customAlert(msg.saveSuccess)
                back();

            }
        }
    }

    const back = () => {
        dispatch(redirect("/account/prospect"))
    }

    const getBrandData = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 2,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                activeFlag: "Y"
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
                activeFlag: "Y"
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
                provinceCode: code,
                activeFlag: "Y"
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
                districtCode: code,
                activeFlag: "Y"
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
        if (code) {
            if (code != currentProvince) {
                setCurrentProvince(code);
                getDistrictData(code);
            }
        } else {
            setCurrentProvince(null)
            setDistrictData([])
            setDistrictDisabled(true);
            setCurrentDistrict(null)
            setSubDistrictData([]);
            setSubDistrictDisabled(true);
            inputAddressRef.current.districtCode.clearValue();
            inputAddressRef.current.districtCode.clearValidate();
            inputAddressRef.current.subdistrictCode.clearValue();
            inputAddressRef.current.subdistrictCode.clearValidate();
        }
    }

    const onDistrictChange = (code) => {
        if (code) {
            if (code && code != currentDistrict) {
                setCurrentDistrict(code)
                getSubDistrictData(code);
            }
        } else {
            setCurrentDistrict(null)
            setSubDistrictData([]);
            setSubDistrictDisabled(true);
            inputAddressRef.current.subdistrictCode.clearValue();
            inputAddressRef.current.subdistrictCode.clearValidate();
        }
    }

    const importFunction = () => {
        setShowModal(true)
    }

    const closeModal = () => {
        setFile(null)
        setShowModal(false)
        setDisableUpload(true)
    }

    const closeModalDetail = () => {
        setShowModalSuccess(false)
        setFile(null)
        setShowModal(false)
        setDisableUpload(true)
    }

    const uploadFile = async () => {
        let formData = new FormData()
        formData.append("ImageFile", file)
        const jsonResponse = await callAPI(apiPath.importProspect, formData)
        if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
            setResFileUpload(jsonResponse && jsonResponse.data ? jsonResponse.data.records[0] : null)
            setShowModalSuccess(true)
        }
    }
    return (
        <div>
            <AccountTagHistory />
            <div className="container pt-4">
                <div className="row d-flex justify-content-between">
                    <span className="h1 padding-row">{msg.create}</span>
                    <PermissionChecker permCode="FE_ACC_PROSP_S011_UPLOAD">
                        <div className="padding-row">
                            <Button type="add" customLabel={msg.uploadFile} onClick={() => importFunction()} />
                        </div>
                    </PermissionChecker>
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
                        {/* <TextField
                            allowChar="NUM"
                            maxLength={13}
                            label={msg.taxNumberOrIDCard}
                            ref={el => inputProspectInfoRef.current.identifyId = el}
                        /> */}
                        <VatNumber
                            ref={el => inputProspectInfoRef.current.identifyId = el}
                        />
                    </div>
                    <div className="col-6">
                        <TextField
                            maxLength={20}
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
                            allowChar="num slash"
                            maxLength="50"
                        />
                    </div>
                    <div className="col-6">
                        <TextField
                            label={msg.moo}
                            ref={el => inputAddressRef.current.moo = el}
                            maxLength="50"
                        />
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6">
                        <TextField
                            label={msg.soi}
                            ref={el => inputAddressRef.current.soi = el}
                            maxLength="50"
                        />
                    </div>
                    <div className="col-6">
                        <TextField
                            label={msg.road}
                            ref={el => inputAddressRef.current.street = el}
                            maxLength="50"
                        />
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6">
                        <TextField
                            label={msg.telNo}
                            ref={el => inputAddressRef.current.tellNo = el}
                            allowChar="NUM ENG THAI"
                            maxLength="20"
                        />
                    </div>
                    <div className="col-6">
                        <TextField
                            label={msg.faxNo}
                            ref={el => inputAddressRef.current.faxNo = el}
                            allowChar="num"
                            maxLength="10"
                        />
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6 row px-0">
                        <div className="col-6">
                            <TextField
                                label={msg.latitude}
                                ref={el => inputAddressRef.current.latitude = el}
                                allowChar="num dot dat"
                                maxLength="50"
                            />
                        </div>
                        <div className="col-6">
                            <TextField
                                label={msg.longitude}
                                ref={el => inputAddressRef.current.longitude = el}
                                allowChar="num dot dat"
                                maxLength="50"
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
                            allowChar="num"
                            maxLength="5"
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
                            allowChar="NUM ENG THAI"
                            maxLength={100}
                            label={msg.telNo}
                            ref={el => inputContactInfoRef.current.phoneNo = el}
                        />
                    </div>
                    <div className="col-6">
                        <TextField
                            label={msg.faxNo}
                            ref={el => inputContactInfoRef.current.faxNo = el}
                            allowChar="num"
                            maxLength="10"
                        />
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6">
                        <TextField
                            label={msg.mobileNo}
                            ref={el => inputContactInfoRef.current.mobileNo = el}
                            allowChar="num"
                            maxLength="10"
                        />
                    </div>
                    <div className="col-6">
                        <TextField
                            type="email"
                            label={msg.email}
                            ref={el => inputContactInfoRef.current.email = el}
                        />
                    </div>
                </div>
                <div className="row mt-4">
                    <div className="col-6 d-flex justify-content-end">
                        <div className="col-5 p-0">
                            <Button
                                type="cancle"
                                onClick={back}
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
            </div>
            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => uploadFile()}
                title={msg.uploadFile}
                disableBtn
                disableBtnCancel
            >
                {file ?
                    <div className="labelRow">
                        <div className="col-12 d-flex justify-content-center">File : {file.name}</div>
                    </div>
                    : null}
                <div className="row">
                    <div className="col-6">
                        <div {...getRootProps({ className: 'dropzone' })}>
                            <input {...getInputProps()} />
                            <Button type="primary" customLabel="Browse" onClick={open} />
                        </div>
                    </div>
                    <div className="col-6">
                        <Button type="primary" customLabel="Upload" disabled={disableUpload} onClick={() => uploadFile()} />
                    </div>
                </div>
            </Modal>
            <Modal
                isShow={showModalSuccess}
                onClose={() => closeModalDetail()}
                title={msg.uploadFile}
                disableBtn
                customLable={msg.close}
            >
                {resFileUpload ?
                    <div className="labelRow col-12">

                        <div>Total Record : {resFileUpload.totalRecord}</div>
                        <div>Success : {resFileUpload.totalSuccess}</div>
                        <div>Fail : {resFileUpload.totalFailed}</div>
                        <div>File Path : <a style={{ wordBreak: "break-all" }} href={process.env.apiPath + resFileUpload.pathFileError} download> {resFileUpload.pathFileError ? resFileUpload.pathFileError : "-"}</a> </div>
                    </div>
                    : null}
            </Modal>
        </div>

    )
}