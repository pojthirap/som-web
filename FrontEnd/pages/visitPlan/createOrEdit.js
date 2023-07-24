import { useState, useRef, useEffect, useCallback } from 'react';
import { getInputData, formatObjForSelect, toString } from '@helper';
import { useDispatch, useSelector } from 'react-redux'
import { LoadScript } from "@react-google-maps/api";
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps";
import TextField from '@components/TextField';
import DatePicker from '@components/DatePicker';
import AccountTagHistory from 'pages/visitPlan/components/visitPlanTagHistory'
import DragAndDropTable from "pages/visitPlan/components/DragAndDropTable";
import Select from '@components/Select';
import Button from '@components/Button';
import Radio from '@components/Radio'
import Image from 'next/image'
import * as apiPath from '@apiPath'
import * as msg from '@msg'
import moment from 'moment';


const TYPE_PROSPECT = "P"
const TYPE_LOCATION = "L"
export default function Create({ callAPI, redirect, customAlert, getPathValue, updateCurrentPathValue }) {

    const radioOption = [
        { value: TYPE_PROSPECT, label: msg.prospectAndCustomer },
        { value: TYPE_LOCATION, label: msg.planTripLocation }
    ]
    const headerTabel = [
        {
            title: msg.prospectAndCustomer,
            data: "locationName",
            type: "string",
            width: "30%"
        },
        {
            title: msg.visitPlanLocation,
            data: ["latitude", "longitude"],
            dataSeparator: " , ",
            type: "code",
            width: "32%"
        },
        {
            title: msg.time,
            data: ["planStartTime", "planEndTime"],
            dataSeparator: " - ",
            type: "code",
            width: "25%"
        },
        {
            type: "button",
            button: "delete edit",
            width: "10%",
            deleteFunction: (item) => deleteFunction(item),
            editFunction: (item) => editFunction(item)

        }
    ]
    const dispatch = useDispatch();
    const pathValue = getPathValue(useSelector((state) => state.pathValue));
    const userProfile = useSelector((state) => state.userProfile);
    const isLeader = userProfile.admGroup_GroupCode == "SUPEPVISOR" || userProfile.admGroup_GroupCode == "MANAGER"
    const isCreateForMe = pathValue.type == "M"
    const isCreateForOther = pathValue.type == "O"
    const isView = pathValue.type == "V"
    const isEdit = pathValue.type == "E"
    const isAprove = pathValue.type == "A"

    const [prospectLocationAdded, setProspectLocationAdded] = useState(pathValue.prospectLocationAdded ? pathValue.prospectLocationAdded : []);
    const [prospectLocationAll, setProspectLocationAll] = useState([]);
    const [prospectLocation, setProspectLocation] = useState([]);
    const [locationDataAll, setLocationDataAll] = useState([]);
    const [locationData, setLocationData] = useState([]);
    const [empSelectData, setEmpSelectData] = useState([]);
    const [currentRadio, setCurrentRadio] = useState(TYPE_PROSPECT);
    const [centerPlanTrip, setCenterPlanTrip] = useState({ lat: 13.756569, lng: 100.501879 })
    const [centerLocation] = useState({ lat: 13.756569, lng: 100.501879 })
    const [initData, setInitData] = useState({})
    const planTripSelect = useRef({})
    const locationSelect = useRef({})
    const startAndEndPlace = useRef({})
    const [google, setGoogle] = useState(null);
    const [disabledInput, setDisabledInput] = useState(isView || isAprove || (isEdit && !pathValue.inputData))
    const [disabledRemark, setDisabledRemark] = useState(isView || (isEdit && !pathValue.inputData))
    const [isAfterToday, setIsAfterToday] = useState(false);
    const [isNotOwner, setIsNotOwner] = useState(false);
    const inputRef = useRef({})
    const tableRef = useRef();

    useEffect(() => {
        if (!disabledInput) {
            getProspectForCreatePlanTrip();
            searchLoc();
        } else {
            viewPlanTrip()
        }

        if (pathValue.inputData) {
            setInitData(pathValue.inputData)
        }

        getEmpForAssignPlanTrip()
    }, [])
    useEffect(() => {
        if (initData.planTripDate) {

        }
    }, [initData])

    const onLoad = useCallback(function callback(map) {
        setGoogle(window.google)
    }, []);

    const viewPlanTrip = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                planTripId: toString(pathValue.planTripId, false, false)
            }
        }
        const jsonResponse = await callAPI(apiPath.viewPlanTrip, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length > 0 ? jsonResponse.data.records[0] : {}
        if (userProfile.empId == data.planTrip.createUser) setIsNotOwner(true)
        if (!pathValue.inputData) setInitData(data.planTrip)
        if (data.listPlanTripProspect && data.listPlanTripProspect.length > 0) {
            let tmpAddedData = []
            for (const obj of data.listPlanTripProspect) {

                let planStartTime = obj.planStartTime ? obj.planStartTime.split("T")[1].substr(0, 5) : "";
                let planEndTime = obj.planEndTime ? obj.planEndTime.split("T")[1].substr(0, 5) : "";
                if (obj.prospId) {
                    const listTask = await viewPlanTripTask(obj.planTripProspId);
                    tmpAddedData.push({
                        locationName: obj.accName,
                        latitude: obj.latitude,
                        longitude: obj.longitude,
                        planStartTime: planStartTime,
                        planEndTime: planEndTime,
                        locationId: obj.prospId,
                        locationType: TYPE_PROSPECT,
                        listTask: listTask,
                        custCode: obj.custCode
                    })
                }
                else if (obj.locId) {
                    tmpAddedData.push({
                        locationName: obj.accName,
                        latitude: obj.latitude,
                        longitude: obj.longitude,
                        planStartTime: planStartTime,
                        planEndTime: planEndTime,
                        locationId: obj.locId,
                        locationType: TYPE_LOCATION,
                        locRemark: obj.locRemark
                    })
                }
            }
            setProspectLocationAdded(tmpAddedData)
        }
    }

    const viewPlanTripTask = async (id) => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                planTripProspId: toString(id, false, false)
            }
        }
        const jsonResponse = await callAPI(apiPath.viewPlanTripTask, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : {}
        for (let i = 0; i < data.length; i++) {
            data[i].planTripTaskId = toString(data[i].planTripTaskId, false, false)
            data[i].planTripProspId = toString(data[i].planTripProspId, false, false)
            data[i].orderNo = toString(data[i].orderNo, false, false)
            data[i].tpStockCardId = toString(data[i].tpStockCardId, false, false)
            data[i].tpSaFormId = toString(data[i].tpSaFormId, false, false)
            data[i].tpAppFormId = toString(data[i].tpAppFormId, false, false)
        }
        return data
    }
    const getProspectForCreatePlanTrip = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.getProspectForCreatePlanTrip, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : []
        data = data.filter(element => validateLatLng(element.latitude, element.longitude));
        setProspectLocationAll(data);
        for (let i = 0; i < data.length; i++) {
            if (validateLatLng(data[i].latitude, data[i].longitude)) {
                setCenterPlanTrip({ lat: Number(data[i].latitude), lng: Number(data[i].longitude) })
                break;
            }
        }

        if (prospectLocationAdded && prospectLocationAdded.length > 0) {
            prospectLocationAdded.forEach((addedObj) => {
                if (addedObj.locationType != TYPE_PROSPECT) return;
                data = data.filter(element => element.prospectId != addedObj.locationId);
            })
        }
        setProspectLocation(data);

    }
    const searchLoc = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                activeFlag: "Y"
            }
        }
        const jsonResponse = await callAPI(apiPath.searchLoc, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : []
        data = data.filter(element => validateLatLng(element.latitude, element.longitude));
        setLocationDataAll(data);
        if (prospectLocationAdded && prospectLocationAdded.length > 0) {
            prospectLocationAdded.forEach((addedObj) => {
                if (addedObj.locationType != TYPE_LOCATION) return;
                data = data.filter(element => element.locId != addedObj.locationId);
            })
        }
        setLocationData(data);
    }
    const getEmpForAssignPlanTrip = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
            }
        }
        const jsonResponse = await callAPI(apiPath.getEmpForAssignPlanTrip, jsonRequest);
        let data = jsonResponse && jsonResponse.data && jsonResponse.data.records ? jsonResponse.data.records : []
        data = data.filter(element => element.empId != userProfile.empId);
        setEmpSelectData(formatObjForSelect(data, "empId", ["empId", ["titleName", "firstName", "lastName"]], " : "))
    }

    const handleAdd = () => {
        if (currentRadio == TYPE_PROSPECT) {
            let inputData = getInputData(planTripSelect);
            if (!inputData.isInvalid) {
                addPlanTrip(inputData.data.id)
                planTripSelect.current.id.clearValue()
            }
        } else {
            let inputData = getInputData(locationSelect);
            if (!inputData.isInvalid) {
                addLocation(inputData.data.id);
                locationSelect.current.id.clearValue()
            }
        }

    }
    function addPlanTrip(id) {
        const found = prospectLocation.find(element => element.prospectId == id);
        let tmpArr = prospectLocation.filter(element => element.prospectId != id);
        setProspectLocation(tmpArr);
        let tmpData = {
            locationName: found.accName,
            latitude: found.latitude,
            longitude: found.longitude,
            planStartTime: "",
            planEndTime: "",
            locationId: found.prospectId,
            locationType: TYPE_PROSPECT,
            custCode: found.custCode
        }
        setProspectLocationAdded([...prospectLocationAdded, tmpData])
    }
    function addLocation(id) {
        const found = locationData.find(element => element.locId == id);
        let tmpArr = locationData.filter(element => element.locId != id);
        setLocationData(tmpArr);
        let tmpData = {
            locationName: found.locNameTh,
            latitude: found.latitude,
            longitude: found.longitude,
            planStartTime: "",
            planEndTime: "",
            locationId: found.locId,
            locationType: TYPE_LOCATION,
        }
        setProspectLocationAdded([...prospectLocationAdded, tmpData])
    }

    const deleteFunction = async (item) => {
        customAlert(msg.confirmDelete, "Q", async () => {
            if (item.locationType == TYPE_PROSPECT) {
                const tmpArr = prospectLocationAdded.filter(element => element.locationId != item.locationId);
                const found = prospectLocationAll.find(element => element.prospectId == item.locationId);
                setProspectLocation([...prospectLocation, found]);
                setProspectLocationAdded(tmpArr);
            } else {
                const tmpArr = prospectLocationAdded.filter(element => element.locationId != item.locationId);
                const found = locationDataAll.find(element => element.locId == item.locationId);
                setLocationData([...locationData, found]);
                setProspectLocationAdded(tmpArr);
            }
            customAlert(msg.deleteSuccess)
        });
    }

    function formatDataForProspect(data) {
        return data && data.length > 0 ? formatObjForSelect(data.sort(compare), "prospectId", [["custCode", "prospectId"], ["accName", "addressFullnm"]], ":", 0) : [];
    }

    function formatDataForLocation(data) {
        return data && data.length > 0 ? formatObjForSelect(data.sort(compareLocId), "locId", "locNameTh") : [];
    }

    const editFunction = async (item) => {
        let inputData = getInputData(inputRef, "NV");
        let tmpPathValue = {
            ...pathValue,
            prospectLocationAdded: prospectLocationAdded,
            inputData: inputData.data,
        }
        const viewOnly = !(isCreateForOther || isCreateForMe || (isEdit && !disabledInput))
        if (!viewOnly) dispatch(updateCurrentPathValue(tmpPathValue));
        if (item.locationType == TYPE_PROSPECT) {
            dispatch(redirect("/visitPlan/editTask", { editItem: item, viewOnly: viewOnly }))
        } else {
            dispatch(redirect("/visitPlan/editLocation", { editItem: item, viewOnly: viewOnly }))
        }

    }

    const handleRadioChange = (obj) => {
        setCurrentRadio(obj)
        planTripSelect.current.id.clearValue()
        locationSelect.current.id.clearValue()
        planTripSelect.current.id.clearValidate()
        locationSelect.current.id.clearValidate()
    }

    function compare(a, b) {
        if (a.accName < b.accName) {
            return -1;
        }
        if (a.accName > b.accName) {
            return 1;
        }
        return 0;
    }
    function compareLocId(a, b) {
        if (a.locNameTh < b.locNameTh) {
            return -1;
        }
        if (a.locNameTh > b.locNameTh) {
            return 1;
        }
        return 0;
    }


    const RegularMap = withScriptjs(
        withGoogleMap(props => (
            <GoogleMap
                defaultZoom={10}
                defaultCenter={currentRadio == TYPE_PROSPECT ? centerPlanTrip : centerLocation}
                defaultOptions={{
                    gestureHandling: "cooperative",
                }}
            >
                {markersPlanTrip()}
            </GoogleMap>
        ))
    );

    const markersPlanTrip = () => {
        if (currentRadio == TYPE_PROSPECT) {
            return prospectLocation.map(location => (
                validateLatLng(location.latitude, location.longitude) ?
                    <Marker position={{ lat: Number(location.latitude), lng: Number(location.longitude) }} title={location.accName} onClick={() => addPlanTrip(location.prospectId)} >
                    </Marker>

                    :
                    null
            ))
        } else {
            return locationData.map(location => (
                validateLatLng(location.latitude, location.longitude) ?
                    <Marker position={{ lat: Number(location.latitude), lng: Number(location.longitude) }} title={location.locNameTh} onClick={() => addLocation(location.locId)} />
                    :
                    null
            ))
        }
    }

    function validateLatLng(lat, lng) {
        return (lat && isFinite(lat) && Math.abs(lat) <= 90) && (lng && isFinite(lng) && Math.abs(lng) <= 180);
    }


    function reorder(arr, index, n) {
        var temp = [...Array(n)];
        for (var i = 0; i < n; i++) temp[i] = arr[index[i]];
        return temp;
    }
    function calBestRoute() {
        if (prospectLocationAdded.length == 0) return
        if (google == null) return customAlert("Can't load google API", "E")

        let allWaypoints = [...prospectLocationAdded]
        let validWaypoints = [];
        let invalidWaypoints = [];
        let originWaypoint = null;
        let destinationWaypoint = null;

        allWaypoints.forEach((obj) => {
            if (validateLatLng(obj.latitude, obj.longitude)) {
                validWaypoints.push(obj)
            } else {
                invalidWaypoints.push(obj)
            }
        })

        const inputData = getInputData(startAndEndPlace, "NV");
        if (!inputData.data.start && !inputData.data.end && prospectLocationAdded.length < 3) return
        if (inputData.data.start) {
            originWaypoint = locationDataAll.find(element => element.locId == inputData.data.start);
        } else {
            originWaypoint = validWaypoints.shift();
        }
        if (inputData.data.end) {
            destinationWaypoint = locationDataAll.find(element => element.locId == inputData.data.end);
        } else {
            destinationWaypoint = validWaypoints.pop();
        }

        const waypoints = validWaypoints.map(p => ({
            location: { lat: Number(p.latitude), lng: Number(p.longitude) },
            stopover: true
        }));

        const origin = { lat: Number(originWaypoint.latitude), lng: Number(originWaypoint.longitude) };
        const destination = { lat: Number(destinationWaypoint.latitude), lng: Number(destinationWaypoint.longitude) };

        const travelMode = google.maps.TravelMode.DRIVING
        const directionsService = new google.maps.DirectionsService();

        directionsService.route(
            {
                origin: origin,
                destination: destination,
                travelMode: travelMode,
                waypoints: waypoints,
                optimizeWaypoints: true
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    if (validWaypoints.length == result.routes[0].waypoint_order.length) {
                        let sortObj = []
                        if (!inputData.data.start) sortObj.push(originWaypoint)
                        sortObj.push(...reorder(validWaypoints, result.routes[0].waypoint_order, validWaypoints.length))
                        sortObj.push(...invalidWaypoints)
                        if (!inputData.data.end) sortObj.push(destinationWaypoint)
                        setProspectLocationAdded(sortObj)
                    }
                } else {
                    if (status == "ZERO_RESULTS") {
                        customAlert(msg.cantNotfindRoute, "W")
                    } else {
                        customAlert("Error while fetching directions CODE:" + status, "E")
                        console.error("error fetching directions", result, status);
                    }
                }
            }
        );
    }
    const handleSave = async (isSend) => {
        const inputData = getInputData(inputRef);
        let emptyListTask = []
        let listProspect = []
        if (!inputData.isInvalid) {
            let dontHaveProspect = true
            prospectLocationAdded.forEach((obj, index) => {
                let planStartTime = null
                let planEndTime = null
                if (obj.planStartTime) planStartTime = inputData.data.planTripDate.split("T")[0] + "T" + obj.planStartTime + ":00";
                if (obj.planEndTime) planEndTime = inputData.data.planTripDate.split("T")[0] + "T" + obj.planEndTime + ":00";
                if (obj.locationType == TYPE_PROSPECT) {
                    dontHaveProspect = false
                    if (obj.listTask && obj.listTask.length > 0) {
                        listProspect.push(
                            {
                                orderNo: toString(index, false, false),
                                prospId: toString(obj.locationId, false, false),
                                planStartTime: planStartTime,
                                planEndTime: planEndTime,
                                listTask: obj.listTask
                            }
                        )
                    } else {
                        emptyListTask.push(obj.locationName)
                    }
                } else {
                    listProspect.push(
                        {
                            orderNo: toString(index, false, false),
                            locId: toString(obj.locationId, false, false),
                            locRemark: obj.locRemark ? obj.locRemark : "",
                            planStartTime: planStartTime,
                            planEndTime: planEndTime
                        }
                    )
                }
            });
            // if (dontHaveProspect) return customAlert(msg.planTripProspectMin1, "W")
            if (emptyListTask.length == 0) {
                let planTrip = inputData.data
                if (isLeader) {
                    planTrip.status = isCreateForOther ? "7" : "3"
                }
                else {
                    planTrip.status = isSend ? "2" : "1";
                }
                let jsonRequest = {
                    planTrip: planTrip,
                    listProspect: listProspect
                }

                if (isEdit) {
                    jsonRequest.planTrip.planTripId = toString(pathValue.planTripId, false, false);
                    const jsonResponse = await callAPI(apiPath.updPlanTrip, jsonRequest)
                    if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                        customAlert(msg.saveSuccess)
                        back();
                    }
                } else {
                    const jsonResponse = await callAPI(apiPath.createPlanTrip, jsonRequest)
                    if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                        customAlert(msg.saveSuccess)
                        back();
                    }
                }
            } else {
                customAlert(
                    <div>
                        <div>
                            {msg.taskListEmpty}
                        </div>
                        {emptyListTask.map(obj => (
                            <div className="ml-1">
                                - {obj}
                            </div>
                        ))}
                    </div>
                    , "W"
                )
            }
        }
    }
    const updateStatus = async (type) => {
        if (type == "C") {
            customAlert(msg.confirmDelete, "Q", async () => {
                const jsonRequest = {
                    planTripId: toString(pathValue.planTripId, false, false),
                }
                const jsonResponse = await callAPI(apiPath.cancelPlanTrip, jsonRequest)
                if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                    customAlert(msg.deleteSuccess)
                    back();
                }
            });
        }
        else if (type == "R") {
            const inputData = getInputData(inputRef);
            const jsonRequest = {
                planTripId: toString(pathValue.planTripId, false, false),
                remark: inputData && inputData.data && inputData.data.remark ? inputData.data.remark : ""
            }
            const jsonResponse = await callAPI(apiPath.rejectPlanTrip, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                customAlert(msg.saveSuccess)
                back();
            }
        }
        else if (type == "A") {
            const inputData = getInputData(inputRef);
            const jsonRequest = {
                planTripId: toString(pathValue.planTripId, false, false),
                remark: inputData && inputData.data && inputData.data.remark ? inputData.data.remark : ""
            }
            const jsonResponse = await callAPI(apiPath.approvePlanTrip, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                customAlert(msg.saveSuccess)
                back();
            }
        }
    }
    const back = () => {
        dispatch(updateCurrentPathValue({}));
        dispatch(redirect("/visitPlan/main"))
    }
    const handleEdit = () => {
        setDisabledInput(false)
        setDisabledRemark(false)
        getProspectForCreatePlanTrip();
        searchLoc();
    }
    const handleOnChangePlanTripDate = (value) => {
        if (value) {
            let today = moment().format("YYYY-MM-DD");
            if(moment(value).isSameOrAfter(today)){
                setIsAfterToday(true)
            }
            else {
                setIsAfterToday(false)
            }
        } else {
            setIsAfterToday(true)
        }
    }
    return (
        <div>
            <LoadScript
                googleMapsApiKey={process.env.googleApiKey}
                loadingElement={<div />}
                containerElement={<div />}
                mapElement={<div />}
                onLoad={onLoad}
            >
                <AccountTagHistory />
                <div className="container pb-4 pt-2">
                    <div className="row">
                        <div className="col-12 col-md-6 col-lg-6 mt-3">
                            <TextField
                                label={msg.planTripName}
                                ref={el => inputRef.current.planTripName = el}
                                defaultValue={initData && initData.planTripName ? initData.planTripName : ""}
                                require
                                disabled={disabledInput}

                            />
                        </div>
                        <div className="col-12 col-md-6 col-lg-4 mt-3">
                            <DatePicker
                                label={msg.visitDate}
                                ref={el => inputRef.current.planTripDate = el}
                                defaultValue={initData && initData.planTripDate ? initData.planTripDate : ""}
                                require
                                disabled={disabledInput}
                                minDate={moment().format("YYYY-MM-DD").concat("T00:00:00")}
                                onChange={handleOnChangePlanTripDate}
                                onInit={handleOnChangePlanTripDate}
                            />
                        </div>
                    </div>
                    {isCreateForOther ?
                        <div className="row mt-3">
                            <div className="col-12 col-xl-6">
                                <Select
                                    label={msg.salesRep}
                                    options={empSelectData}
                                    ref={el => inputRef.current.assignEmpId = el}
                                    defaultValue={initData && initData.assignEmpId ? initData.assignEmpId : ""}
                                    require
                                />
                            </div>
                        </div>
                        :
                        null
                    }
                    {!disabledInput ?
                        <div>
                            <div className="row mt-3">
                                <div className="col-12 col-xl-6">
                                    <Radio
                                        name="taskType"
                                        options={radioOption}
                                        defaultValue={currentRadio}
                                        onChange={handleRadioChange}
                                    />
                                </div>
                            </div>
                            <div className="row mt-1">
                                <div className={"col-12 col-md-6 col-lg-6" + (currentRadio == TYPE_PROSPECT ? "" : " d-none")}>
                                    <Select
                                        label={msg.prospectAndCustomer}
                                        options={formatDataForProspect(prospectLocation)}
                                        ref={el => planTripSelect.current.id = el}
                                        require
                                    />
                                </div>
                                <div className={"col-12 col-md-6 col-lg-6" + (currentRadio == TYPE_LOCATION ? "" : " d-none")}>
                                    <Select
                                        label={msg.planTripLocation}
                                        options={formatDataForLocation(locationData)}
                                        ref={el => locationSelect.current.id = el}
                                        require
                                    />
                                </div>
                                <div className="col-12 col-md-3 col-lg-2 row" style={{ paddingTop: 38 }}>
                                    <Button
                                        type="add"
                                        onClick={handleAdd}
                                    />
                                </div>
                            </div>
                            <div style={{ height: '50vh', width: '100%' }} className="padding-row mt-4">
                                {/* <Map/> */}

                                <RegularMap
                                    googleMapURL={"https://maps.googleapis.com/maps/api/js?key=" + process.env.googleApiKey}
                                    loadingElement={<div style={{ height: '50vh' }} />}
                                    containerElement={<div style={{ height: '50vh' }} />}
                                    mapElement={<div style={{ height: '50vh' }} />}
                                />



                            </div>
                            <div className="row justify-content-center align-items-center mt-5">
                                <div className="col-12 col-md-4">
                                    <div className="row">
                                        <div className="col-2 text-right d-flex align-items-center justify-content-end">
                                            <Image src="/img/icon/visit-vector.png" width="20" height="20" />
                                        </div>
                                        <div className="col-3 d-flex align-items-center">
                                            <label className="font-bold font-normal text-green m-0">{msg.locationStart}</label>
                                        </div>
                                        <div className="col-7 pl-0">
                                            <Select
                                                borderLess
                                                placeholder={msg.fillLocation}
                                                options={formatDataForLocation(locationData)}
                                                ref={el => startAndEndPlace.current.start = el}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-2"></div>
                                        <div className="col-10">
                                            <div className="visitline w-100"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="row">
                                        <div className="col-2 text-right d-flex align-items-center justify-content-end">
                                            <Image src="/img/icon/visit-location.png" width="20" height="20" />
                                        </div>
                                        <div className="col-3 d-flex align-items-center">
                                            <label className="font-bold font-normal text-green m-0">{msg.locationEnd}</label>
                                        </div>
                                        <div className="col-7 pl-0">
                                            <Select
                                                borderLess
                                                placeholder={msg.fillLocation}
                                                options={formatDataForLocation(locationData)}
                                                ref={el => startAndEndPlace.current.end = el}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-2"></div>
                                        <div className="col-10">
                                            <div className="visitline w-100"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-3">
                                    <Button customLabel={msg.bestRoute} onClick={calBestRoute} />
                                </div>
                            </div>
                        </div>
                        :
                        null
                    }
                    <div className="mt-5 mb-4 padding-row">
                        <DragAndDropTable
                            ref={tableRef}
                            dataTable={prospectLocationAdded}
                            headerTabel={headerTabel}
                            setDataBack={setProspectLocationAdded}
                            disabledInput={disabledInput}
                            enableEdit={isAprove || isView || isEdit}
                        />
                    </div>
                    <div className="row mb-5">
                        <div className="col-12">
                            <TextField
                                isTextArea
                                fixSize
                                preventEnter
                                maxLength={150}
                                label={msg.remark}
                                ref={el => inputRef.current.remark = el}
                                defaultValue={initData && initData.remark ? initData.remark : ""}
                                disabled={disabledRemark}
                            />
                        </div>
                    </div>
                </div>
                <div className="border-top-grey row py-4 justify-content-center">
                    <div className="d-flex">
                        {((isCreateForMe && !isLeader) || (isEdit && !disabledInput && !isLeader)) && isAfterToday ?
                            <div className="mx-2">
                                <Button customLabel={msg.save} className="px-5" onClick={() => handleSave(false)} />
                            </div>
                            :
                            null
                        }
                        {isCreateForOther || isCreateForMe || (isEdit && !disabledInput) ?
                            <div className="mx-2">
                                <Button customLabel={msg.send} className="px-5" onClick={() => handleSave(true)} />
                            </div>
                            :
                            null
                        }

                        {isEdit && disabledInput && isAfterToday && isNotOwner ?
                            <div className="mx-2">
                                <Button customLabel={msg.edit} className="px-5" onClick={() => handleEdit()} />
                            </div>
                            :
                            null
                        }

                        {isEdit && disabledInput && isAfterToday && isNotOwner ?
                            <div className="mx-2">
                                <Button customLabel={msg.deleteFull} className="px-5" onClick={() => updateStatus("C")} />
                            </div>
                            :
                            null
                        }

                        {isAprove && isAfterToday ?
                            <div className="mx-2">
                                <Button customLabel={msg.reject} className="px-5" onClick={() => updateStatus("R")} />
                            </div>
                            :
                            null
                        }

                        {isAprove && isAfterToday ?
                            <div className="mx-2">
                                <Button customLabel={msg.approve} className="px-5" onClick={() => updateStatus("A")} />
                            </div>
                            :
                            null
                        }



                        {!(isCreateForMe || isCreateForOther) ?
                            <div className="mx-2">
                                <Button customLabel={msg.close} className="px-5" onClick={() => back()} />
                            </div>
                            :
                            null
                        }
                    </div>
                </div>
            </LoadScript>
        </div>
    )
}