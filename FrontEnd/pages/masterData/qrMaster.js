import { useState, useRef, useEffect } from 'react';
import Modal from "@components/Modal";
import Table from "@components/Table";
import Select from "@components/Select";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData, toString, formatObjForSelect } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
import QRCode from 'react-qr-code';
import Switch from "@components/Switch"
export default function ProductPage({ callAPI, customAlert }) {
    const criteriaRef = useRef({});
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [selectOdj, setSelectOdj] = useState();
    const [data, setData] = useState();
    const [addOrEdit, setAddOrEdit] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [dialogQrCode, setDialogQrCode] = useState(false);
    const [dialogQrCodeMulti, setDialogQrCodeMulti] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [initData, setInitData] = useState(null);
    const [selectCustomer, setSelectCustomer] = useState();
    const [selectGasoline, setSelectGasoline] = useState();
    const headerTabel = [
        {
            title: msg.custCode,
            data: "custCode",
            type: "code",
            width: "10%"
        },
        {
            title: msg.custName,
            data: "custNameTh",
            type: "string",
            width: "15%"
        },
        {
            title: msg.productType,
            data: "gasNameTh",
            type: "string",
            width: "15%"
        },
        {
            title: msg.dispenser,
            data: "dispenserNo",
            type: "code",
            width: "10%"
        },
        {
            title: msg.nozzle,
            data: "nozzleNo",
            type: "code",
            width: "10%"
        },
        {
            title: msg.qrCode,
            data: "qrcode",
            type: "button",
            button: "qr",
            width: "10%",
            genFunction: (item) => genFunction(item),
        },
        {
            title: msg.lastUpdate,
            data: "updateDtm",
            type: "dateTime",
            width: "10%",
        },
        {
            title: msg.tableStatus,
            data: "activeFlagMeter",
            type: "useFlag",
            width: "10%",

        },
        {
            type: "button",
            button: "edit",
            width: "10%",
            editFunction: (item) => editFunction(item),
        }
    ]

    useEffect(() => {
        searchSelectCust();
        searchSelectGas();
    }, [])

    const searchSelectCust = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 1,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: { activeFlag: "Y" }
        }
        const jsonResponseSelectCustomer = await callAPI(apiPath.searchCustomer, jsonRequest);
        setSelectCustomer(jsonResponseSelectCustomer.data ? jsonResponseSelectCustomer.data : null);
    }

    const searchSelectGas = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 2,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: { activeFlag: "Y" }
        }
        const jsonResponseSelectGasoline = await callAPI(apiPath.searchGasoline, jsonRequest);
        setSelectGasoline(jsonResponseSelectGasoline.data ? jsonResponseSelectGasoline.data : null);
    }

    const filterDataForSelectCustomer = () => {
        if (!(selectCustomer && selectCustomer.records)) return [];
        return formatObjForSelect(selectCustomer.records, "custCode", ["custCode", "custNameTh"], " : ");
    }

    const filterDataForSelectGasoline = () => {
        if (!(selectGasoline && selectGasoline.records)) return [];
        return formatObjForSelect(selectGasoline.records, "gasId", "gasNameTh");
    }

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchGasolineByCust(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            const findObj = selectCustomer.records.find(el => el.custCode == inputData.data.custCode)
            setSelectOdj(findObj)
            setInputCriteria(inputData.data);
        }
    }

    const searchGasolineByCust = async (jsonRequest) => {
        if (inputCriteria) {
            jsonRequest.searchOrder = 1
            //inputCriteria.activeFlag = "Y";
            const jsonResponse = await callAPI(apiPath.searchGasolineByCust, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const clear = () => {
        setSelectOdj(null)
        clearInputData(criteriaRef)
        setData(null)
        tableRef.current.clear();
    }

    const editFunction = (item = null) => {
        if (item != null) {
            setInitData(item);

        } else {
            setInitData(null);
        }
        setAddOrEdit(false)
        setShowModal(true);
    }

    const addFunction = () => {
        if (selectOdj != null) {
            setInitData(selectOdj);

        } else {
            setInitData(null);
        }
        setAddOrEdit(true)
        setShowModal(true);
    }

    const genFunction = (item = null) => {
        if (item != null) {
            setInitData(item);

        } else {
            setInitData(null);
        }
        setDialogQrCode(true);
    }

    const showMultiQR = (list) => {
        setInitData(list)
        setDialogQrCodeMulti(true);
    }

    const closeModal = (item) => {
        setInitData(null)
        setShowModal(false);
    }

    const closeDialogQr = () => {
        setInitData(null)
        setDialogQrCode(false);
    }
    const closeDialogQrMulti = () => {
        setInitData(null)
        setDialogQrCodeMulti(false);
    }

    const saveOrUpdate = async () => {
        let inputData = getInputData(inputRef, "N");
        if (!inputData.isInvalid) {
            if (addOrEdit) {
                let jsonRequest = {
                    custCode: selectOdj.custCode,
                    custNameTh: selectOdj.custName,
                    custNameEn: selectOdj.custName,
                    dispenserNo: toString(inputData.data.dispenserNo),
                    nozzleNo: toString(inputData.data.nozzleNo),
                    gasId: inputData.data.gasId
                };
                const jsonResponse = await callAPI(apiPath.addMeter, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    searchGasolineByCust(tableRef.current.getJsonReq());
                    customAlert(msg.addSuccess)
                }
            } else {
                let jsonRequest = {
                    meterId: toString(initData.meterId),
                    custCode: initData.custCode,
                    activeFlag: inputData.data.activeFlag,
                    dispenserNo: toString(initData.dispenserNo),
                    nozzleNo: toString(initData.nozzleNo),
                    gasId: toString(inputData.data.gasId)
                };
                const jsonResponse = await callAPI(apiPath.updMeter, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    searchGasolineByCust(tableRef.current.getJsonReq());
                    customAlert(msg.editSuccess)
                }
            }
            closeModal();
        }
    }

    const RenderMultiQr = () => {
        if (initData && initData.length > 0) {
            let chunk = 18, renderList = [];
            for (let i = 0, j = initData.length; i < j; i += chunk) {
                let temporary = initData.slice(i, i + chunk);
                renderList.push(
                    <div className='QR-container'>
                        {temporary.map((objValue, index) =>
                            <>
                                <div className='QR-item'>
                                    <div className="row d-flex justify-content-center mb-3 mt-2">
                                        <QRCode value={objValue && objValue.qrcode ? objValue.qrcode : ""} size={80}></QRCode>
                                    </div>
                                    <div className="col-12 QR-desc">
                                        {msg.custName} : {objValue && objValue.custNameTh ? objValue.custNameTh : "-"}
                                    </div>
                                    <div className="col-12 QR-desc">
                                        {msg.productType} : {objValue && objValue.gasNameTh ? objValue.gasNameTh : "-"}
                                    </div>
                                    <div className='row'>
                                        <div className="col-6 QR-desc">
                                            {msg.dispenser} : {objValue && objValue.dispenserNo ? objValue.dispenserNo : "-"}
                                        </div>
                                        <div className="col-6 QR-desc">
                                            {msg.nozzle} : {objValue && objValue.nozzleNo ? objValue.nozzleNo : "-"}
                                        </div>
                                    </div>

                                </div>

                            </>
                        )}
                    </div>
                )
                renderList.push(<div className='pagebreak'></div>)
            }
            return renderList
        } else return null
    }
    return (
        <div className="col-12">
            <CriteriaCard
                onSearch={handleSearch}
                onClear={clear}
            >
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-6 mt-2">
                        <Select label={msg.custName} placeholder={msg.pleaseSelect} require options={filterDataForSelectCustomer()} ref={el => criteriaRef.current.custCode = el} />
                    </div>
                    <div className="col-12 col-md-3 mt-2">
                        <Switch
                            label={msg.notWhithInActive}
                            ref={el => criteriaRef.current.activeFlag = el}
                            labelOnTop
                            returnNullWhenN
                        />
                    </div>
                </div>
            </CriteriaCard>
            {selectOdj ?
                <div className="pl-4">
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.custCode}</div>
                        <div className="col-4">: {selectOdj.custCode}</div>
                    </div>
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.custName}</div>
                        <div className="col-4">: {selectOdj.custNameTh}</div>
                    </div>
                </div> : null
            }
            <Table
                onSelectPage={searchGasolineByCust}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
                btn
                btnType="add"
                btnFunction={() => addFunction()}
                multiBtn
                multiBtnFunction={showMultiQR}
                multiBtnLabel={msg.showQr}

            />
            <Modal
                isShow={dialogQrCode}
                onClose={() => closeDialogQr()}
                title={msg.qrCode}
                disableBtn
                btnPrint
            >
                <div className="row d-flex justify-content-center mb-3 mt-2">
                    <QRCode value={initData && initData.qrcode ? initData.qrcode : ""}></QRCode>
                </div>
                <div className="col-12 labelRow print-text-center">
                    {msg.custName} : {initData && initData.custNameTh ? initData.custNameTh : "-"}
                </div>
                <div className="col-12 labelRow print-text-center">
                    {msg.productType} : {initData && initData.gasNameTh ? initData.gasNameTh : "-"}
                </div>
                <div className="col-12 labelRow print-text-center">
                    {msg.dispenser} : {initData && initData.dispenserNo ? initData.dispenserNo : "-"}
                </div>
                <div className="col-12 labelRow print-text-center">
                    {msg.nozzle} : {initData && initData.nozzleNo ? initData.nozzleNo : "-"}
                </div>
            </Modal>

            <Modal
                isShow={dialogQrCodeMulti}
                onClose={() => closeDialogQrMulti()}
                title={msg.qrCode}
                disableBtn
                btnPrint
                size="xl"
            >
                <RenderMultiQr />
            </Modal>

            <Modal
                isShow={showModal}
                onClose={() => closeModal()}
                onSave={() => saveOrUpdate()}
                title={msg.qrMaster}
            >
                <TextField label={msg.custCode} disabled defaultValue={selectOdj && selectOdj.custCode ? selectOdj.custCode : ""} ref={el => inputRef.current.custCode = el}></TextField>
                <TextField label={msg.custName} disabled defaultValue={selectOdj && selectOdj.custNameTh ? selectOdj.custNameTh : ""} ref={el => inputRef.current.custName = el}></TextField>
                {addOrEdit ?
                    <div>
                        <Select label={msg.productType} placeholder={msg.pleaseSelect} require options={filterDataForSelectGasoline()} ref={el => inputRef.current.gasId = el}></Select>
                        <TextField allowChar="NUM" minNum={1} maxLength={2} require label={msg.dispenser} ref={el => inputRef.current.dispenserNo = el}></TextField>
                        <TextField allowChar="NUM" minNum={1} maxLength={2} require label={msg.nozzle} ref={el => inputRef.current.nozzleNo = el}></TextField>
                    </div>

                    :
                    <div>
                        <Select label={msg.productType} placeholder={msg.pleaseSelect} require options={filterDataForSelectGasoline()} defaultValue={initData && initData.gasId ? initData.gasId : ""} ref={el => inputRef.current.gasId = el}></Select>
                        <TextField disabled label={msg.dispenser} defaultValue={initData && initData.dispenserNo ? toString(initData.dispenserNo) : ""} ref={el => inputRef.current.dispenserNo = el}></TextField>
                        <TextField disabled label={msg.nozzle} defaultValue={initData && initData.nozzleNo ? toString(initData.nozzleNo) : ""} ref={el => inputRef.current.nozzleNo = el}></TextField>
                        <Switch
                            labelOnRight={msg.activeAndInActive}
                            label={msg.sysGroupStatus}
                            defaultValue={initData ? (initData.activeFlagMeter && initData.activeFlagMeter == "Y" ? true : false) : true}
                            ref={el => inputRef.current.activeFlag = el}
                            disabled={!initData}
                            returnYAndN
                        />
                    </div>
                }



            </Modal>
        </div >
    )
}