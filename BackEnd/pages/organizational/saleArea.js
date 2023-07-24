import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import Modal from "@components/Modal";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import Select from "@components/Select";
import { getInputData, clearInputData, formatObjForSelect, toString } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";

export default function SaleAreaPage({ callAPI, customAlert }) {
    const headerTabel = [
        {
            title: msg.saleAreaSaleOrgCode,
            data: "orgCode",
            type: "code"
        },
        {
            title: msg.saleAreaSaleOrgName,
            data: "orgNameTh",
            type: "string"
        },
        {
            title: msg.saleAreaChannelCode,
            data: "channelCode",
            type: "code"
        },
        {
            title: msg.saleAreaChannelName,
            data: "channelNameTh",
            type: "string"
        },
        {
            title: msg.saleAreaDivisionCame,
            data: "divisionCode",
            type: "code"
        },
        {
            title: msg.saleAreaDivisionName,
            data: "divisionNameTh",
            type: "string"
        },
        {
            title: msg.saleAreaBuCode,
            data: "bussAreaCode",
            type: "code"
        },
        {
            title: msg.saleAreaBuName,
            data: "bussAreaNameTh",
            type: "string"
        },
        {
            title: msg.businessUnitName,
            data: "buNameTh",
            type: "string"
        }
    ]
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [selectBuData, setSelectBuData] = useState();
    const [checkData, setCheckData] = useState();

    useEffect(() => {
        searchBusinessUnit();
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        forSearch(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(inputRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }
    const handleSave = async () => {
        let inputData = getInputData(inputRef);
        if (!inputData.isInvalid) {
            let message = []
            message.push(<div>กรุณายืนยันการเปลี่ยน</div>)
            checkData.forEach((obj) => {
                message.push(<div>{obj.orgNameTh + "/" + obj.channelNameTh + "/" + obj.divisionNameTh}</div>);
            });
            selectBuData.records.forEach((obj) => {
                if (obj.buId == inputData.data.buId) {
                    message.push(<div>ไปยัง BU: {obj.buNameTh}</div>)
                }
            })
            
            closeModal()

            customAlert(<div>{message}</div>, "Q", async () => {
                let listAreaId = [];
                checkData.forEach((obj) => {
                    listAreaId.push(toString(obj.areaId));
                });
                const jsonRequest = {
                    buId: toString(inputData.data.buId),
                    listAreaId: listAreaId
                }
                const jsonResponse = await callAPI(apiPath.updBusinessUnitSaleArea, jsonRequest);
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    let objectReq = tableRef.current.getJsonReq()
                    forSearch(objectReq)
                    customAlert(msg.editSuccess);
                }
            })
        }
    }

    const forSearch = async (jsonRequest) => {
        if (inputCriteria) {
            let tmpRequest = jsonRequest;
            tmpRequest.model = inputCriteria;
            const jsonResponse = await callAPI(apiPath.searchSaleArea, tmpRequest)
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const searchBusinessUnit = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 2,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: { activeFlag: "Y" }
        }
        const jsonResponse = await callAPI(apiPath.searchBusinessUnit, jsonRequest);
        setSelectBuData(jsonResponse.data ? jsonResponse.data : null);
    }

    const filterBuDataForSelect = () => {
        if (!(selectBuData && selectBuData.records)) return [];
        return formatObjForSelect(selectBuData.records, "buId", "buNameTh");
    }

    const clear = () => {
        clearInputData(inputRef)
        // setData(null)
        // tableRef.current.clear();
    }
    const editFunction = (item) => {
        setCheckData(item)
        setShowModal(true)
    }
    const closeModal = (item) => {
        setCheckData(null)
        setShowModal(false)
    }

    return (
        <div className="col-12">
            <CriteriaCard onSearch={handleSearch} onClear={clear}>
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-4 mt-2">
                        <TextField label={msg.saleAreaSaleOrgName} value="" ref={el => inputRef.current.orgNameTh = el}></TextField>
                    </div>
                    <div className="col-12 col-md-4 mt-2">
                        <TextField label={msg.saleAreaChannelName} value="" ref={el => inputRef.current.channelNameTh = el}></TextField>
                    </div>
                    <div className="col-12 col-md-4 mt-2">
                        <TextField label={msg.saleAreaDivisionName} value="" ref={el => inputRef.current.divisionNameTh = el}></TextField>
                    </div>
                </div>
                <div className="row d-flex justify-content-left">
                    <div className="col-12 col-md-4 mt-2">
                        <TextField label={msg.businessUnitSubMenu} value="" ref={el => inputRef.current.buNameTh = el}></TextField>
                    </div>
                </div>
            </CriteriaCard>
            <Table
                onSelectPage={forSearch}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
                multiBtn
                multiBtnType="edit"
                multiBtnFunction={(item) => editFunction(item)}
            />
            <Modal
                isShow={showModal}
                onSave={() => handleSave()}
                onClose={() => closeModal()}
                title={msg.headerDialogBusinessUnit}
            >
                <Select label={msg.saleRepBuName} placeholder={msg.pleaseSelect} require options={filterBuDataForSelect()} ref={el => inputRef.current.buId = el} />
            </Modal>
        </div>
    )
}