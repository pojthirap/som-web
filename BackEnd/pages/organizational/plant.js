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
        title: msg.plantCode,
        data: "plant",
        type: "code",
        width: "10%"
    },
    {
        title: msg.plantName,
        data: "name2",
        type: "string",
        width: "15%"
    },
    {
        title: msg.plantCity,
        data: "city",
        type: "string",
        width: "10%"
    },
    {
        title: msg.plantCustomer,
        data: "customer_Num_Plant",
        type: "code",
        width: "10%"
    },
    // {
    //     title: msg.plantVendor,
    //     data: "plantVendorNo",
    //     type: "string",
    //     width: "10%"
    // },
    {
        title: msg.plantFactory,
        data: "factory_Calender",
        type: "code",
        width: "10%"
    },
    {
        title: msg.plantPurch,
        data: "purch_Org",
        type: "code",
        width: "10%"
    },
    {
        title: msg.plantBusiness,
        data: "business_Place",
        type: "code",
        width: "10%"
    },
    // {
    //     title: msg.plantShipping,
    //     data: "descriptionTh",
    //     type: "string",
    //     width: "15%"
    // }
]
export default function PlantPage({ callAPI }) {

    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [inputCriteria, setInputCriteria] = useState(null);
    const [selectCompany, setSelectCompany] = useState();
    const [filterData, setFilterData] = useState();

    useEffect(() => {
        searchSelect();
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchForPlant(objectReq)
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

    const searchForPlant = async (jsonRequest) => {
        if (inputCriteria) {
            const jsonResponse = await callAPI(apiPath.searchPlantByCompanyCode, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
            console.log(jsonResponse.data)
        }
    }

    const clear = () => {
        clearInputData(inputRef)
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


    const filterDataForSelectCompany = () => {
        if (!(selectCompany && selectCompany.records)) return [];
        return formatObjForSelect(selectCompany.records, "companyCode", ["companyCode", "companyNameTh"], " : ");
    }


    return (
        <div className="col-12">
            <CriteriaCard onSearch={handleSearch} onClear={clear}>
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-6 mt-2">
                        <Select label={msg.companyName} placeholder={msg.pleaseSelect} options={filterDataForSelectCompany()} ref={el => inputRef.current.companyCode = el} require></Select>
                    </div>
                    {/* <div className="col-12 col-md-6 mt-2">
                        <TextField label="Plant Name" value="" ref={el => inputRef.current.plantNameTh = el}></TextField>
                    </div>
                    <div className="col-12 col-md-6 mt-2">
                        <TextField label="Shipping Point Name" value="" ref={el => inputRef.current.descriptionTh = el}></TextField>
                    </div> */}
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