import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
const headerTabel = [
    {
        title: msg.divisionCode,
        data: "divisionCode",
        type: "code",
        width: "30%"
    },
    {
        title: msg.divisionName,
        data: "divisionNameTh",
        type: "string",
        width: "70%"
    }
]

export default function DivisionPage({ callAPI }) {

    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [inputCriteria, setInputCriteria] = useState(null);

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchDivision(objectReq)
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

    const searchDivision = async (jsonRequest) => {
        console.log(jsonRequest)
        if (inputCriteria) {
            let tmpRequest = jsonRequest;
            tmpRequest.model = inputCriteria;
            const jsonResponse = await callAPI(apiPath.searchDivision, { ...jsonRequest, ...{ model: inputCriteria } })
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
                        <TextField label={msg.divisionName} value="" ref={el => inputRef.current.divisionName = el}></TextField>
                    </div>
                </div>
            </CriteriaCard>
            <Table
                onSelectPage={searchDivision}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
        </div>
    )
}