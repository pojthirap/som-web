import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
const headerTabel = [
    {
        title: msg.companyCode,
        data: "companyCode",
        type: "code",
        width: "20%"
    },
    {
        title: msg.companyName,
        data: "companyNameTh",
        type: "string",
        width: "50%"
    },
    {
        title: msg.vatRegistration,
        data: "vatRegistNo",
        type: "code",
        width: "30%"
    }
]
export default function CompanyPage({ callAPI }) {
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [inputCriteria, setInputCriteria] = useState(null);

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchCompany(objectReq)
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

    const searchCompany = async (jsonRequest) => {
        if (inputCriteria) {
            const jsonResponse = await callAPI(apiPath.searchCompany, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const clear = () => {
        clearInputData(inputRef)
    }

    return (
        <div className="col-12">
            <CriteriaCard onSearch={handleSearch} onClear={clear}>
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-6 mt-2">
                        <TextField label={msg.companyName} value="" ref={el => inputRef.current.companyName = el}></TextField>
                    </div>
                </div>
            </CriteriaCard>
            <Table
                onSelectPage={searchCompany}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
        </div >


    )
}