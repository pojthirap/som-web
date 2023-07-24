import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData } from "@helper";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
const headerTabel = [
    {
        title: msg.provinceCode,
        data: "provinceCode",
        type: "code",
        width: "20%"
    },
    {
        title: msg.provinceName,
        data: "provinceNameTh",
        type: "string",
        width: "80%"
    },
]
export default function ProvincePage({ callAPI }) {
    const inputRef = useRef({});
    const tableRef = useRef({});
    const [data, setData] = useState();
    const [inputCriteria, setInputCriteria] = useState(null);

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchProvince(objectReq)
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

    const searchProvince = async (jsonRequest) => {
        if (inputCriteria) {
            inputCriteria.activeFlag = "Y"
            const jsonResponse = await callAPI(apiPath.searchProvince, { ...jsonRequest, ...{ model: inputCriteria } })
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
                        <TextField label={msg.provinceName} allowChar="THAI" value="" ref={el => inputRef.current.provinceName = el}></TextField>
                    </div>
                </div>
            </CriteriaCard>
            <Table
                onSelectPage={searchProvince}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
        </div >


    )
}