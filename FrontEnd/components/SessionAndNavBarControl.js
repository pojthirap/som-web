import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import NavBar from "@components/NavBar"
import SideBar from "@components/SideBar"
import { useRouter } from 'next/router'
import { removeCookie, getCookie } from "@helper";
import { useDispatch, useSelector } from 'react-redux'
import * as types from '@redux/types'
import * as msg from '@msg'
import * as apiPath from '@apiPath'
import Image from 'next/image'
function sessionAndNavBarControl({ callAPI, customAlert, children }, ref) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [toggleSizeBar, setToggleSizeBar] = useState(true);
    const userProfile = useSelector((state) => state.userProfile);
    const [isLoaddingSession, setIsLoaddingSession] = useState(true);

    useImperativeHandle(ref, () => ({
        logout() {
            return logoutFunction(false);
        }
    }));

    useEffect(() => {
        if (router.pathname != process.env.signInPath) {
            if (!(userProfile && Object.keys(userProfile).length > 0)) {
                checkSession()
            } else {
                setIsLoaddingSession(false)
            }
        } else {
            setIsLoaddingSession(false)
        }
    }, [router.pathname])

    const checkSession = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            dispatch({
                type: types.RESETUSERPROFILE
            })
            dispatch({
                type: types.RESETPERMLIST,
            })
            router.push({
                pathname: process.env.signInPath
            });
        } else {
            const jsonResponse = await callAPI(apiPath.getUserProfile, {})
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS" && jsonResponse.data && jsonResponse.data.userProfileCustom && jsonResponse.data.userProfileCustom.data && jsonResponse.data.userProfileCustom.data.length > 0) {
                let userProfile = jsonResponse.data.userProfileCustom.data[0];
                if (jsonResponse.data.orgTerritory && jsonResponse.data.orgTerritory.data) {
                    userProfile.orgTerritory = jsonResponse.data.orgTerritory.data;
                }
                if (jsonResponse.data.saleGroupSaleOfficeCustom && jsonResponse.data.saleGroupSaleOfficeCustom.data) {
                    userProfile.saleGroupSaleOfficeCustom = jsonResponse.data.saleGroupSaleOfficeCustom.data;
                }

                dispatch({
                    type: types.SETUSERPROFILE,
                    payload: userProfile,
                })

                const permList = jsonResponse && jsonResponse.data && jsonResponse.data.listPermObjCode ? jsonResponse.data.listPermObjCode : []

                dispatch({
                    type: types.SETPERMLIST,
                    payload: permList,
                })
                setIsLoaddingSession(false)
            } else {
                localStorage.removeItem('token');
                dispatch({
                    type: types.RESETUSERPROFILE
                })
                dispatch({
                    type: types.RESETPERMLIST,
                })
                router.push({
                    pathname: process.env.signInPath
                });
            }

        }
    }

    function toggleSideBar() {
        setToggleSizeBar(!toggleSizeBar);
    }
    function getToggleSizeBar() {
        return toggleSizeBar;
    }
    function getSdeBarClass() {
        return toggleSizeBar ? " open" : "";
    }

    const logoutFunction = async (isCallLogout) => {
        if (isCallLogout) {
            await callAPI(apiPath.logout, {})
        }
        localStorage.removeItem('token');
        dispatch({
            type: types.RESETUSERPROFILE
        })
        dispatch({
            type: types.RESETPERMLIST
        })
        router.push({
            pathname: process.env.signInPath
        });
    }
    if (router.pathname == process.env.signInPath) {
        return (
            <div className="wrapper">
                {children}
            </div>
        )
    }
    return (
        <div className="wrapper">
            <SideBar
                setToggleSizeBar={toggleSideBar}
                getToggleSizeBar={getToggleSizeBar}
                menuPath={menuPath}
            />
            <NavBar menuPath={menuPath} logoutFunction={() => { customAlert(msg.confirmLogout, "Q", async () => { logoutFunction(true) }) }} />
            <div className={"content" + getSdeBarClass()}>
                <div className="contentBlackScreen" onClick={() => { toggleSideBar("S") }}></div>
                <div className="contentContainer">
                    {isLoaddingSession ? <div className="m4">Loading session...</div> : children}
                </div>
            </div>
        </div>
    )
}

