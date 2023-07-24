import { useState, useRef, useEffect } from 'react';
import { getInputData, toString } from '@helper';
import { useSelector } from 'react-redux'
import Table from "@components/Table";
import * as apiPath from '@apiPath'
import * as msg from '@msg'

function Main({ callAPI, saleOrderData, isShow }) {
    const tableRef = useRef({});
    const [data, setData] = useState(null)
    const permList = useSelector((state) => state.permList);
    const havingPerm = permList.some(perm => perm.permObjCode == "FE_SALEORD_S014");

    const headerTabel = [
        {
            title: msg.changeDateTime,
            data: "changeDtm",
            type: "dateTime",
            width: "25%"
        },
        {
            title: msg.changeTap,
            data: "changeTabDesc",
            type: "string",
            width: "25%"
        },
        {
            title: msg.changeBy,
            data: "changeUser",
            type: "string",
            width: "25%"
        },
        {
            title: msg.saleRepId,
            data: "orderSaleRep",
            type: "code",
            width: "25%"
        }
    ]

    useEffect(() => {
        if (saleOrderData) {
            let objectReq = tableRef.current.getJsonReq()
            searchSaleOrderChangeLog(objectReq)
        }
    }, [saleOrderData])


    const searchSaleOrderChangeLog = async (jsonRequest) => {
        jsonRequest.model = {
            orderId: saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.orderId ? toString(saleOrderData.saleOrder.orderId, false, false) : ""
        }
        const jsonResponse = await callAPI(apiPath.searchSaleOrderChangeLog, jsonRequest);
        let data = jsonResponse && jsonResponse.data ? jsonResponse.data : null
        setData(data)
    }

    if (havingPerm) {
        return (
            <div className={"container py-4" + (isShow ? "" : " d-none")}>
                <Table
                    onSelectPage={searchSaleOrderChangeLog}
                    dataTable={data}
                    headerTabel={headerTabel}
                    ref={tableRef}
                />
            </div>
        )
    } else {
        return (
            <div className={"container py-4" + (isShow ? "" : " d-none")}>
                <div className="h1 huge-font mt-4 ml-4">
                    You don't have permission in this page.
                </div>
            </div>
        )
    }
}
export default Main