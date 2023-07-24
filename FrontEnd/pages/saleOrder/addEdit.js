import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { toString } from '@helper'
import Head from 'next/head'
import Image from 'next/image'
import Button from '@components/Button';
import Overview from './editTab/Overview'
import Product from './editTab/Product'
import DocumentFlow from './editTab/DocumentFlow'
import Changes from './editTab/Changes'
import * as apiPath from '@apiPath'
import * as msg from '@msg'
export default function AddEdit(pageProp) {
    const { getPathValue, updateCurrentPathValue, callAPI, customAlert, redirect } = pageProp;
    const dispatch = useDispatch();
    const pathValue = getPathValue(useSelector((state) => state.pathValue));
    const [currentTab, setCurrentTab] = useState("O");
    const [saleOrderData, setSaleOrderData] = useState(null)
    const pagePropAndPathValue = { ...pageProp, pathValue: pathValue, saleOrderData: saleOrderData };
    const overviewRef = useRef({});
    const productRef = useRef({});
    const isHaveSapOrderNo = saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.sapOrderNo && saleOrderData.saleOrder.sapOrderNo != "0"

    useEffect(() => {
        getSaleOrderByOrderId()
    }, [])

    const getOverViewData = () => {
        if (overviewRef.current && overviewRef.current.getData instanceof Function) {
            return overviewRef.current.getData("NV").data
        } else {
            return ({ isInvalid: true })
        }
    }

    const clearTableData = () => {
        productRef.current.clearTableData()
    }

    const handleReset = () => {
        if (saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.quotationNo) {
            dispatch(redirect("/saleOrder/main"))
        } else {
            overviewRef.current.resetData()
            productRef.current.resetData()
        }
    }

    const handleDelete = async () => {

        customAlert(msg.confirmDelete, "Q", async () => {
            const overViewData = overviewRef.current.resetData()
            const productData = productRef.current.resetData(overViewData.data)
            let changeTabDesc = !overViewData.isNotChange ? "Overview" : ""
            changeTabDesc += (!productData.isNotChange ? (changeTabDesc ? "/Product" : "Product") : "")
            if (changeTabDesc == "") changeTabDesc = "No Change"
            const jsonRequest = {
                typeSubmit: "TYPE_SUBMIT_CHANGE",
                changeTabDesc: changeTabDesc,
                saleOrder: {
                    ...overViewData.data,
                },
                items: productData.data
            }
            const jsonResponse = await callAPI(apiPath.delSaleOrder, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                customAlert(msg.deleteSuccess)
                dispatch(redirect("/saleOrder/main"))
            }

        });
    }

    const getSaleOrderByOrderId = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                orderId: toString(pathValue.editItem.orderId, false, false)
            }
        }
        const jsonResponse = await callAPI(apiPath.getSaleOrderByOrderId, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 ? jsonResponse.data.records[0] : {}
        setSaleOrderData(data)
    }
    const onTabSelect = (type) => {
        if (type == "P") {
            const overviewData = overviewRef.current.getData("N").data
            if (overviewData && overviewData.docTypeCode && overviewData.custSaleId && overviewData.plantCode && overviewData.companyCode) {
                // && overviewData.shipToCustCode && overviewData.shipToCustPartnerId
                setCurrentTab(type)
            } else {
                customAlert(msg.pleseFillAllReqField, "W")
            }
        } else {
            setCurrentTab(type)
        }
    }
    const handleSave = async (typeSubmit) => {
        const overViewData = overviewRef.current.getData()
        const productData = productRef.current.getData()
        if (!overViewData.isInvalid) {
            let changeTabDesc = !overViewData.isNotChange ? "Overview" : ""
            changeTabDesc += (!productData.isNotChange ? (changeTabDesc ? "/Product" : "Product") : "")
            if (changeTabDesc == "") changeTabDesc = "No Change"
            const jsonRequest = {
                typeSubmit: typeSubmit,
                changeTabDesc: changeTabDesc,
                saleOrder: {
                    ...overViewData.data,
                },
                items: productData.data
            }
            const jsonResponse = await callAPI(apiPath.updSaleOrder, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                if (jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 && jsonResponse.data.records[0].sO_Message) {
                    customAlert(
                        <div>
                            <div>
                                {msg.saveSuccess}
                            </div>
                            <div>
                                {jsonResponse.data.records[0].sO_Message}
                            </div>
                        </div>
                    )
                } else {
                    customAlert(msg.saveSuccess)
                }
                getSaleOrderByOrderId()
            }
        }
    }
    return (
        <div>
            <Head>
                {/* <title>{menuPath ? menuPath : namePath ? msg.detailProspect : mainPagePath}</title> */}
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <div className="container p-0">
                <div style={{ fontSize: 75, lineHeight: 1, fontWeight: "bold", marginBottom: 40, paddingLeft: 40 }}>{msg.saleOrder}</div>
            </div>
            <div className="tag-history">
                <div className="container p-0">
                    <div className=" padding-row row align-items-center primaryLabel">
                        <Image src="/img/icon/icon-account.png" width="24" height="24" />
                        <div><span className="ml-2">/</span><span className="ml-2">{msg.saleOrder}</span></div>
                        {/* {namePath ? <div><span className="ml-2">/</span><span className="ml-2">{namePath}</span></div> : null} */}

                    </div>
                </div>
            </div>
            <div className="container pt-4">
                <div className="h1">
                    {msg.saleOrderNo} {pathValue && pathValue.editItem && pathValue.editItem.somOrderNo ? toString(pathValue.editItem.somOrderNo) : "-"}
                </div>
                <div className="row thick-gray-underline mt-4" >
                    <div className={"col-3 p-0 font-normal text-center cursor-pointer" + (currentTab == "O" ? " thick-green-underline" : " thick-white-underline")} onClick={() => onTabSelect("O")}>
                        {msg.overview}
                    </div>
                    <div className={"col-3 p-0 font-normal text-center cursor-pointer" + (currentTab == "P" ? " thick-green-underline" : " thick-white-underline")} onClick={() => onTabSelect("P")}>
                        {msg.product}
                    </div>
                    <div className={"col-3 p-0 font-normal text-center cursor-pointer" + (currentTab == "D" ? " thick-green-underline" : " thick-white-underline")} onClick={() => onTabSelect("D")}>
                        {msg.documentFlow}
                    </div>
                    <div className={"col-3 p-0 font-normal text-center cursor-pointer" + (currentTab == "C" ? " thick-green-underline" : " thick-white-underline")} onClick={() => onTabSelect("C")}>
                        {msg.changes}
                    </div>
                </div>
            </div>
            <Overview {...pagePropAndPathValue} isShow={currentTab == "O"} ref={overviewRef} clearTableData={clearTableData} />
            <Product {...pagePropAndPathValue} isShow={currentTab == "P"} getOverViewData={getOverViewData} ref={productRef} />
            <DocumentFlow {...pagePropAndPathValue} isShow={currentTab == "D"} />
            <Changes {...pagePropAndPathValue} isShow={currentTab == "C"} />

            <div className="container pb-4 border-top-grey">
                <div className="row justify-content-end">
                    <div className="col-12 col-lg-10 col-xl-8 row justify-content-end px-0">
                        <div className="col-6 col-md-3 mt-3">
                            <Button customLabel={msg.deleteFull} onClick={handleDelete} />
                        </div>
                        <div className="col-6 col-md-3 mt-3">
                            <Button type="dangerNew" customLabel={msg.cancle} onClick={handleReset} />
                        </div>
                        <div className="col-6 col-md-3 mt-3">
                            {isHaveSapOrderNo ?
                                <Button type="tertiary" customLabel={msg.changeOrder} onClick={() => handleSave("3")} />
                                :
                                <Button type="tertiary" customLabel={msg.submitOrder} onClick={() => handleSave("1")} disabled={!(saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.sapStatus)} />
                            }
                        </div>
                        {!(saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.quotationNo) && !(isHaveSapOrderNo) ?
                            <div className="col-6 col-md-3 mt-3">
                                <Button customLabel={msg.simulateSave} onClick={() => handleSave("2")} />
                            </div>
                            :
                            null
                        }
                    </div>
                </div>

            </div>
        </div>
    )
}