const menuPath = {
    home: { path: "/", label: "Home" },
    account: {
        label: "Account",
        permCode: "FE_ACC",
        prospect: {
            path: "/account/prospect",
            label: msg.prospect,
            permCode: "FE_ACC_PROSP",
            subMenuPath: [
                { path: "/account/createProspect" },
                { path: "/account/menuSelect", valueKey: "type", value: "0" },
                { path: "/account/edit", valueKey: "type", value: "0" },
            ]
        },
        customer: {
            path: "/account/customer",
            label: msg.customer,
            permCode: "FE_ACC_CUST",
            subMenuPath: [
                { path: "/account/menuSelect", valueKey: "type", value: "2" },
                { path: "/account/edit", valueKey: "type", value: "2" },
            ]
        },
        rentstation: {
            path: "/account/rentstation",
            label: msg.rentstation,
            permCode: "FE_ACC_PUMP",
            subMenuPath: [
                { path: "/account/menuSelect", valueKey: "type", value: "1" },
                { path: "/account/edit", valueKey: "type", value: "1" },
            ]
        },
        otherprospect: {
            path: "/account/otherProspect",
            label: msg.otherProspect,
            permCode: "FE_ACC_OTHER",
            subMenuPath: [
                { path: "/account/menuSelect", valueKey: "type", value: "3" },
                { path: "/account/edit", valueKey: "type", value: "3" },
            ]
        },
    },
    salesVisitPlan: {
        path: "/visitPlan/main",
        label: "Sales Visit Plan",
        permCode: "FE_PLAN_TRIP",
        subMenuPath: [
            { path: "/visitPlan/createOrEdit" },
            { path: "/visitPlan/editTask" },
            { path: "/visitPlan/editLocation" }
        ]
    },
    saleOrder: {
        path: "/saleOrder/main", permCode: "FE_SALEORD", label: "Sales Order",
        subMenuPath: [
            { path: "/saleOrder/addEdit" },
        ]
    },
    report: {
        label: "Report",
        permCode: "FE_REP",
        visitPlanRawData: { path: "/report/visitPlanRawData", label: "VisitPlan Rawdata", permCode: "FE_REP_MENU01" },
        visitPlanTransaction: { path: "/report/visitPlanTransaction", label: "VisitPlan Transaction", permCode: "FE_REP_MENU02" },
        visitPlanDaily: { path: "/report/visitPlanDaily", label: "VisitPlan Daily", permCode: "FE_REP_MENU03" },
        visitPlanMonthly: { path: "/report/visitPlanMonthly", label: "VisitPlan Monthly", permCode: "FE_REP_MENU04" },
        visitPlanActual: { path: "/report/visitPlanActual", label: "VisitPlan Actual", permCode: "FE_REP_MENU05" },
        meterRawdata: { path: "/report/meterRawData", label: "Meter Rawdata", permCode: "FE_REP_MENU06" },
        meterTransaction: { path: "/report/meterTransaction", label: "Meter Transaction", permCode: "FE_REP_MENU07" },
        stockCardRawdata: { path: "/report/stockCardRawData", label: "StockCard Rawdata", permCode: "FE_REP_MENU08" },
        stockCardCustomerSummary: { path: "/report/stockCardCustomerSummary", label: "StockCard CustomerSummary", permCode: "FE_REP_MENU09" },
        prospectRawdata: { path: "/report/prospectRawData", label: "Prospect Rawdata", permCode: "FE_REP_MENU10" },
        prospectPerformanePerSaleRep: { path: "/report/prospectPerformancePerSaleRep", label: "Prospect PerformanePerSaleRep", permCode: "FE_REP_MENU11" },
        prospectPerformanePerSaleGroup: { path: "/report/prospectPerformancePerSaleGroup", label: "Prospect PerformanePerSaleGroup", permCode: "FE_REP_MENU12" },
        saleOrderRawdata: { path: "/report/saleOrderRawdata", label: "SaleOrder Rawdata", permCode: "FE_REP_MENU13" },
        saleOrderByChannel: { path: "/report/saleOrderByChannel", label: "SaleOrder ByChannel", permCode: "FE_REP_MENU14" },
        saleOrderByCompany: { path: "/report/saleOrderByCompany", label: "SaleOrder ByCompany", permCode: "FE_REP_MENU15" },
        assign: { path: "/report/assign", label: "Assign", permCode: "FE_REP_MENU16" },
        imageInTemplate: { path: "/report/imageInTemplate", label: "Image in Template", permCode: "FE_REP_MENU17" }
    },
    masterData: {
        label: "Master Data",
        permCode: "FE_MAS",
        qrMaster: { path: "/masterData/qrMaster", label: "QR Master", permCode: "FE_MAS_QR" },
        locationMaster: { path: "/masterData/location", label: "Location (สถานที่)", permCode: "FE_MAS_LOC" },
    }
}

export default forwardRef(sessionAndNavBarControl)