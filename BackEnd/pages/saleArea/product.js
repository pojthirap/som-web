import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import Select from "@components/Select";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import Modal from "@components/Modal"
import { getInputData, clearInputData, formatObjForSelect } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
export default function ProductPage({ callAPI, customAlert }) {
    const criteriaRef = useRef({});
    const inputRef = useRef({})
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [inputCriteria, setInputCriteria] = useState(null);
    const [selectDivision, setSelectDivision] = useState();
    const [selectProdConversion, setSelectProdConversion] = useState();
    const [showModal, setShowModal] = useState(false);
    const [initData, setInitData] = useState(null);
    const headerTabel = [
        {
            title: msg.productId,
            type: "rowNum",
            width: "10%"
        },
        {
            title: msg.productCode,
            data: "prodCode",
            type: "code",
            width: "20%"
        },
        {
            title: msg.productName,
            data: "prodNameTh",
            type: "string",
            width: "25%"
        },
        {
            title: msg.division,
            data: "divisionNameTh",
            type: "string",
            width: "25%"
        },
        {
            title: msg.unitReport,
            data: "altUnit",
            type: "string",
            width: "10%"
        },
        {
            title: msg.mappingUnit,
            type: "button",
            button: "add",
            width: "10%",
            addFunction: async (item) => mapUnit(item)
        }
    ]

    useEffect(() => {
        searchDivision();
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchProduct(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const searchDivision = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 2,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await callAPI(apiPath.searchDivision, jsonRequest);
        setSelectDivision(jsonResponse.data ? jsonResponse.data : null);
    }

    const searchProductConversion = async (data) => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 2,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                prodCode: data.prodCode
            }
        }
        const jsonResponse = await callAPI(apiPath.searchProductConversion, jsonRequest);
        console.log(jsonResponse)
        setSelectProdConversion(jsonResponse.data ? jsonResponse.data : null);
    }

    const filterDataForSelectDivision = () => {
        if (!(selectDivision && selectDivision.records)) return [];
        return formatObjForSelect(selectDivision.records, "divisionCode", "divisionNameTh");
    }

    const filterDataForSelectProdConversion = () => {
        if (!(selectProdConversion && selectProdConversion.records)) return [];
        return formatObjForSelect(selectProdConversion.records, "prodConvId", "altUnit");
    }

    const searchProduct = async (jsonRequest) => {
        if (inputCriteria) {
            const jsonResponse = await callAPI(apiPath.searchProduct, { ...jsonRequest, ...{ model: inputCriteria } })
            console.log(jsonResponse)
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const clear = () => {
        clearInputData(criteriaRef)
        // setData(null)
        // tableRef.current.clear();
    }

    const mapUnit = (data) => {
        searchProductConversion(data)
        setInitData(data);
        setShowModal(true);
    }
    const saveOrUpdate = async () => {
        let inputData = getInputData(inputRef, "N");
        if (!inputData.isInvalid) {
            const jsonRequest = {
                prodCode: initData.prodCode,
                reportProdConvId: inputData.data.prodConvId
            }
            const jsonResponse = await callAPI(apiPath.updateReportProductConversion, jsonRequest);
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                searchProduct(tableRef.current.getJsonReq());
                customAlert(msg.editSuccess)
            }
            closeModal();
        }
    }
    const closeModal = () => {
        setShowModal(false);
        setInitData(null);
    }
    return (
        <div className="col-12">
            <CriteriaCard
                onSearch={handleSearch}
                onClear={clear}
            >
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-4 mt-2">
                        <TextField label={msg.productCode} allowChar="NUM ENG" maxLength={20} value="" ref={el => criteriaRef.current.prodCode = el}></TextField>
                    </div>
                    <div className="col-12 col-md-4 mt-2">
                        <TextField label={msg.productName} value="" ref={el => criteriaRef.current.prodNameTh = el}></TextField>
                    </div>
                    <div className="col-12 col-md-4 mt-2">
                        <Select label={msg.division} placeholder={msg.pleaseSelect} hideEmptyOption options={filterDataForSelectDivision()} ref={el => criteriaRef.current.divisionCode = el} />
                    </div>
                </div>
            </CriteriaCard>
            <Table
                onSelectPage={searchProduct}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />

            <Modal
                isShow={showModal}
                onSave={saveOrUpdate}
                onClose={closeModal}
                title={msg.productName}
            >
                <TextField label={msg.productCode} disabled value={initData && initData.prodCode ? initData.prodCode : ""} ></TextField>
                <TextField label={msg.productName} disabled value={initData && initData.prodNameTh ? initData.prodNameTh : ""} ></TextField>
                <Select placeholder={msg.pleaseSelect} label={msg.unitName} require options={filterDataForSelectProdConversion()} defaultValue={initData && initData.prodConvId ? initData.prodConvId : ""} ref={el => inputRef.current.prodConvId = el} />
            </Modal>
        </div >
    )
}