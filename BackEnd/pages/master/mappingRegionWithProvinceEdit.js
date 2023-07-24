import { useState, useRef, useEffect } from 'react';
import Table from "@components/Table";
import TextField from "@components/TextField";
import CriteriaCard from "@components/CriteriaCard";
import { getInputData, clearInputData } from "@helper";
import { useSelector, useDispatch } from 'react-redux'
import * as apiPath from "@apiPath";
import * as msg from "@msg";
export default function MappingRegionWithProvinceEditPage({ callAPI, getPathValue, customAlert }) {
    const pathValue = getPathValue(useSelector((state) => state.pathValue));
    const inputRef = useRef({});
    const tableRef = useRef({});
    const tableRefByGroupCode = useRef({});
    const [data, setData] = useState();
    const [dataByProvince, setDataByProvince] = useState();
    const [inputCriteria, setInputCriteria] = useState(null);

    const headerTabel = [
        {
            title: msg.provinceCode,
            data: "provinceCode",
            type: "code",
            width: "20%"
        },
        {
            title: msg.provinceName,
            data: "provinceNameTh",
            type: "string",
            width: "70%"
        },
    ]

    const headerTabelByProvince = [
        {
            title: msg.numOrder,
            type: "rowNum",
            width: "10%"
        },
        {
            title: msg.provinceCode,
            data: "provinceCode",
            type: "code",
            width: "20%"
        },
        {
            title: msg.provinceName,
            data: "provinceNameTh",
            type: "string",
            width: "60%"
        },
        {
            title: msg.del,
            type: "button",
            button: "delete",
            width: "10%",
            deleteFunction: (item) => deleteFunction(item),
        },
    ]

    useEffect(() => {
        searchProvinceByRegionId(tableRefByGroupCode.current.getJsonReq());
    }, [])

    useEffect(() => {
        let objectReq = tableRef.current.getJsonReq()
        searchProvinceForRegion(objectReq)
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

    const searchProvinceForRegion = async (pagingCriteria) => {
        if (inputCriteria) {
            const jsonResponse = await callSearchProvinceForRegion({ ...pagingCriteria, ...{ model: inputCriteria } })
            setData(jsonResponse.data ? jsonResponse.data : null)
        }
    }

    const callSearchProvinceForRegion = async (jsonRequest) => {
        return await callAPI(apiPath.searchProvince, jsonRequest)
    }

    const searchProvinceByRegionId = async (pagingCriteria) => {
        let jsonRequest = { ...pagingCriteria, ...{ model: { regionCode: pathValue.regionCode } } };
        jsonRequest.searchOrder = 1;
        const jsonResponse = await callSearchProvinceByRegionId(jsonRequest)
        setDataByProvince(jsonResponse.data ? jsonResponse.data : null)
    }

    const callSearchProvinceByRegionId = async (jsonRequest) => {
        jsonRequest.model.regionCode = pathValue.regionCode
        return await callAPI(apiPath.searchProvince, jsonRequest)
    }

    const clear = () => {
        clearInputData(inputRef)
        setData(null)
        tableRef.current.clear();
    }

    const deleteFunction = async (item) => {
        let provinceCode = []
        customAlert(msg.confirmDelete, "Q", async () => {
            provinceCode.push(item.provinceCode);
            let jsonRequest = {
                provinceCodeList: provinceCode
            }
            const jsonResponse = await callAPI(apiPath.updProvince, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                searchProvinceByRegionId(tableRefByGroupCode.current.getJsonReq());
                customAlert(msg.deleteSuccess)
            }
        })
    }

    const addFunction = async (item) => {
        let provinceList = [];
        let alreadyHaveProvince = []
        item.forEach((obj) => {
            if (obj.regionCode) alreadyHaveProvince.push(obj.provinceNameTh);
            provinceList.push(obj.provinceCode);
        });

        let jsonRequest = {
            regionCode: pathValue.regionCode,
            provinceCodeList: provinceList
        }
        if (alreadyHaveProvince.length > 0) {
            let alertMsg = []
            alertMsg.push(
                <div className="row">
                    {msg.dialogCheckProvince}
                </div>
            )
            alreadyHaveProvince.forEach((obj) => {
                alertMsg.push(
                    <div className="row">
                        - {obj}
                    </div>
                )
            });

            customAlert(alertMsg, "Q", async () => {
                callUpdateProvince(jsonRequest);
            })
        } else {
            callUpdateProvince(jsonRequest);
        }
    }

    const callUpdateProvince = async (jsonRequest) => {
        const jsonResponse = await callAPI(apiPath.updProvince, jsonRequest)
        if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
            searchProvinceByRegionId(tableRefByGroupCode.current.getJsonReq());
            clear();
            customAlert(msg.addSuccess)
        }
    }

    return (
        <div className="col-12">
            <div className="content-search ">
                <CriteriaCard onSearch={handleSearch} onClear={clear} disabledBackground>
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.regionCode}</div>
                        <div className="col-4">{pathValue.regionCode}</div>
                    </div>
                    <div className="row d-flex labelRow">
                        <div className="col-3">{msg.regionName}</div>
                        <div className="col-4">{pathValue.regionNameTh}</div>
                    </div>
                    <div className="row d-flex justify-content-center">
                        <div className="col-12 col-md-6 mt-2">
                            <TextField label={msg.provinceCode} value="" ref={el => inputRef.current.provinceCode = el} ></TextField>
                        </div>
                        <div className="col-12 col-md-6 mt-2">
                            <TextField label={msg.provinceName} value="" ref={el => inputRef.current.provinceName = el} ></TextField>
                        </div>
                    </div>
                </CriteriaCard>
                <Table
                    onSelectPage={searchProvinceForRegion}
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
                customLabel={msg.headerListProvince}
                onSelectPage={searchProvinceByRegionId}
                dataTable={dataByProvince}
                headerTabel={headerTabelByProvince}
                label={true}
                ref={tableRefByGroupCode}
            />
        </div >
    )
}