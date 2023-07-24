import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { SortableContainer, SortableElement, sortableHandle } from "react-sortable-hoc";
import { toString } from "@helper";
import TextField from "@components/TextField";
import Checkbox from "@components/Checkbox"
import Select from "@components/Select"
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import * as msg from "@msg";

const paggingCriteria = {
    searchOption: 0,
    searchOrder: 0,
    startRecord: 0,
    length: 0,
    pageNo: 1,
}
function Index(props, ref) {
    const {
        dataTable = [],
        headerTabel = [],
        manageData,
        disabledInput = false
    } = props;
    const [items, setItems] = useState(dataTable);

    useEffect(() => {
        if (items != dataTable) setItems(dataTable);

    }, [dataTable])

    useImperativeHandle(ref, () => ({
        getJsonReq() {
            return paggingCriteria;
        },
        clear() {
        },
        getData() {
            return items;
        }
    }));

    const generateOptionForIndexSelect = (index, length) => {
        let tmpArr = [];
        for (let i = 1; i <= index; i++) tmpArr.push({ value: toString(i), label: toString(i) });
        return tmpArr;
    }

    function tableDataDetail(header, detail, index, rowIndex, rowLength) {
        let detailData = "";
        if (Array.isArray(header.data)) {
            header.data.forEach((dataKey, indexA) => {
                detailData += (indexA > 0 ? (header.dataSeparator ? header.dataSeparator : " ") : "") + detail[dataKey];
            });
        } else {
            detailData = detail[header.data];
        }
        let headerType = header.type ? header.type.replaceAll(" ", "") : "string";
        if (headerType == "number") return <td key={index} style={{ width: header.width }} className="text-center">{detailData}</td>
        else if (headerType == "code") return <td key={index} style={{ width: header.width }} className="text-center">{detailData}</td>
        else if (headerType == "flagY") return <td key={index} style={{ width: header.width }} className="text-center">{detailData == "Y" ? msg.yes : msg.no}</td>
        else if (headerType == "string") return <td key={index} style={{ width: header.width }} className="text-left">{detailData}</td>
        else if (headerType == "button") {
            if (disabledInput) return <td></td>
            const btnType = header.button.toUpperCase();
            return <td key={index} className="text-center" style={{ width: header.width }}>
                {btnType.match("ADD") ? <FontAwesomeIcon icon={faPlusCircle} className="iconTable faAddEdit" onClick={() => header.addFunction(detail)} /> : null}
                {btnType.match("EDIT") ? <FontAwesomeIcon icon={faEdit} className="iconTable faAddEdit ml-1" title="Edit" onClick={() => header.editFunction(detail)} /> : null}
                {btnType.match("DELETE") ? <FontAwesomeIcon icon={faTrashAlt} className="iconTable faDel ml-1" title="Delete" onClick={() => header.deleteFunction(detail)} /> : null}
            </td>
        }
        else if (headerType == "textfieldIndex") {
            return (
                <td
                    key={index}
                    style={{ width: header.width }}
                    className="text-center">
                    <TextField
                        key={index}
                        maxLength={header.maxLength}
                        allowChar={header.allowChar}
                        value={detailData}
                        maxNum={rowIndex}
                        onChange={(text) => onChangText(rowIndex, header, text)}
                        disabled={disabledInput}
                    />
                </td>
            )
        }
        else if (headerType == "selectIndex") {
            return (
                <td
                    key={index}
                    style={{ width: header.width }}
                    className="text-center">
                    <Select
                        key={index}
                        defaultValue={detailData}
                        options={generateOptionForIndexSelect(rowIndex, rowLength)}
                        onChange={(text) => onChangSelect(rowIndex, header, text)}
                        menuPlacement={rowLength - rowIndex < 6 ? "top" : "auto"}
                        disabled={disabledInput}
                    />
                </td>
            )
        }
        else if (headerType == "checkboxY") {
            return (
                <td
                    key={index}
                    style={{ width: header.width }}
                    className="text-center">
                    <Checkbox
                        key={index}
                        defaultValue={detailData == "Y"}
                        onChange={(text) => onChangCheckbox(rowIndex, header, text)}
                        disabled={disabledInput}

                    />
                </td>
            )

        }


    }
    const DragHandle = sortableHandle(() => <div><FontAwesomeIcon icon={faBars} /></div>);

    const SortableItem = SortableElement(({ headerTabel, detail, rowIndex, rowLength }) => {
        return (
            <tr>
                {!disabledInput ?
                    <td style={{ width: "3%" }}><DragHandle /></td>
                    :
                    null
                }
                {headerTabel.map((header, colIndex) => (
                    tableDataDetail(header, detail, colIndex, rowIndex, rowLength)
                ))}
            </tr>

        )
    });

    const SortableList = SortableContainer(({ dataTable, headerTabel }) => {
        return (
            <div className="primary-table">
                <table width="100%" className="table table-striped table-bordered">
                    <thead>
                        <tr>
                            {!disabledInput ?
                                <th style={{ width: "3%" }}>
                                    {msg.move}
                                </th>
                                :
                                null
                            }
                            {headerTabel.map((header, index) => (
                                <th key={index} style={{ width: header.width }}>{header.title}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataTable != null && dataTable.length > 0
                            ? dataTable.map((detail, index) => (
                                <SortableItem key={index} headerTabel={headerTabel} index={index} detail={detail} rowIndex={index} rowLength={dataTable.length} />
                            ))
                            :
                            <tr>
                                <td colSpan={headerTabel.length + 1} className="text-center">{msg.tableNoData}</td>
                            </tr>
                        }

                    </tbody>
                </table>
            </div>
        );
    });

    const arrayMoveMutate = (array, from, to) => {
        array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
    };

    const arrayMove = (array, from, to) => {
        array = array.slice();
        arrayMoveMutate(array, from, to);
        if (manageData instanceof Function) {
            manageData(array)
        }
        return array;
    };
    const onChangText = (index, header, text) => {
        items[index][header.data] = text;
        if (header.manageDataOnChange instanceof Function) {
            setItems(header.manageDataOnChange(items));
        }
    }

    const onChangSelect = (index, header, text) => {
        items[index][header.data] = text;
        if (header.manageDataOnChange instanceof Function) {
            setItems(header.manageDataOnChange(items));
            setItems(arrayMove(items, index, index));
        }
    }

    const onChangCheckbox = (index, header, value) => {
        items[index][header.data] = value ? "Y" : "N";
        if (header.manageDataOnChange instanceof Function) {
            setItems(header.manageDataOnChange(items, index, value));
            setItems(arrayMove(items, index, index));
        }
    }

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setItems(arrayMove(items, oldIndex, newIndex));
    };

    return <SortableList dataTable={items} headerTabel={headerTabel} onSortEnd={onSortEnd} helperClass="sorting-row" useDragHandle />;
};

export default forwardRef(Index);
