import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
const headerTabel = [
    {
        title: msg.salesOrgCode,
        data: "orgCode",
        type: "code",
        width: "25%"
    },
    {
        title: msg.salesOrgName,
        data: "orgNameTh",
        type: "string",
        width: "25%"
    },
    {
        title: msg.salesOrgComName,
        data: "companyNameTh",
        type: "string",
        width: "25%"
    },
    {
        title: msg.salesOrgCurrency,
        data: "currency",
        type: "string",
        width: "25%"
    }
]

export default function SaleOrgPage({ callAPI }) {

    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [inputCriteria, setInputCriteria] = useState(null);

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchSaleOrg(objectReq)
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(inputRef, "NE");
        if (inputData.isInvalid) {
            alert("Invalid");
        }
        else {
            setInputCriteria(inputData.data);
        }
    }

    const searchSaleOrg = async (jsonRequest) => {
        if (inputCriteria) {
            const jsonResponse = await callAPI(apiPath.searchSaleOrg, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const clear = () => {
        clearInputData(inputRef)
        // setData(null)
        // tableRef.current.clear();
    }

    return (
        <div className="col-12">
            <CriteriaCard onSearch={handleSearch} onClear={clear}>
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-6 mt-2">
                        <TextField label={msg.salesOrgComName} value="" ref={el => inputRef.current.companyName = el}></TextField>
                    </div>
                    <div className="col-12 col-md-6 mt-2">
                        <TextField label={msg.salesOrgName} value="" ref={el => inputRef.current.orgName = el}></TextField>
                    </div>
                </div>
            </CriteriaCard>
            <Table
                onSelectPage={searchSaleOrg}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
        </div >
    )
}