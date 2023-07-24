import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import CriteriaCard from "@components/CriteriaCard";
import Select from "@components/Select";
import { getInputData, clearInputData, formatObjForSelect, toString } from "@helper";
import { useSelector, useDispatch } from 'react-redux'
import * as apiPath from "@apiPath";
import * as msg from "@msg";
export default function SaleGroupEditPage({ callAPI, getPathValue, customAlert, updateCurrentPathValue }) {
    const pathValue = getPathValue(useSelector((state) => state.pathValue));
    const inputRef = useRef({});
    const tableRef = useRef({});
    const tableRefByStockCardId = useRef({});
    const [data, setData] = useState();
    const [dataByGroupCode, setDataByGroupCode] = useState();
    const [inputCriteria, setInputCriteria] = useState(null);
    const [selectData, setSelectData] = useState();

    const [checkEqualByDivision, setCheckEqualByDivision] = useState(false);
    const [divisionCodeOld, setDivisionCodeOld] = useState();

    const headerTabel = [
        {
            title: msg.productCode,
            data: "divisionCode",
            type: "code"
        },
        {
            title: msg.productName,
            data: "prodNameTh",
            type: "string"
        },
    ]
    const headerTabelByGroupCode = [
        {
            title: msg.numOrder,
            type: "rowNum"
        },
        {
            title: msg.productCode,
            data: "divisionCode",
            type: "code "
        },
        {
            title: msg.productName,
            data: "prodNameTh",
            type: "string"
        },
        {
            title: msg.division,
            data: "divisionNameTh",
            type: "string"
        },
        {
            title: "",
            type: "button",
            button: "delete",
            deleteFunction: (item) => deleteFunction(item),
        },
    ]
    useEffect(() => {
        searchTemplateByStockCardId(tableRefByStockCardId.current.getJsonReq());
        searchDivision();
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq();
        searchProduct(objectReq);
    }, [inputCriteria])

    const handleSearch = async () => {

        let inputData = getInputData(inputRef, "NE");

        if (inputData.dataSize > 0) {
            if (!inputData.isInvalid) {
                setInputCriteria(inputData.data);
            }
        }

    }

    const searchProduct = async (pagingCriteria) => {
        pagingCriteria.searchOption = 1
        if (inputCriteria) {
            if(divisionCodeOld == inputCriteria.divisionCode){
                setCheckEqualByDivision(false)
            } else {
                setCheckEqualByDivision(true)
            }
            inputCriteria.activeFlag = "Y"
            inputCriteria.tpStockCardId = toString(pathValue.tpStockCardId)
            const jsonResponse = await callAPI(apiPath.searchProduct, { ...pagingCriteria, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
            setDivisionCodeOld(inputCriteria.divisionCode)
        }
    }

    const searchTemplateByStockCardId = async (pagingCriteria) => {
        let jsonRequest = { ...pagingCriteria, ...{ model: { tpStockCardId: toString(pathValue.tpStockCardId), activeFlag: "Y" } } };
        jsonRequest.searchOrder = 1;
        const jsonResponse = await callAPI(apiPath.searchTemplateByStockCardId, jsonRequest)
        setDataByGroupCode(jsonResponse.data ? jsonResponse.data : null)
    }

    const clear = () => {
        clearInputData(inputRef)
        setData(null)
        tableRef.current.clear();
    }
    const searchDivision = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 1,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.searchDivision, jsonRequest);
        setSelectData(jsonResponse.data ? jsonResponse.data : null);
    }

    const deleteFunction = async (item) => {
        customAlert(msg.confirmDelete, "Q", async () => {
            let jsonRequest = {
                tpStockProdId: toString(item.tpStockProdId)
            }
            const jsonResponse = await callAPI(apiPath.delTemplateStockProduct, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                searchTemplateByStockCardId(tableRefByStockCardId.current.getJsonReq());
                customAlert(msg.deleteSuccess)
            }
        })

    }

    const addFunction = async (item) => {
        // let prodCodeList = [];
        // item.forEach((obj) => {
        //     prodCodeList.push(toString(obj.prodCode));
        // });

        let jsonRequest = {
            tpStockCardId: toString(pathValue.tpStockCardId),
            prodCode: item
        }
        const jsonResponse = await callAPI(apiPath.addTemplateStockProduct, jsonRequest)
        if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
            searchTemplateByStockCardId(tableRefByStockCardId.current.getJsonReq());
            clear();
            customAlert(msg.addSuccess)
        }
    }

    const filterDataForSelect = () => {
        if (!(selectData && selectData.records)) return [];
        return formatObjForSelect(selectData.records, "divisionCode", ["divisionCode", "divisionNameTh"], " : ");
    }

    return (
        <div className="col-12">
            <div className="content-search ">
                <CriteriaCard onSearch={handleSearch} onClear={clear} disabledBackground>
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.templateStockCardCode}</div>
                        <div className="col-4">: {pathValue.tpCode}</div>
                    </div>
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.templateStockCardName}</div>
                        <div className="col-4">: {pathValue.tpNameTh}</div>
                    </div>
                    <div className="row d-flex justify-content-center mt-3">
                        <div className="col-6 col-md-6 mt-2">
                            <Select
                                placeholder={msg.pleaseSelect}
                                ref={el => inputRef.current.divisionCode = el}
                                defaultValue={pathValue.managerEmpId}
                                options={filterDataForSelect()}
                                label={msg.division}
                                require
                            />
                        </div>
                    </div>
                </CriteriaCard>
                <Table
                    onSelectPage={searchProduct}
                    dataTable={data}
                    headerTabel={headerTabel}
                    label={true}
                    ref={tableRef}
                    multiBtn
                    multiBtnType="add"
                    multiBtnFunction={(item) => addFunction(item)}
                    forTemplateStockCardAddProduct
                    flagCheckEqualByDivision={checkEqualByDivision}
                />
            </div>
            <Table
                customLabel={msg.productList}
                onSelectPage={searchTemplateByStockCardId}
                dataTable={dataByGroupCode}
                headerTabel={headerTabelByGroupCode}
                label={true}
                ref={tableRefByStockCardId}
            />
        </div>
    )
}