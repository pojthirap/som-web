import { useState, useRef, useEffect } from 'react';
import { getInputData, toString, formatObjForSelect, formatDateTime } from '@helper';
import { faArrowCircleDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import Select from '@components/Select';
import * as apiPath from '@apiPath'
import * as msg from '@msg'
import moment from 'moment';

function Main({ callAPI, pathValue, isShow, saleOrderData }) {
    const [selectData, setSelectData] = useState([])
    const [docData, setDocData] = useState([])
    const [currentSelectData, setCurrentSelectData] = useState(null)
    const permList = useSelector((state) => state.permList);
    const havingPerm = permList.some(perm => perm.permObjCode == "FE_SALEORD_S013");

    useEffect(() => {
        if (saleOrderData && saleOrderData.saleOrder && isShow) {
            searchSaleOrderDocFlow();
        }
    }, [saleOrderData, isShow])
    const searchSaleOrderDocFlow = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                sapOrderNo: toString(saleOrderData.saleOrder.sapOrderNo, false),
                orgCode: toString(saleOrderData.saleOrder.orgCode, false),
                channelCode: toString(saleOrderData.saleOrder.channelCode, false),
                divisionCode: toString(saleOrderData.saleOrder.divisionCode, false),
                docTypeCode: toString(saleOrderData.saleOrder.docTypeCode, false),
                somOrderNo: toString(saleOrderData.saleOrder.sapOrderNo, false),
                somOrderDte: toString(saleOrderData.saleOrder.sapOrderDte, false)
            }
        }
        const jsonResponse = await callAPI(apiPath.searchSaleOrderDocFlow, jsonRequest);

        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : []
        setSelectData(data.length > 0 ? formatObjForSelect(data, "sO_item", "material_Desc") : [])
        setDocData(data)
    }

    const RenderItem = ({ selectedItemCode }) => {
        const findObj = docData.find(el => el.sO_item == selectedItemCode)
        const listItem = findObj && findObj.document && findObj.document.length > 0 ? findObj.document : []
        if (listItem && listItem.length > 0) {
            let renderList = []

            listItem.forEach((data, index) => {
                if (index > 0) {
                    renderList.push(
                        <div className="row justify-content-center py-3">
                            <FontAwesomeIcon icon={faArrowCircleDown} />
                        </div>
                    )
                }
                let dateStr = moment(data.created_On + "T" + data.created_Time).format("YYYY-MM-DDTHH:mm:ss")

                renderList.push(
                    <div className="row text-center justify-content-center">
                        <div className="col-12 col-md-6 col-lg-6 doc-flow-item">
                            <div className="row justify-content-center text-bold" style={{ fontSize: 35 }}> {data.document_Name} </div>
                            <div className="row justify-content-center text-bold" style={{ fontSize: 25 }}> {data.document_no} </div>
                            <div className="row justify-content-center text-bold" style={{ fontSize: 25 }}> {formatDateTime(dateStr)} </div>
                        </div>
                    </div>
                )
            });
            return renderList
        }
        else {
            return null
            // (
            //     <div>
            //         {msg.tableNoData}
            //     </div>
            // )
        }

    }
    if (havingPerm) {
        return (
            <div className={"container py-4" + (isShow ? "" : " d-none")}>
                <div className="row mb-4">
                    <div className="col-6 col-lg-4">
                        <Select
                            label={msg.documentFlowProduct}
                            options={selectData}
                            onChange={setCurrentSelectData}
                        />
                    </div>
                </div>
                <RenderItem selectedItemCode={currentSelectData} />
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