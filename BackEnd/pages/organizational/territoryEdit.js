import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import Select from "@components/Select";
import { getInputData, clearInputData, formatObjForSelect, toString } from "@helper";
import { useSelector, useDispatch } from 'react-redux'
import Modal from "@components/Modal";
import * as apiPath from "@apiPath";
import * as msg from "@msg";
export default function TerritoryEditPage({ callAPI, getPathValue, customAlert, updateCurrentPathValue }) {
    const pathValue = getPathValue(useSelector((state) => state.pathValue));
    const userProfile = useSelector((state) => state.userProfile);
    const inputRef = useRef({});
    const tableRef = useRef({});
    const dispatch = useDispatch();
    const tableRefByGroupCode = useRef({});
    const [data, setData] = useState();
    const [dataByTerritory, setDataByTerritory] = useState();
    const [showModal, setShowModal] = useState(false);
    const [inputCriteria, setInputCriteria] = useState(null);
    const [selectData, setSelectData] = useState();

    const headerTabel = [
        {
            title: msg.territorySaleGroupCode,
            data: "groupCode",
            type: "code",
            width: "40%"
        },
        {
            title: msg.territorySaleGroupName,
            data: "descriptionTh",
            type: "string",
            width: "40%"
        }
    ]
    const headerTabelByGroupCode = [
        {
            title: msg.numOrder,
            type: "rowNum",
            width: "10%"
        },
        {
            title: msg.territorySaleGroupCode,
            data: "groupCode",
            type: "code ",
            width: "20%"
        },
        {
            title: msg.territorySaleGroupName,
            data: "descriptionTh",
            type: "string",
            width: "60%"
        }
    ]
    useEffect(() => {
        searchEmpByTerritoryId(tableRefByGroupCode.current.getJsonReq());
        searchAdmEmpRoleManager();
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq();
        searchEmpForMapSaleTerritory(objectReq);
    }, [inputCriteria])

    const handleSearch = async () => {
        let inputData = getInputData(inputRef, "NE");
        if (inputData.dataSize > 0) {
            if (!inputData.isInvalid) {
                setInputCriteria(inputData.data);
            }
        } else {
            customAlert(msg.atLestOne, "W");
        }
    }

    const searchEmpForMapSaleTerritory = async (pagingCriteria) => {
        if (inputCriteria) {
            const jsonResponse = await callSearchEmpForMapSaleTerritorye({ ...pagingCriteria, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const callSearchEmpForMapSaleTerritorye = async (jsonRequest) => {

        jsonRequest.model.territoryId = toString(pathValue.territoryId)

        return await callAPI(apiPath.searchSaleGroupForMapSaleTerritory, jsonRequest)
    }

    const searchEmpByTerritoryId = async (pagingCriteria) => {
        let jsonRequest = { ...pagingCriteria, ...{ model: { territoryId: toString(pathValue.territoryId) } } };
        jsonRequest.searchOrder = 1
        const jsonResponse = await callSearchEmpByTerritoryId(jsonRequest)
        setDataByTerritory(jsonResponse.data ? jsonResponse.data : null)
    }


    const callSearchEmpByTerritoryId = async (jsonRequest) => {
        return await callAPI(apiPath.searchSaleGroup, jsonRequest)
    }

    const searchAdmEmpRoleManager = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 1,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                // groupCode: userProfile.groupCode
            }
        }
        const jsonResponse = await callAPI(apiPath.searchAdmEmpRoleManager, jsonRequest);
        setSelectData(jsonResponse.data ? jsonResponse.data : null);
    }

    const clear = () => {
        clearInputData(inputRef)
        setData(null)
        tableRef.current.clear();
    }

    const deleteFunction = async (item) => {
        customAlert(msg.confirmDelete, "Q", async () => {
            let jsonRequest = {
                saleTerritoryId: toString(item.saleTerritoryId)
            }
            const jsonResponse = await callAPI(apiPath.delSaleTerritory, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                searchEmpByTerritoryId(tableRefByGroupCode.current.getJsonReq());
                searchAdmEmpRoleManager();
                customAlert(msg.deleteSuccess)
            }
        })

    }

    const addFunction = async (item) => {
        let groupCodeList = [];
        item.forEach((obj) => {
            groupCodeList.push(obj.groupCode);
        });
        let jsonRequest = {
            territoryId: toString(pathValue.territoryId),
            listGroupCode: groupCodeList
        }
        callAddSaleTerritory(jsonRequest);

    }

    const filterDataForSelect = () => {
        if (!(selectData && selectData.records)) return [];
        return formatObjForSelect(selectData.records, "empId", ["empId", ["titleName", "firstName", "lastName"]], " : ");
    }

    const callAddSaleTerritory = async (jsonRequest) => {
        const jsonResponse = await callAPI(apiPath.updTerritorySaleGroup, jsonRequest)
        if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
            searchEmpByTerritoryId(tableRefByGroupCode.current.getJsonReq());
            searchAdmEmpRoleManager();
            clear();
            customAlert(msg.addSuccess)
        }
    }

    const onChangeLeader = async (item) => {
        const jsonRequest = {
            territoryId: toString(pathValue.territoryId),
            managerEmpId: item
        }
        const jsonResponse = await callAPI(apiPath.updTerritoryByManagerEmpId, jsonRequest)
        if (jsonResponse &&
            jsonResponse.errorCode == "S_SUCCESS" &&
            jsonResponse.data &&
            jsonResponse.data.records &&
            jsonResponse.data.records.length > 0
        ) {
            dispatch(updateCurrentPathValue(jsonResponse.data.records[0]))
            customAlert(msg.editSuccess)
        }
    }

    return (
        <div className="col-12">
            <div className="content-search ">
                <CriteriaCard onSearch={handleSearch} onClear={clear} disabledBackground>
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.territoryCode}</div>
                        <div className="col-4">{pathValue.territoryCode}</div>
                    </div>
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.territoryName}</div>
                        <div className="col-4">{pathValue.territoryNameTh}</div>
                    </div>
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.territoryLeader}</div>
                        <div className="col-4">
                            <Select
                                placeholder={msg.pleaseSelect}
                                onChange={onChangeLeader}
                                defaultValue={pathValue.managerEmpId}
                                options={filterDataForSelect()}
                                hideEmptyOption
                            />
                        </div>
                    </div>
                    <div className="row d-flex justify-content-center mt-3">
                        <div className="col-6 col-md-6 mt-2">
                            <TextField label={msg.territorySaleGroupCode} allowChar="NUM ENG" maxLength={10} ref={el => inputRef.current.groupCode = el}></TextField>
                        </div>
                        <div className="col-6 col-md-6 mt-2">
                            <TextField label={msg.territorySaleGroupName} value="" ref={el => inputRef.current.descriptionTh = el}></TextField>
                        </div>
                    </div>
                </CriteriaCard>
                <Table
                    onSelectPage={searchEmpForMapSaleTerritory}
                    dataTable={data}
                    headerTabel={headerTabel}
                    label={true}
                    ref={tableRef}
                    multiBtn
                    multiBtnType="add"
                    multiBtnFunction={(item) => addFunction(item)}
                />
            </div>
            <Table
                customLabel={msg.headerListSaleGroup}
                onSelectPage={searchEmpByTerritoryId}
                dataTable={dataByTerritory}
                headerTabel={headerTabelByGroupCode}
                label={true}
                ref={tableRefByGroupCode}
            />
            <Modal
                isShow={showModal}
                onClose={() => setShowModal(false)}
            >

            </Modal>
        </div>
    )
}