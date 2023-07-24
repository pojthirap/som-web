import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { getInputData } from '@helper'
import CardTable from 'pages/account/components/CardTable'
import TextField from '@components/TextField';
import Button from '@components/Button';
import AccountTagHistory from '@components/AccountTagHistory'
import * as apiPath from '@apiPath'
import * as msg from '@msg'

const dataMapper = {
    code: "custCode",
    status: "prospectStatus",
    primaryData: "accName",
    telNo: "mobileNo",
    faxNo: "faxNo",
    lat: "latitude",
    long: "longitude",
    prospectDataKey: "prospect",
    accountDataKey: "prospectAccount",
    addressDataKey: "prospectAddress",
    contactDataKey: "prospectContact",
}
export default function TemplateForSAEditPage({ callAPI, redirect, customAlert }) {
    const dispatch = useDispatch();
    const criteriaRef = useRef({});
    const prospectTableRef = useRef({});
    const reccomendBUTableRef = useRef({});
    const inTerritoryTableRef = useRef({});
    const [prospectStatus, setProspectStatus] = useState([]);
    const [prospectData, setProspectData] = useState(null);
    const [reccomendBUData, setReccomendBUData] = useState(null);
    const [inTerritoryData, setInTerritoryData] = useState(null);
    const [inputCriteria, setInputCriteria] = useState(null);
    useEffect(() => {
        getProspectStatus();
    }, [])
    useEffect(() => {
        getProspectStatus();
        searchProspectData(prospectTableRef.current.getJsonReq());
        searchReccomendBUData(reccomendBUTableRef.current.getJsonReq());
        searchInTerritoryData(inTerritoryTableRef.current.getJsonReq());
    }, [inputCriteria])
    const getProspectStatus = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                lovKeyword: "PROSPECT_STATUS",
                activeFlag: "Y"
            }
        }
        const jsonResponse = await callAPI(apiPath.getConfigLov, jsonRequest);
        setProspectStatus(jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : []);
    }
    const searchProspectData = async (jsonRequest) => {
        jsonRequest.model.accName = inputCriteria && inputCriteria.accName ? inputCriteria.accName : null;
        const jsonResponse = await callAPI(apiPath.searchMyAccount, { ...jsonRequest })
        setProspectData(jsonResponse.data ? jsonResponse.data : null)
    }
    const searchReccomendBUData = async (jsonRequest) => {
        jsonRequest.model.accName = inputCriteria && inputCriteria.accName ? inputCriteria.accName : null;
        const jsonResponse = await callAPI(apiPath.searchProspectRecommend, { ...jsonRequest })
        setReccomendBUData(jsonResponse.data ? jsonResponse.data : null)
    }
    const searchInTerritoryData = async (jsonRequest) => {
        jsonRequest.model.accName = inputCriteria && inputCriteria.accName ? inputCriteria.accName : null;
        const jsonResponse = await callAPI(apiPath.searchAccountInTerritory, { ...jsonRequest })
        setInTerritoryData(jsonResponse.data ? jsonResponse.data : null)
    }
    const createProspect = () => {
        dispatch(redirect("/account/prospect/create"))
    }
    const handleSearch = () => {
        let inputData = getInputData(criteriaRef, "NE");
        if (!inputData.isInvalid) {
            setInputCriteria(inputData.data);
        }
    }
    const handleClickCard = (data) => {
        dispatch(redirect("/account/menuSelect", { data: data }))
    }
    return (
        <div>
            <AccountTagHistory />
            <div className="container pb-5">
                <div className="row d-flex justify-content-center py-3">
                    <div className="col-10 row">
                        <div className="col-10 pr-0">
                            <TextField shadowBorder placeholder={msg.search} ref={el => criteriaRef.current.accName = el} />
                        </div>
                        <div className="col-2">
                            <Button type="search" onClick={handleSearch} />
                        </div>
                    </div>
                </div>
                <div className="row d-flex justify-content-between">
                    <span className="h1 padding-row">{msg.prospect}</span>
                    <div className="padding-row">
                        <Button type="add" customLabel={msg.createProspect} onClick={createProspect} />
                    </div>
                </div>
                <div className="row">
                    <CardTable
                        headerLabel={msg.myProspect}
                        dataMapper={dataMapper}
                        tableData={prospectData}
                        onSelectPage={searchProspectData}
                        statusData={prospectStatus}
                        onClickCard={handleClickCard}
                        ref={prospectTableRef}
                    />
                </div>
            </div>
            <div className="bg-light-green py-5">
                <div className="container">
                    <CardTable
                        headerLabel={msg.reccomendBU}
                        dataMapper={dataMapper}
                        tableData={reccomendBUData}
                        onSelectPage={searchReccomendBUData}
                        statusData={prospectStatus}
                        onClickCard={handleClickCard}
                        ref={reccomendBUTableRef}
                    />
                </div>
            </div>
            <div className="bg-light-yellow-green py-5">
                <div className="container pb-5">
                    <CardTable
                        headerLabel={msg.inTerritory}
                        dataMapper={dataMapper}
                        tableData={inTerritoryData}
                        onSelectPage={searchInTerritoryData}
                        statusData={prospectStatus}
                        onClickCard={handleClickCard}
                        ref={inTerritoryTableRef}
                    />
                </div>
            </div>

        </div>
    )
}