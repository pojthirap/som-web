import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData } from "@helper";
import * as apiPath from "@apiPath";
import { useDispatch } from 'react-redux'
import Modal from "@components/Modal";
import * as msg from "@msg";
export default function SaleGroupPage({ callAPI, redirect }) {
    const inputRef = useRef({});
    const tableRef = useRef({});
    const dispatch = useDispatch();
    const [data, setData] = useState();
    const [inputCriteria, setInputCriteria] = useState(null);

    const headerTabel = [
        {
            title: msg.salesGroupCode,
            data: "groupCode",
            type: "code"
        },
        {
            title: msg.salesGroupName,
            data: "descriptionTh",
            type: "string"
        },
        {
            type: "button",
            button: "edit",
            editFunction: async (item) => editFunction(item),
        },
    ]

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchSaleGroup(objectReq)
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

    const searchSaleGroup = async (jsonRequest) => {
        if (inputCriteria) {
            const jsonResponse = await callAPI(apiPath.searchSaleGroup, { ...jsonRequest, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const clear = () => {
        clearInputData(inputRef)
        // setData(null)
        // tableRef.current.clear();
    }

    const editFunction = (item) => {
        dispatch(redirect("/organizational/saleGroupEdit", item))
    }

    return (
        <div className="col-12">
            <CriteriaCard onSearch={handleSearch} onClear={clear}>
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-6 mt-2">
                        <TextField label={msg.salesGroupName} value="" ref={el => inputRef.current.description = el}></TextField>
                    </div>
                </div>
            </CriteriaCard>
            <Table
                onSelectPage={searchSaleGroup}
                dataTable={data}
                headerTabel={headerTabel}
                label={true}
                ref={tableRef}
            />
        </div>
    )
}