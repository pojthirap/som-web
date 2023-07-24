import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { getInputData, toString, formatObjForSelect } from '@helper';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import Button from '@components/Button';
import Modal from "@components/Modal";
import Select from '@components/Select';
import TextField from '@components/TextField';
import * as apiPath from '@apiPath'
import * as msg from '@msg'

function Main({ callAPI, pathValue, isShow, getOverViewData, saleOrderData, customAlert }, ref) {
    const [showModal, setShowModal] = useState(false)
    const [productData, setProductData] = useState([])
    const [productSelectData, setProductSelectData] = useState([])
    const [selectedProductData, setSelectedProductData] = useState(null)
    const [unitSelectData, setUnitSelectData] = useState([])
    const [unitData, setUnitData] = useState([])
    const [tableData, setTableData] = useState([])
    const [initTotalData, setInitTotalData] = useState(null)
    const modalInput = useRef({})
    const permList = useSelector((state) => state.permList);
    const havingPerm = permList.some(perm => perm.permObjCode == "FE_SALEORD_S012");
    const addByQuotationNo = saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.quotationNo ? true : false;
    const isHaveSapOrderNo = saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.sapOrderNo && saleOrderData.saleOrder.sapOrderNo != "0"
    useEffect(() => {
        if (saleOrderData && saleOrderData.items && saleOrderData.items.length > 0) {
            let tmpInitList = []
            saleOrderData.items.forEach((data) => {
                const tmpInitObj = {
                    orderProdId: toString(data.orderProdId, false, true),
                    orderId: toString(data.orderId, false, true),
                    prodCode: toString(data.prodCode, false, true),
                    qty: toString(data.qty, false, false),
                    prodConvId: toString(data.prodConvId, false, true),
                    netPriceEx: toString(data.netPriceEx, false, false),
                    transferPrice: toString(data.transferPrice, false, false),
                    netPriceInc: toString(data.netPriceInc, false, false),
                    additionalPrice: toString(data.additionalPrice, false, false),
                    additionalPerUnit: toString(data.additionalPerUnit, false, false),
                    itemType: toString(data.itemType, false, true),
                    netValue: toString(data.netValue, false, false),
                    sapItemNo: toString(data.sapItemNo, false, true),
                    prodAltUnit: toString(data.prodAltUnit, false, false),
                    prodNameTh: toString(data.prodNameTh, false, true),
                    prodCateCode: toString(data.prodCateCode, false, true),
                }
                tmpInitList.push(tmpInitObj)
            })
            setInitTotalData(null)
            setTableData(tmpInitList)
        }
    }, [saleOrderData])

    useImperativeHandle(ref, () => ({
        getData() {
            const overviewData = getOverViewData()
            let returnTableData = []
            tableData.forEach(element => {
                let tmpEle = element;
                tmpEle.plantCode = toString(overviewData.plantCode, false, false)
                tmpEle.shipCode = toString(overviewData.shipCode, false, false)
                if (!tmpEle.qty) tmpEle.qty = "0"
                if (!tmpEle.additionalPrice) tmpEle.additionalPrice = "0"
                if (!(tmpEle.additionalPerUnit && Number(tmpEle.additionalPerUnit) != 0)) tmpEle.additionalPerUnit = null
                returnTableData.push(tmpEle)
            });


            let isNotChange = saleOrderData.items.length == returnTableData.length

            if (isNotChange) {
                saleOrderData.items.forEach((element, index) => {
                    isNotChange = isNotChange && element.prodCode == tableData[index].prodCode && element.qty == tableData[index].qty && element.additionalPrice == tableData[index].additionalPrice && element.additionalPerUnit == tableData[index].additionalPerUnit
                    // && element.prodCateCode == tableData[index].prodCateCode
                });
            }

            const returnData = {
                isNotChange: isNotChange,
                data: returnTableData
            }
            return returnData
        },
        resetData(overviewDataSetted = null) {
            let tmpInitList = []
            saleOrderData.items.forEach((data) => {
                const tmpInitObj = {
                    orderProdId: toString(data.orderProdId, false, true),
                    orderId: toString(data.orderId, false, true),
                    prodCode: toString(data.prodCode, false, true),
                    qty: toString(data.qty, false, false),
                    prodConvId: toString(data.prodConvId, false, true),
                    netPriceEx: toString(data.netPriceEx, false, false),
                    transferPrice: toString(data.transferPrice, false, false),
                    netPriceInc: toString(data.netPriceInc, false, false),
                    additionalPrice: toString(data.additionalPrice, false, false),
                    itemType: toString(data.itemType, false, true),
                    netValue: toString(data.netValue, false, false),
                    sapItemNo: toString(data.sapItemNo, false, true),
                    prodAltUnit: toString(data.prodAltUnit, false, false),
                    prodNameTh: toString(data.prodNameTh, false, true),
                    prodCateCode: toString(data.prodCateCode, false, true),
                }
                tmpInitList.push(tmpInitObj)
            })

            const overviewData = overviewDataSetted ? overviewDataSetted : getOverViewData()
            let returnTableData = []
            tmpInitList.forEach(element => {
                let tmpEle = element;
                tmpEle.plantCode = toString(overviewData.plantCode, false, false)
                tmpEle.shipCode = toString(overviewData.shipCode, false, false)
                if (!tmpEle.qty) tmpEle.qty = "0"
                if (!tmpEle.additionalPrice) tmpEle.additionalPrice = "0"
                if (!(tmpEle.additionalPerUnit && Number(tmpEle.additionalPerUnit) != 0)) tmpEle.additionalPerUnit = null
                returnTableData.push(tmpEle)
            });

            setInitTotalData(null)
            setTableData(tmpInitList)

            const returnData = {
                isNotChange: true,
                data: returnTableData
            }
            return returnData
        },
        clearTableData() {
            clearTotal()
            setTableData([])
        }
    }));
    const searchProductByCustSaleId = async (CustSaleId) => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                CustSaleId: CustSaleId
            }
        }
        const jsonResponse = await callAPI(apiPath.searchProductByCustSaleId, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : []
        setProductData(data)
        setProductSelectData(formatObjForSelect(data, ["prodCode", "prodCateCode"], "prodNameTh"))
    }
    const searchProductConversion = async (prodCode) => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                prodCode: prodCode
            }
        }
        const jsonResponse = await callAPI(apiPath.searchProductConversion, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : []
        setUnitData(data)
        setUnitSelectData(formatObjForSelect(data, "prodConvId", "altUnit"))
    }
    const openAddModal = () => {
        const overviewData = getOverViewData()
        setShowModal(true)
        searchProductByCustSaleId(overviewData.custSaleId)
    }
    const closeAddModal = () => {
        setShowModal(false)
        setProductData([])
        setProductSelectData([])
        setUnitSelectData([])
        setSelectedProductData(null)
    }
    const onChangeProduct = (value) => {
        if (value && value.split("|").length == 2) {
            const valuePart = value.split("|");
            const findObj = productData.find(el => el.prodCode == valuePart[0] && el.prodCateCode == valuePart[1])
            setSelectedProductData(findObj)
            searchProductConversion(findObj.prodCode)
        } else {
            setSelectedProductData(null)
            setUnitSelectData([])
        }
    }

    const onChangeQty = (value, index) => {
        let tmpList = [...tableData]
        tmpList[index].qty = value;
        setTableData(tmpList)
        clearTotal()
    }

    const onChangeAdditionalPrice = (value, index) => {
        let tmpList = [...tableData]
        tmpList[index].additionalPrice = value;
        if (!value || (value && Number(value) == 0)) tmpList[index].additionalPerUnit = "";
        else if (!tmpList[index].additionalPerUnit) tmpList[index].additionalPerUnit = "1"
        setTableData(tmpList)
        clearTotal()
    }
    const onChangePer = (value, index) => {
        let tmpList = [...tableData]
        tmpList[index].additionalPerUnit = value;
        setTableData(tmpList)
        clearTotal()
    }

    const handleDelete = (index) => {
        customAlert(msg.confirmDelete, "Q", async () => {
            let tmpList = [...tableData]
            tmpList.splice(index, 1);
            setTableData(tmpList)
            clearTotal()
        });
    }

    const renderTableItem = () => {
        if (tableData && tableData.length > 0) {
            let renderList = []
            let qty = 0
            let netValue = 0
            tableData.forEach((data, index) => {
                qty += Number(data && data.qty ? data.qty : "0")
                netValue += Number(data && data.netValue ? data.netValue : "0")

                renderList.push(
                    <tr>
                        <td>
                            {data && data.prodCode ? data.prodCode : ""}
                        </td>
                        <td className="text-left">
                            {data && data.prodCateCode ? data.prodCateCode : ""}
                        </td>
                        <td className="text-left">
                            {data && data.prodNameTh ? data.prodNameTh : ""}
                        </td>
                        <td>
                            <TextField
                                numberComma
                                defaultValue={data && data.qty ? data.qty : ""}
                                onChange={(value) => onChangeQty(value, index)}
                                allowChar="num"
                                maxLength={12}
                                disabled={addByQuotationNo}
                            />
                        </td>
                        <td>
                            {data && data.prodAltUnit ? data.prodAltUnit : ""}
                        </td>
                        <td>
                            {data && data.netPriceEx ? parseFloat(data.netPriceEx).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                        </td>
                        <td>
                            <TextField
                                decimalFormat
                                isAllowed={999999.99}
                                defaultValue={data && data.additionalPrice ? data.additionalPrice : ""}
                                onChange={(value) => onChangeAdditionalPrice(value, index)}
                                allowChar="num dot"
                                disabled={addByQuotationNo || isHaveSapOrderNo}
                            />
                        </td>
                        <td>
                            <TextField
                                decimalFormat
                                isAllowed={999999.99}
                                defaultValue={data && data.additionalPerUnit ? data.additionalPerUnit : ""}
                                onChange={(value) => onChangePer(value, index)}
                                allowChar="num dot"
                                disabled={addByQuotationNo || isHaveSapOrderNo || !data.additionalPrice || (data.additionalPrice && Number(data.additionalPrice) == 0)}
                            />
                        </td>
                        <td>
                            {data && data.netPriceInc ? parseFloat(data.netPriceInc).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                        </td>
                        <td>
                            {data && data.netValue ? parseFloat(data.netValue).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                        </td>
                        <td>
                            {data && data.transferPrice ? parseFloat(data.transferPrice).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                        </td>
                        <td>
                            {data && data.itemType ? data.itemType : ""}
                        </td>
                        <td>
                            {addByQuotationNo ?
                                <FontAwesomeIcon icon={faTrashAlt} className="iconTable faDisabled ml-1" title="Delete" />
                                :
                                <FontAwesomeIcon icon={faTrashAlt} className="iconTable faDel ml-1" title="Delete" onClick={() => handleDelete(index)} />
                            }
                        </td>
                    </tr>)
            })

            let totalData = {
                qty: qty,
                netValue: netValue,
            }
            if (initTotalData) {
                totalData = initTotalData
            } else {
                setInitTotalData(totalData)
            }

            renderList.push(
                <tr>
                    <td colSpan={3} className="text-right bg-gray">
                        {msg.total}
                    </td>
                    <td className="text-center bg-white">
                        {toString(totalData.qty.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), false, false)}
                    </td>
                    <td colSpan={5} className="text-right bg-gray">
                    </td>
                    <td className="text-center bg-white">
                        {toString(totalData.netValue.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), false, false)}
                    </td>
                    <td colSpan={3} className="bg-gray"></td>
                </tr>
            )

            return renderList

        } else {
            return (
                <tr>
                    <td colSpan={12} className="text-center">{msg.tableNoData}</td>
                </tr>
            )
        }
    }

    const handleSave = async () => {
        const inputData = getInputData(modalInput);
        if (!inputData.isInvalid) {
            const findIntable = tableData.find(el => el.prodCode == selectedProductData.prodCode && el.prodCateCode == selectedProductData.prodCateCode && el.prodConvId == inputData.data.prodConvId)
            if (findIntable) {
                return customAlert(msg.productAndUnitDup, "W")
            }

            const findObj = unitData.find(el => el.prodConvId == inputData.data.prodConvId)
            let addData = {
                orderProdId: "",
                orderId: saleOrderData && saleOrderData.saleOrder && saleOrderData.saleOrder.orderId ? toString(saleOrderData.saleOrder.orderId, false, false) : "",
                prodCode: selectedProductData.prodCode,
                qty: inputData.data.qty,
                prodConvId: toString(findObj.prodConvId),
                netPriceEx: "",
                transferPrice: "",
                netPriceInc: "",
                additionalPrice: "",
                additionalPerUnit: "",
                itemType: "",
                netValue: "",
                sapItemNo: "",
                prodAltUnit: findObj.altUnit,
                prodCateCode: selectedProductData.prodCateCode,
                prodNameTh: selectedProductData.prodNameTh,
                // plantCode: "",
                // shipCode: "",
            }
            let tmpList = [...tableData]
            tmpList.push(addData)
            setTableData(tmpList)
            clearTotal()
            closeAddModal()
        }
    }

    const clearTotal = () => {
        setInitTotalData({
            qty: 0,
            netValue: 0,
        })
    }

    if (havingPerm) {
        return (
            <div className={"container py-4" + (isShow ? "" : " d-none")}>
                {!addByQuotationNo ?
                    <div className="row justify-content-end">
                        <div>
                            <Button className="px-5" customLabel={msg.addProduct} onClick={openAddModal} />
                        </div>
                    </div>
                    :
                    null
                }
                <div className="pt-3">
                    <div className="primary-table" style={{ overflow: "auto" }}>
                        <table className="font-normal table table-striped table-bordered " style={{ width: "100%", minWidth: "1200px" }}>
                            <thead>
                                <tr>
                                    <th style={{}}>
                                        {msg.tableProductCode}
                                    </th>
                                    <th style={{}}>
                                        {msg.tableProductCategory}
                                    </th>
                                    <th style={{}}>
                                        {msg.tableDescription}
                                    </th>
                                    <th style={{ width: "10%" }}>
                                        {msg.tableQuantity}
                                    </th>
                                    <th style={{}}>
                                        {msg.tableUnit}
                                    </th>
                                    <th style={{}}>
                                        {msg.tableNetPrice1}
                                    </th>
                                    <th style={{ width: "10%" }}>
                                        {msg.tableAdditionalPrice}
                                    </th>
                                    <th style={{ width: "10%" }}>
                                        {msg.per}
                                    </th>
                                    <th style={{}}>
                                        {msg.tableNetPrice2}
                                    </th>
                                    <th style={{}}>
                                        {msg.tableNetValue}
                                    </th>
                                    <th style={{}}>
                                        {msg.tableTransferPrice}
                                    </th>
                                    <th style={{}}>
                                        {msg.tableItemType}
                                    </th>
                                    <th style={{ width: "3%" }}>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderTableItem()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Modal
                    isShow={showModal}
                    onClose={closeAddModal}
                    title={msg.product}
                    hideFooter
                >
                    <div className="row">
                        <div className="col-12">
                            <Select
                                label={msg.product}
                                options={productSelectData}
                                onChange={onChangeProduct}
                                ref={el => modalInput.current.prodCode = el}
                                require
                            />
                        </div>
                        <div className="col-12 mt-2">
                            <div className="primaryLebel">
                                {msg.description}
                            </div>
                            <div className="primaryLebel px-2">
                                {selectedProductData && selectedProductData.prodNameTh ? toString(selectedProductData.prodNameTh, true) : "-"}
                            </div>
                        </div>
                        <div className="col-6 mt-2">
                            <TextField
                                maxLength={12}
                                label={msg.quantity}
                                allowChar="num"
                                ref={el => modalInput.current.qty = el}
                                require
                                numberComma
                            />
                        </div>
                        <div className="col-6 mt-2">
                            <Select
                                label={msg.tableUnit}
                                options={unitSelectData}
                                ref={el => modalInput.current.prodConvId = el}
                                require
                            />
                        </div>
                        <div className="row col-12 mt-4 mb-2 justify-content-center">
                            <div>
                                <Button type="add" className="px-4" onClick={handleSave} />
                            </div>
                        </div>
                    </div>
                </Modal>
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
export default forwardRef(Main)