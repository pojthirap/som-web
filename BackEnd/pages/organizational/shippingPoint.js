import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import Select from "@components/Select";
import { getInputData, clearInputData, formatObjForSelect } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
const headerTabel = [
    {
        title: msg.shippingPointCode,
        data: "shipping_Point_Receiving_Pt",
        type: "code",
        width: "30%"
    },
    {
        title: msg.shippingPointName,
        data: "shipping_Point_Receiving_Pt_Name",
        type: "string",
        width: "35%"
    },
    {
        title: msg.shippingPlantName,
        data: "plant_Name",
        type: "string",
        width: "35%"
    }
]

export default function ShippingPointPage({ callAPI }) {

    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [inputCriteria, setInputCriteria] = useState(null);
    const [selectCompany, setSelectCompany] = useState([]);
    const [selectPlant, setSelectPlant] = useState([]);
    const [isDisabledSelectPlant, setIsDisabledSelectPlant] = useState(true);
    const [filterData, setFilterData] = useState();

    useEffect(() => {
        searchSelect();
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchForShippingPoint(objectReq)
    }, [inputCriteria])

    useEffect(() => {
        if (data && data.records) {
            if (data.recordPerPage >= data.records.length) {
                setFilterData(data)
            } else {
                let tmpFilterData = { ...data };
                tmpFilterData.records = tmpFilterData.records.slice(tmpFilterData.recordStart - 1, tmpFilterData.pageNo * tmpFilterData.recordPerPage);
                setFilterData(tmpFilterData)
            }
        }
    }, [data])

    const handlePagging = (req) => {
        if (data && data.records) {
            let tmpFilterData = { ...data };
            tmpFilterData.pageNo = req.pageNo;
            tmpFilterData.recordStart = ((tmpFilterData.pageNo - 1) * tmpFilterData.recordPerPage) + 1
            tmpFilterData.records = tmpFilterData.records.slice(tmpFilterData.recordStart - 1, tmpFilterData.pageNo * tmpFilterData.recordPerPage);
            setFilterData(tmpFilterData)
        }
    }

    const handleSearch = async () => {
        let inputData = getInputData(inputRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const searchForShippingPoint = async (requireData) => {
        if (inputCriteria) {
            var jsonRequest = {
                ...requireData,
                model: {
                    ...inputCriteria,
                    shippingConditions: "20"
                }
            }

            console.log(jsonRequest)
            const jsonResponse = await callAPI(apiPath.searchShippingPointByPlantCode, jsonRequest)
            console.log(jsonResponse)
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const clear = () => {
        clearInputData(inputRef)
        setSelectPlant([])
        setIsDisabledSelectPlant(true);
        setData(null)
        setFilterData(null)
    }

    const searchSelect = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {}
        }
        const jsonResponse = await callAPI(apiPath.searchCompany, jsonRequest);
        setSelectCompany(jsonResponse.data ? jsonResponse.data : null);
    }


    const searchSeletForPlant = async (id) => {
        let jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                companyCode: id
            }
        }
        const jsonResponse = await callAPI(apiPath.searchPlantByCompanyCode, jsonRequest)
        const data = jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 ? jsonResponse.data.records : [];
        setSelectPlant(formatObjForSelect(data, "plant", ["plant", "name2"], " : "))
    }

    const handleOnChange = async (value) => {
        if (value) {
            await searchSeletForPlant(value);
            setIsDisabledSelectPlant(false);
        } else {
            setSelectPlant([])
            setIsDisabledSelectPlant(true);
        }

    }

    const filterDataForSelectCompany = () => {
        if (!(selectCompany && selectCompany.records)) return [];
        return formatObjForSelect(selectCompany.records, "companyCode", ["companyCode", "companyNameTh"], " : ");
    }

    return (
        <div className="col-12">
            <CriteriaCard onSearch={handleSearch} onClear={clear}>
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-6 mt-2">
                        <Select label={msg.companyName} placeholder={msg.pleaseSelect} options={filterDataForSelectCompany()} onChange={handleOnChange} require ref={el => inputRef.current.companyCode = el} ></Select>
                    </div>
                    <div className="col-12 col-md-6 mt-2">
                        <Select label={msg.plantName} placeholder={msg.pleaseSelect} options={selectPlant} require ref={el => inputRef.current.plantCode = el} disabled={isDisabledSelectPlant}></Select>
                    </div>
                </div>
            </CriteriaCard>
            <Table
                onSelectPage={handlePagging}
                dataTable={filterData}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
        </div>
    )
}