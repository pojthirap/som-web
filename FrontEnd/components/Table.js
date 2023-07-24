import { useImperativeHandle, useState, useEffect, forwardRef } from "react"
import Button from "@components/Button"
import { Checkbox, useCheckboxState } from "reakit/Checkbox";
import { faEdit, faTrashAlt, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { faPlusCircle, faQrcode } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { formatDate, formatDateTime, formatFullDateTime, convertFormatFullDateTime, formatDateNotTime } from "@helper";
import * as msg from "@msg";

const paggingCriteria = {
    searchOption: 0,
    searchOrder: 0,
    startRecord: 0,
    length: 10,
    pageNo: 1,
}

function useTreeState(values) {
    let group = useCheckboxState({ state: false });
    let items = useCheckboxState({ state: [] });

    useEffect(() => {
        group.setState(false);
        items.setState([]);
    }, [values]);

    // updates items when group is toggled
    useEffect(() => {
        if (group.state === true) {
            items.setState(values);
        } else if (group.state === false) {
            items.setState([]);
        }
    }, [group.state]);

    // updates group when items is toggled
    useEffect(() => {
        if (values && items.state.length === values.length) {
            group.setState(true);
        } else if (items.state.length) {
            group.setState("indeterminate");
        } else {
            group.setState(false);
        }
    }, [items.state]);

    return { group, items };
}

function ComponentTable(props, ref) {

    const {
        onSelectPage
        , dataTable
        , headerTabel
        , multiBtn = false
        , multiBtnType = "primary"
        , multiBtnFunction
        , multiBtnLabel
        , btn = false
        , btnType = "primary"
        , btnDisableWhenEmpty = false
        , btnFunction
        , btnLabel
        , label = false
        , customLabel
        , tablewidth = "100%"
        , hideGoToPage = false
        , hidePerPage = false
        , textHeaderBold = false
        , hideTable = false
    } = props;

    const [currentPage, setCurrentPage] = useState(1);

    let detailOfPage = null;
    let indexOfFirst = 0
    let indexOfLast = 0
    let totalRecords = 0
    let totalPages = 0;

    if (dataTable != null) {
        if (dataTable.records.length != 0) {
            detailOfPage = dataTable.records
        }
        indexOfFirst = dataTable.recordStart;
        indexOfLast = currentPage * dataTable.recordPerPage;
        totalRecords = dataTable.totalRecords;
        totalPages = dataTable.totalPages;
    }

    useEffect(() => {
        setSelectPage(currentPage)
    }, [currentPage]);

    useImperativeHandle(ref, () => ({
        getJsonReq() {
            setCurrentPage(1)
            paggingCriteria.pageNo = 1;
            return paggingCriteria;
        },
        clear() {
            setCurrentPage(1)
        }
    }));

    const [selectPage, setSelectPage] = useState(1);


    const getLOV = async (key, callAPI) => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                lovKeyword: key
            }
        }
        const jsonResponse = await callAPI(apiPath.getConfigLov, jsonRequest)
        if (!(listData && listData.data && listData.data.records)) return [];
        return listData.data.records;
    }

    const changePagging = (page) => {
        setCurrentPage(Number(page))
        paggingCriteria.pageNo = page
        onSelectPage(paggingCriteria)
    }

    function row() {
        var rows = [];
        if (totalPages > 5) {
            if (currentPage > (totalPages - 2)) {
                rows.push(<li key={1} className="page-item"><a className="page-link default">...</a></li>);
                for (let i = (totalPages - 4); i <= totalPages; i++) {
                    rows.push(<li key={i} className="page-item"><a onClick={() => changePagging(i)} className={"page-link pageControl pointer" + (currentPage == i ? " active" : "")}>{i}</a></li>)
                }
            }
            else if (currentPage > 3) {
                rows.push(<li key={1} className="page-item"><a className="page-link default">...</a></li>);
                rows.push(<li key={2} className="page-item"><a onClick={() => changePagging(currentPage - 2)} className={"page-link pageControl pointer"}>{currentPage - 2}</a></li>);
                rows.push(<li key={3} className="page-item"><a onClick={() => changePagging(currentPage - 1)} className={"page-link pageControl pointer"}>{currentPage - 1}</a></li>);
                rows.push(<li key={4} className="page-item"><a onClick={() => changePagging(currentPage)} className={"page-link pageControl pointer active"}>{currentPage}</a></li>);
                rows.push(<li key={5} className="page-item"><a onClick={() => changePagging(currentPage + 1)} className={"page-link pageControl pointer"}>{currentPage + 1}</a></li>);
                rows.push(<li key={6} className="page-item"><a onClick={() => changePagging(currentPage + 2)} className={"page-link pageControl pointer"}>{currentPage + 2}</a></li>);
                rows.push(<li key={7} className="page-item"><a className="page-link default">...</a></li>);
            }
            else {
                for (let i = 1; i <= 5; i++) {
                    rows.push(<li key={i} className="page-item"><a onClick={() => changePagging(i)} className={"page-link pageControl pointer" + (currentPage == i ? " active" : "")}>{i}</a></li>)
                }
                rows.push(<li key={6} className="page-item"><a className="page-link default">...</a></li>);
            }
        }
        else {
            for (let i = 1; i <= totalPages; i++) {
                rows.push(<li key={i} className="page-item"><a onClick={() => changePagging(i)} className={"page-link pageControl pointer" + (currentPage == i ? " active" : "")}>{i}</a></li>)
            }
        }
        return rows;
    }

    function tableDataDetail(header, detail, index, rowIndex) {
        let detailData = "";
        let rowNum = (paggingCriteria.length * (currentPage - 1)) + rowIndex + 1;
        if (Array.isArray(header.data)) {
            header.data.forEach((dataKey, index) => {
                detailData += (index > 0 ? (header.dataSeparator ? header.dataSeparator : " ") : "") + detail[dataKey];
            });
        } else {
            detailData = detail[header.data];
        }
        let headerType = header.type ? header.type.replaceAll(" ", "") : "string";
        if (headerType == "number") return <td key={index} className="text-center">{detailData ? detailData.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : detailData}</td>
        else if (headerType == "image") return <td key={index} className="text-center"><img src={`${process.env.apiPath}${detailData}`} width="150" height="150"></img></td>
        else if (headerType == "decimal") return <td key={index} className="text-center">{detailData ? detailData.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : detailData}</td>
        else if (headerType == "code") return <td key={index} className="text-center">{detailData}</td>
        else if (headerType == "text-center") return <td key={index} className="text-center">{detailData}</td>
        else if (headerType == "flagY") return <td key={index} className="text-center">{detailData == "Y" ? msg.yes : msg.no}</td>
        else if (headerType == "headerRowCustomPadding") return <td key={index} className={(detail.type == "month" ? "headerMonth" : "") + (detail.type == "cust" ? "headerCust" : "") + (detail.type == "emp" ? "headerEmp" : "") + (detail.type == "group" ? "headerGroup" : "")}>{detailData}</td>
        else if (headerType == "string") return <td key={index} className="text-left">{detailData}</td>
        else if (headerType == "rowNum") return <td key={index} className="text-center">{rowNum}</td>
        else if (headerType == "enum") return <td key={index} className="text-center">{header.enum[detailData]}</td>
        else if (headerType == "date") return <td key={index} className="text-center">{detailData ? formatDate(detailData, 'DD/MM/YYYY') : ""}</td>
        else if (headerType == "useFlag") return <td key={index} className="text-center">{detailData ? (detailData == "Y" ? msg.tableActive : msg.tableInActive) : "-"}</td>
        else if (headerType == "dateTime") return <td key={index} className="text-center">{detailData ? formatDateTime(detailData) : ""}</td>
        else if (headerType == "fullDateTime") return <td key={index} className="text-center">{detailData ? formatFullDateTime(detailData) : ""}</td>
        else if (headerType == "convertFullDateTime") return <td key={index} className="text-center">{detailData ? convertFormatFullDateTime(detailData) : ""}</td>
        else if (headerType == "dateNotTime") return <td key={index} className="text-center">{detailData ? formatDateNotTime(detailData) : ""}</td>
        else if (headerType == "button") {
            const allowHeaderUpper = header.button.toUpperCase();
            return <td key={index} className="text-center">
                {allowHeaderUpper.match("QR") ? <FontAwesomeIcon icon={faQrcode} className="iconTable faQrCode" onClick={() => header.genFunction(detail)} /> : null}
                {allowHeaderUpper.match("ADD") ? <FontAwesomeIcon icon={faPlusCircle} className="iconTable faAddEdit" onClick={() => header.addFunction(detail)} /> : null}
                {allowHeaderUpper.match("EDIT") ? <FontAwesomeIcon icon={faEdit} className="iconTable faAddEdit ml-1" title="Edit" onClick={() => header.editFunction(detail)} /> : null}
                {allowHeaderUpper.match("DELETE") ? <FontAwesomeIcon icon={faTrashAlt} className="iconTable faDel ml-1" title="Delete" onClick={() => header.deleteFunction(detail)} /> : null}
                {allowHeaderUpper.match("SELECT") ? <FontAwesomeIcon icon={faCheckCircle} className="iconTable faAddEdit ml-1" title="Select" onClick={() => header.selectFunction(detail)} /> : null}


            </td>
        }
    }

    function selectIndex() {
        let index = [];
        for (let i = 1; i <= totalPages; i++) {
            index.push(<option key={i}> {i} </option>)
        }
        return index;
    }

    const { group, items } = useTreeState(detailOfPage);

    return (
        dataTable != undefined ? (
            <div>
                {!hideTable ?
                    <div>
                        {label || customLabel || btn ?
                            <div className="row mb-4" style={{ height: "2.7rem" }}>
                                {label || customLabel ?
                                    <div className="col-6 d-flex justify-content-start align-items-end">
                                        <h5 className="mb-0">{customLabel || msg.tableShowSearchResult}</h5>
                                    </div> : null
                                }
                                {btn || multiBtn ?
                                    <div className="col-6 d-flex justify-content-end p-0">
                                        {multiBtn ?
                                            <div className="pl-1">
                                                <Button type={multiBtnType} customLabel={multiBtnLabel} onClick={() => multiBtnFunction(items.state)} disabled={!(items.state && items.state.length > 0)} />
                                            </div>
                                            : null
                                        }
                                        {btn ?
                                            <div className="pl-1">
                                                <Button type={btnType} customLabel={btnLabel} onClick={() => btnFunction()} disabled={detailOfPage == null && btnDisableWhenEmpty} />
                                            </div>
                                            : null
                                        }
                                    </div> : null
                                }
                            </div> : null
                        }
                        <div className="primary-table">
                            <table style={{ width: tablewidth }} className="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        {multiBtn ?
                                            <th>
                                                <Checkbox {...group} />
                                            </th> : null
                                        }
                                        {headerTabel.map((header, index) => (
                                            <th key={index} style={{ backgroundColor: header.color, width: header.width, textAlign: header.textAlign }} className={textHeaderBold ? "header-table-bold" : ""}>{header.title} {header.title2 ? <div>{header.title2}</div> : null} {header.title3 ? <div>{header.title3}</div> : null} {header.title4 ? <div>{header.title4}</div> : null} </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailOfPage != null ? detailOfPage.map((detail, i) => (
                                        <tr key={i}>
                                            {multiBtn ?
                                                <td>
                                                    <Checkbox {...items} value={detail} />
                                                </td> : null
                                            }
                                            {headerTabel.map((header, index) => (
                                                tableDataDetail(header, detail, index, i)
                                            ))}
                                        </tr>
                                    )) :
                                        <tr>
                                            <td colSpan={headerTabel.length + (multiBtn ? 1 : 0)} className="text-center">{msg.tableNoData}</td>
                                        </tr>}
                                </tbody>
                            </table>
                        </div>
                        {detailOfPage != null ?
                            <div>
                                {!hidePerPage ?
                                    <div className="row my-3">
                                        <div className="col-4">{msg.tableShowing} {indexOfFirst} {msg.tableTo} {indexOfLast > totalRecords ? totalRecords : indexOfLast} {msg.tableOf} {totalRecords} {msg.tableEntries}</div>
                                        <div className="col-8 d-flex align-items-center justify-content-end row noselect">
                                            <div>
                                                <nav aria-label="Page navigation example ">
                                                    <ul className="pagination">
                                                        <li className="page-item">
                                                            {currentPage == 1 ?
                                                                <a
                                                                    className="page-link not-allowed">
                                                                    <span aria-hidden="true">«</span>
                                                                </a>
                                                                :
                                                                <a
                                                                    onClick={() => changePagging(currentPage - 1)}
                                                                    className="page-link pointer" >
                                                                    <span aria-hidden="true">«</span>
                                                                </a>
                                                            }

                                                        </li>
                                                        {row()}
                                                        <li className="page-item">
                                                            {currentPage == totalPages ?
                                                                <a
                                                                    className="page-link not-allowed">
                                                                    <span aria-hidden="true">»</span>
                                                                </a>
                                                                :
                                                                <a
                                                                    onClick={() => changePagging(currentPage + 1)}
                                                                    className="page-link pointer">
                                                                    <span aria-hidden="true">»</span>
                                                                </a>
                                                            }
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                            {!hideGoToPage ?
                                                <div className="border-left row">
                                                    <div className="pl-3 pr-3 border-left align-items-center d-flex">
                                                        <span>{msg.tableGotoPage}</span>
                                                    </div>
                                                    <div className="pr-3">
                                                        <select className="form-control p-1" value={selectPage} onChange={(e) => { setSelectPage(e.target.value) }}>
                                                            {selectIndex()}
                                                        </select>
                                                    </div>
                                                    <div style={{ width: 50 }} className="pl-1 text-left">
                                                        <Button type="go" className="px-2" onClick={() => changePagging(selectPage)}></Button>
                                                    </div>
                                                </div>
                                                : null}
                                        </div>
                                    </div> : null}
                            </div> : null}
                    </div>
                    :
                    <div style={{ fontSize: "1.25rem", fontWeight: "bold" }} className="col-12 d-flex justify-content-center">
                        {msg.tableNoData}
                    </div>
                }
            </div>
        ) : null

    )
}

export default forwardRef(ComponentTable)