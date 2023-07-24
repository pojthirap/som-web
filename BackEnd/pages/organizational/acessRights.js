import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import Button from "@components/Button";
import TextField from "@components/TextField";
import Checkbox from "@components/Checkbox"
import CriteriaCard from "@components/CriteriaCard";
import Select from "@components/Select"
import { Collapse } from "react-bootstrap";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
import { getInputData, clearInputData, toString, formatObjForSelect } from "@helper";


export default function UserGroup({ callAPI, customAlert }) {
    const criteriaRef = useRef({});
    const inputRef = useRef({});
    const [permisstionData, setPermisstionData] = useState([]);
    const [permisstionDataForRender, setPermisstionDataForRender] = useState(null)
    const [inputCriteria, setInputCriteria] = useState(null);
    const [admGroupData, setAdmGroupData] = useState([])
    const [admPermData, setAdmPermData] = useState([])
    const [groupAppId, setGroupAppId] = useState(null);
    useEffect(() => {
        searchAdmGroupPerm()
    }, [inputCriteria])

    useEffect(() => {
        searchAdmGroup();
        searchAdmPerm();
    }, [])
    const handleSearch = async () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }

    const searchAdmGroupPerm = async () => {
        if (inputCriteria) {
            const jsonRequest = {
                searchOption: 0,
                searchOrder: 0,
                startRecord: 0,
                length: 0,
                pageNo: 1,
                model: {
                    ...inputCriteria
                }
            }
            const jsonResponse = await callAPI(apiPath.searchAdmGroupPerm, jsonRequest)
            console.log(jsonResponse)
            const data = jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 ? jsonResponse.data.records[0] : null;
            console.log(data)
            if (data && data.groupAppId && data.item && data.item.length > 0) {
                setGroupAppId(data.groupAppId)
                console.log(data.item)
                console.log(data.groupAppId)
                setPermisstionData(data.item)

                let tmpRenderData = {
                    children: {}
                }
                data.item.forEach((element, index) => {
                    tmpRenderData = manageChildren(tmpRenderData, element, data.item, index)
                });
                setPermisstionDataForRender(tmpRenderData)
            } else {
                setGroupAppId("NF")
            }

        }
    }


    const searchAdmGroup = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 2,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                activeFlag: "Y"
            }
        }
        const jsonResponse = await callAPI(apiPath.searchAdmGroup, jsonRequest)
        const data = jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 ? formatObjForSelect(jsonResponse.data.records, "groupId", "groupNameTh") : [];
        setAdmGroupData(data);

    }

    const searchAdmPerm = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.searchAdmPermObject, jsonRequest)
        const data = jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 ? formatObjForSelect(jsonResponse.data.records, "permObjId", "permObjNameTh") : [];
        setAdmPermData(data);
        console.log(jsonResponse)

    }


    function manageChildren(mainData, data, allData, index) {
        data.index = index
        function findParent(parentId, level) {
            let tmpParent = parentId;
            let parentIdArray = []
            for (let i = level; i > 1; i--) {
                const found = allData.find(element => element.permObjId == tmpParent);
                parentIdArray = ["children", toString(found.permObjId, false, false), ...parentIdArray]
                tmpParent = found.parentId
            }

            return parentIdArray;
        }
        if (data.level == 1) {
            mainData = {
                ...data,
                children: mainData.children
            };
        }
        else if (data.level > 1) {
            let pathArr = findParent(data.permObjId, data.level)
            setObj(pathArr, data, mainData)

        }
        return mainData;
    }

    function setObj(pList, value, obj) {
        var schema = obj;  // a moving reference to internal objects within obj
        var len = pList.length;
        for (var i = 0; i < len - 1; i++) {
            var elem = pList[i];
            if (!schema[elem]) schema[elem] = {}
            schema = schema[elem];
        }

        schema[pList[len - 1]] = value;
    }

    const clear = () => {
        clearInputData(criteriaRef)
        setPermisstionDataForRender(null)
        setPermisstionData(null)
        setGroupAppId(null)
    }

    function convertObjToArr(obj) {
        let tmpArr = []
        Object.keys(obj).forEach(key => {
            tmpArr.push(obj[key])
        })
        return tmpArr

    }

    function toggleTree(index) {
        let array = [...permisstionData];
        array[index].open = array[index].open ? false : true;
        setPermisstionData(array);
    }


    const RenderPermission = (data) => {
        if (data.children) {
            return (
                <div>
                    {permisstionData[data.index] ?
                        <div className="permission-with-child">
                            <div className="d-flex">
                                <div className={"toggle-item" + (permisstionData[data.index].open ? " open" : "")} onClick={() => toggleTree(data.index)}>
                                    <div className="arrow" />
                                </div>
                                <PermItem data={data} />
                            </div>
                            <Collapse key={data.permObjId} in={permisstionData[data.index].open ? true : false}>
                                <div>
                                    {convertObjToArr(data.children).map(obj => (
                                        <div>
                                            {RenderPermission(obj)}
                                        </div>
                                    ))}
                                </div>
                            </Collapse>
                        </div> : null}
                </div>
            )
        }
        else {
            return (
                <div className="permission-without-child">
                    <PermItem data={data} />
                </div>
            )
        }
    }
    const PermItem = ({ data }) => {
        //console.log(permisstionData[data.index])
        if (permisstionData[data.index]) {
            return (
                <div>
                    <Checkbox
                        // key={index}
                        defaultValue={permisstionData[data.index].selectedFlag == "Y"}
                        onChange={(value) => onChangCheckbox(data.index, value)}
                        // disabled={disabledInput}
                        label={data.permObjNameTh}
                    />

                </div>
            )
        }
        else {
            return null
        }
    }

    function onChangCheckbox(index, value) {
        let array = [...permisstionData];
        array[index].selectedFlag = value ? "Y" : "N";
        setPermisstionData(array);
        if (value) {
            changeParentFlagToTrue(array[index].parentId)
            changeChildeFlag([array[index].permObjId], true)
        } else {
            changeChildeFlag([array[index].permObjId], false)
        }

    }

    function changeChildeFlag(parentId = [], isCheck = false) {
        let array = [...permisstionData];
        let tmpChildeparentIdArr = []
        for (let i = 0; i < array.length; i++) {
            if (parentId.includes(array[i].parentId)) {
                array[i].selectedFlag = isCheck ? "Y" : "N";
                tmpChildeparentIdArr.push(array[i].permObjId)
            }
        }
        setPermisstionData(array);
        if (tmpChildeparentIdArr.length > 0) {
            changeChildeFlag(tmpChildeparentIdArr, isCheck)
        }

    }

    function changeParentFlagToTrue(parentId) {
        console.log(parentId)
        let array = [...permisstionData];
        for (let i = 0; i < array.length; i++) {
            if (parentId == array[i].permObjId) {
                array[i].selectedFlag = "Y";
                setPermisstionData(array);
                changeParentFlagToTrue(array[i].parentId)
                break;
            }
        }
    }

    const handleSave = async () => {
        console.log(permisstionData)
        let savePermObjIdList = [];
        permisstionData.forEach(obj => {
            if (obj.selectedFlag == "Y") savePermObjIdList.push(toString(obj.permObjId, false, false));
        })
        const jsonRequest = {
            groupAppId: groupAppId,
            permObjId: savePermObjIdList
        }

        const jsonResponse = await callAPI(apiPath.updAdmGroupPerm, jsonRequest)
        if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
            customAlert(msg.saveSuccess)
        }
    }

    return (
        <div className="col-12">
            <CriteriaCard
                onSearch={handleSearch}
                onClear={clear}
            >
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-6 mt-2">
                        <Select
                            label={msg.userGroup}
                            placeholder={msg.pleaseSelect}
                            ref={el => criteriaRef.current.groupId = el}
                            options={admGroupData}
                            require
                        />
                    </div>
                    <div className="col-12 col-md-6 mt-2">
                        <Select
                            label={msg.systemType}
                            placeholder={msg.pleaseSelect}
                            ref={el => criteriaRef.current.appId = el}
                            options={admPermData}
                            require
                        />
                    </div>
                </div>
            </CriteriaCard>
            {groupAppId ?
                <div className="mt-4 mb-4 content-search">
                    <div className="title-search justify-content-between row pb-3">
                        {msg.resultPermisstion}
                    </div>
                    {permisstionDataForRender && groupAppId != "NF" ?
                        <div>
                            <div className="row">
                                <div>
                                    <Button type="save" onClick={handleSave} />
                                </div>
                            </div>
                            <div className="mt-3 mb-4">
                                {RenderPermission(permisstionDataForRender)}
                            </div>
                        </div>
                        :
                        <div className="d-flex justify-content-center">
                            <div className="h4">
                                {msg.tableNoData}
                            </div>
                        </div>
                    }
                </div>
                :
                null
            }
        </div>
    )
}