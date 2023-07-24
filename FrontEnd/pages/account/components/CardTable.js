import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react"
import { changeArray, toString, getInputData } from "@utils/helper";
import { Collapse } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Checkbox, useCheckboxState } from "reakit/Checkbox";
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { faArrowAltCircleLeft, faArrowAltCircleRight } from '@fortawesome/free-regular-svg-icons'
import { Dropdown } from 'react-bootstrap';
import Image from 'next/image'
import Button from "@components/Button";
import * as msg from '@msg'
import { css } from "emotion";

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
            if (values && items.state.length === values.length) {
                items.setState([]);
            } else {
                items.setState(items.state);
            }
        } else if (group.state === "indeterminate") {
            items.setState(items.state);
        }
    }, [group.state]);

    // updates group when items is toggled
    useEffect(() => {
        if (items.state == null) {

        }
        else {
            if (values && items.state.length === values.length) {
                group.setState(true);
            }
            else if (items.state.length) {
                group.setState(false);
            }
            else {
                group.setState(false);
            }
        }
    }, [items.state]);

    return { group, items };
}

function CardTable(props, ref) {
    const {
        headerLabel,
        dataMapper,
        tableData = null,
        onSelectPage,
        statusData = [],
        onClickCard,
        hideStatus = false,
        isRentstation = false,
        dataPerPage = 9,
        defaultStatus = []
    } = props;

    const statusRef = useRef([]);
    const [isOpenCard, setIsOpenCard] = useState([]);
    const [statusList, setStatusList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const { group, items } = useTreeState(statusData);

    const paggingCriteria = {
        searchOption: 0,
        searchOrder: 1,
        startRecord: 0,
        length: dataPerPage,
        pageNo: 1,
        model: {}
    }

    let detailOfPage = [];
    let indexOfFirst = 0
    let indexOfLast = 0
    let totalRecords = 0
    let totalPages = 0;

    if (tableData != null) {
        if (tableData.records && tableData.records.length != 0) {
            detailOfPage = tableData.records
        }
        indexOfFirst = tableData.recordStart;
        indexOfLast = currentPage * tableData.recordPerPage;
        totalRecords = tableData.totalRecords;
        totalPages = tableData.totalPages;
    }

    useImperativeHandle(ref, () => ({
        getJsonReq() {
            setCurrentPage(1)
            let jsonRequest = { ...paggingCriteria };
            jsonRequest.pageNo = 1;
            jsonRequest.model.prospectStatusLst = getStatusListCriteria()
            return jsonRequest;
        },
        clear() {
            setCurrentPage(1)
        }
    }));
    const getStatusListCriteria = () => {
        let statusForSearch = []
        statusList.forEach((value) => {
            if (value) {
                statusForSearch.push(toString(value.lovKeyvalue, false, false))
            }
        })
        return statusForSearch
    }
    const togleCard = (index) => {
        setIsOpenCard(changeArray(isOpenCard, index, !isOpenCard[index]));
    }

    const resetOpenCard = () => {
        let tmpArr = [];
        for (let i = 0; i < isOpenCard.length; i++) {
            tmpArr.push(false);
        }
        setIsOpenCard(tmpArr);
    }

    function changePagging(page) {
        setCurrentPage(Number(page))
        let jsonRequest = { ...paggingCriteria };
        jsonRequest.pageNo = page;
        jsonRequest.model.prospectStatusLst = getStatusListCriteria()

        onSelectPage(jsonRequest)
        resetOpenCard();
    }

    const CustomToggle = forwardRef(({ children, onClick }, ref) => (
        <a
            className="row align-items-center disAStyle"
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        >
            {children}
        </a>
    ));

    function onFilterClick(item) {
        if (statusList.length == 0) {
            group.setState(true)
        }
        else {
            items.setState(statusList)
        }
    }
    function onFilterConfirm(item) {
        let statusForSearch = []
        item.forEach((value) => {
            statusForSearch.push(toString(value.lovKeyvalue, false, false))
        })
        setStatusList(item)
        let jsonRequest = { ...paggingCriteria };
        jsonRequest.pageNo = 1;
        jsonRequest.model.prospectStatusLst = statusForSearch
        setCurrentPage(1)
        onSelectPage(jsonRequest)
        resetOpenCard();
    }

    const checkboxStyle = css`
        appearance: none;
        border: 1px solid #d9d9d9;
        border-radius: 5px;
        cursor: pointer;
        width: 20px;
        height: 20px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        margin-right: 5px;
        &:after {
            content: "✔";
            display: none;
            color: white;
            font-size: 70%;
            display: inline-flex;
        }
        &:checked {
            background-color: #00AB4E;
            border: 1px solid #d9d9d9;
            &:after {
            display: block;
            }
        }
        `;

    function checkBoxStatus(data) {
        return (
            <div>
                <Checkbox {...items} value={data} className={checkboxStyle} /> {data.lovNameTh}
            </div>
        )
    }

    function getStatusData(status) {
        var result = statusData.find(obj => {
            return toString(obj.lovKeyvalue, false, false) === toString(status);
        })
        return result;
    }

    const handleOnClickCard = (data) => {
        if (onClickCard instanceof Function) {
            onClickCard(data)
        }
    }

    const cardItem = (data, index = 0) => {
        const statusData = getStatusData(data[dataMapper.prospectDataKey][dataMapper.status])
        const statusName = statusData && statusData.lovNameTh ? statusData.lovNameTh : "-"
        const statusColorPart = statusData && statusData.condition1 && statusData.condition1.split("|").length == 2 ? statusData.condition1.split("|") : ["#E5F7ED", "#00AB4E"];
        let headerCode = ""
        if (dataMapper.code == "custCode") {
            headerCode = toString(data[dataMapper.accountDataKey][dataMapper.code], false, true);
        } else if (dataMapper.code == "prospectId") {
            headerCode = toString(data[dataMapper.prospectDataKey][dataMapper.code], false, true);
        }
        else if (dataMapper.code == "both") {
            if (data[dataMapper.accountDataKey].custCode) {
                headerCode = toString(data[dataMapper.accountDataKey].custCode, false, true);
            } else {
                headerCode = toString(data[dataMapper.prospectDataKey].prospectId, false, true);
            }
        }
        return (
            <div className="col-12 col-md-6 col-lg-4">
                <div className="cardItem">
                    <div className="cursor-pointer" onClick={() => handleOnClickCard(data)}>
                        <div className="cardItemHeader">
                            <div className="cardItemHeaderLabel">
                                <Image src="/img/icon/icon-account.png" width="24" height="24" />
                                <span className="ml-1">
                                    {headerCode}
                                </span>
                            </div>
                            {!hideStatus ?
                                isRentstation ?
                                    <div className="cardItemHeaderStatus" style={{ backgroundColor: "#DDF7FF", color: "#00BAF3" }}>
                                        ปั๊มเช่า
                                    </div>
                                    :
                                    <div className="cardItemHeaderStatus" style={{ backgroundColor: statusColorPart[0], color: statusColorPart[1] }}>
                                        {statusName}
                                    </div>
                                :
                                statusData && statusData.lovKeyvalue == 6 ?
                                    <div className="cardItemHeaderStatus" style={{ backgroundColor: "#DDF7FF", color: "#00BAF3" }}>
                                        ปั๊มเช่า
                                    </div>
                                    :
                                    null
                            }
                        </div>
                        <div className="cardItemBody">
                            <h1>{toString(data[dataMapper.accountDataKey][dataMapper.primaryData], true, true)}</h1>
                        </div>
                    </div>

                    <Collapse key={index} in={isOpenCard[index]}>
                        <div className="cardItemFooter">
                            {dataMapper.bu ?
                                <div className="row">
                                    <div className="bu-icon">
                                        BU
                                    </div>
                                    <span className="ml-1">
                                        {toString(data[dataMapper.prospectDataKey][dataMapper.bu], true, true)} : {toString(data[dataMapper.buNameKey], true, true)}
                                    </span>
                                </div>
                                : null
                            }
                            <div className="row">
                                <Image src="/img/icon/icon-phone.png" width="24" height="24" />
                                <span className="ml-1">
                                    {toString(data[dataMapper.addressDataKey][dataMapper.telNo], true, true)}
                                </span>
                            </div>
                            <div className="row">
                                <Image src="/img/icon/icon-printer.png" width="24" height="24" />
                                <span className="ml-1">
                                    {toString(data[dataMapper.addressDataKey][dataMapper.faxNo], true, true)}
                                </span>
                            </div>
                            <div className="row pb-3">
                                <Image src="/img/icon/icon-location.png" width="24" height="24" />
                                <span className="ml-1">
                                    {toString(data[dataMapper.addressDataKey][dataMapper.lat], true, true)} , {toString(data[dataMapper.addressDataKey][dataMapper.long], true, true)}
                                </span>
                            </div>
                        </div>
                    </Collapse>
                </div>
                <div className="cardItemToggleContainer">
                    <div className={"cardItemToggle" + (isOpenCard[index] ? " open" : "")} onClick={() => togleCard(index)}>
                        <div className="arrow" />
                    </div>
                </div>
            </div >
        )
    }



    return (
        <div className="cardTableBackground row">
            <div className="row col-12">
                <span className="h2">
                    {headerLabel}
                </span>
            </div>
            <div className="row col-12">
                <div className="col-6 p-0">
                    <div className="primaryLabel">
                        {msg.cardTableShowing} {totalRecords} {msg.cardTableTasks}
                    </div>
                </div>
                <div className="col-6 d-flex justify-content-end p-0">
                    <div className="primaryLabel">
                        {msg.cardTablePage} {currentPage} {msg.cardTableOf} {totalPages}
                    </div>

                    {!hideStatus && !isRentstation ?
                        <Dropdown>
                            <Dropdown.Toggle as={CustomToggle} id="dropdown-basic" >
                                <div className="row align-items-center pl-2 noselect" onClick={() => onFilterClick(items.state)}>
                                    <FontAwesomeIcon icon={faFilter} className="navBarIcon" color="#777" size="xs" />
                                    <div className="primaryLabel pl-1">
                                        {msg.cardTableFilter}
                                    </div>
                                </div>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-filter-custom">
                                <div>
                                    <Checkbox {...group} className={checkboxStyle} /> ทั้งหมด
                                </div>
                                {statusData.map((data) => {
                                    return checkBoxStatus(data)
                                })}
                                <Dropdown.Item className="row col-12 p-0 mt-2 filter-menu-item">
                                    <Button type="confirm" onClick={() => onFilterConfirm(items.state)} />
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        :
                        null
                    }
                </div>
            </div>
            <div className="row col-12 transition">

                {currentPage == 1 ?
                    <div className="disabledIndiCatorPreviousPage noselect">
                        <div className="pageIndecator">

                            <FontAwesomeIcon icon={faArrowAltCircleLeft} className="cardTablePaging" />
                            {/* BACK */}
                        </div>
                    </div>
                    :
                    <div className="cardTablePreviousPage noselect" onClick={() => changePagging(currentPage - 1)}>
                        <div className="pageIndecator">
                            <FontAwesomeIcon icon={faArrowAltCircleLeft} className="cardTablePaging" />
                        </div>
                    </div>
                }
                <div className="cardItemContainer row col-12">
                    {detailOfPage && detailOfPage.length != 0 ?
                        detailOfPage.map((data, index) => {
                            return cardItem(data, index)
                        })
                        :
                        <div className="d-flex col-12 justify-content-center align-items-center">
                            <span className="m-0 h2 font-color-grey">{msg.tableNoData}</span>
                        </div>
                    }
                </div>

                {currentPage == totalPages || totalPages == 0 ?
                    <div className="disabledIndiCatorNextPage noselect">
                        <div className="pageIndecator">
                            <FontAwesomeIcon icon={faArrowAltCircleRight} className="cardTablePaging" />
                        </div>
                    </div>
                    :
                    <div className="cardTableNextPage noselect" onClick={() => changePagging(currentPage + 1)}>
                        <div className="pageIndecator">
                            <FontAwesomeIcon icon={faArrowAltCircleRight} className="cardTablePaging" />
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default forwardRef(CardTable)