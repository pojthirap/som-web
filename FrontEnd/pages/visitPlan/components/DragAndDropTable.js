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
        setDataBack,
        disabledInput = false,
        enableEdit = false
    } = props;
    const [items, setItems] = useState(dataTable);

    useEffect(() => {
        if (items != dataTable) setItems(dataTable);

    }, [dataTable])
    useEffect(() => {
        if (setDataBack instanceof Function) {
            setDataBack(items)
        }
    }, [items])

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

    function tableDataDetail(header, detail, index, rowIndex, rowLength) {
        let detailData = "";
        if (Array.isArray(header.data)) {
            const separator = header.dataSeparator ? header.dataSeparator : " ";
            header.data.forEach((dataKey, indexA) => {
                if (indexA > 0 && detailData != "" && detail[dataKey] != "") detailData += separator;
                detailData += (detail[dataKey] ? detail[dataKey] : "");
            });
            if (detailData.replaceAll(separator, "") == "") {
                detailData = "";
            }
        } else {
            detailData = detail[header.data] ? detail[header.data] : "";
        }
        let headerType = header.type ? header.type.replaceAll(" ", "") : "string";
        if (headerType == "number") return <td key={index} style={{ width: header.width, overflowWrap: "anywhere" }} className="text-center">{detailData}</td>
        else if (headerType == "code") return <td key={index} style={{ width: header.width, overflowWrap: "anywhere" }} className="text-center">{detailData}</td>
        else if (headerType == "flagY") return <td key={index} style={{ width: header.width, overflowWrap: "anywhere" }} className="text-center">{detailData == "Y" ? msg.yes : msg.no}</td>
        else if (headerType == "string") return <td key={index} style={{ width: header.width, overflowWrap: "anywhere" }} className="text-left">{detailData}</td>
        else if (headerType == "button") {
            const btnType = header.button.toUpperCase();
            return <td key={index} className="text-center" style={{ width: header.width }}>
                {btnType.match("EDIT") && (!disabledInput || enableEdit) ? <FontAwesomeIcon icon={faEdit} className="iconTable faAddEdit ml-1" title="Edit" onClick={() => header.editFunction(detail)} /> : null}
                {btnType.match("DELETE") && !disabledInput ? <FontAwesomeIcon icon={faTrashAlt} className="iconTable faDel ml-1" title="Delete" onClick={() => header.deleteFunction(detail)} /> : null}
            </td>
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
                                <th style={{ width: "3%" }} className="header-table-bold">
                                    {msg.move}
                                </th>
                                :
                                null
                            }
                            {headerTabel.map((header, index) => (
                                <th key={index} className="header-table-bold" style={{ width: header.width }}>{header.title}</th>
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

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setItems(arrayMove(items, oldIndex, newIndex));
    };

    return <SortableList dataTable={items} headerTabel={headerTabel} onSortEnd={onSortEnd} helperClass="sorting-row" useDragHandle />;
};

export default forwardRef(Index);
