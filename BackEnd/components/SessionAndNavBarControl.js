import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import NavBar from "@components/NavBar"
import SideBar from "@components/SideBar"
import { useRouter } from 'next/router'
import { removeCookie, getCookie } from "@helper";
import { useDispatch, useSelector } from 'react-redux'
import * as types from '@redux/types'
import * as msg from '@msg'
import * as apiPath from '@apiPath'

function sessionAndNavBarControl({ callAPI, customAlert, children }, ref) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [toggleMediumSize, setToggleMediumSize] = useState(true);
    const [toggleSmallSize, setToggleSmallSize] = useState(false);
    const userProfile = useSelector((state) => state.userProfile);
    const [isLoaddingSession, setIsLoaddingSession] = useState(false);

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
                    type: types.RESETPERMLIST,
                })
                dispatch({
                    type: types.RESETUSERPROFILE
                })
                router.push({
                    pathname: process.env.signInPath
                });
            }
        }
    }

    function toggleSideBar(size) {
        if (size == "M") {
            setToggleMediumSize(!toggleMediumSize);
        } else if (size == "S") {
            setToggleSmallSize(!toggleSmallSize);
        }
    }
    function getSdeBarClass() {
        return ((toggleMediumSize ? " openM" : "") + (toggleSmallSize ? " openS" : ""))
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
                toggleSideBar={toggleSideBar}
                getSdeBarClass={getSdeBarClass}
                menuPath={menuPath}
            />
            <div className={"content" + getSdeBarClass()}>
                <div className="contentBlackScreen" onClick={() => { toggleSideBar("S") }}></div>
                <NavBar logoutFunction={() => { customAlert(msg.confirmLogout, "Q", async () => { logoutFunction(true) }) }} />
                <div className="contentContainer">
                    {isLoaddingSession ? <div className="m4">Loading session...</div> : children}
                </div>
            </div>
        </div>
    )
}

const menuPath = {
    organizational: {
        permCode: "BE_ORG",
        company: { path: "/organizational/company", label: msg.companySubMenu, permCode: "BE_ORG_COM" },
        saleOrg: { path: "/organizational/saleOrg", label: msg.saleOrgSubMenu, permCode: "BE_ORG_ORG" },
        channel: { path: "/organizational/channel", label: msg.channelSubMenu, permCode: "BE_ORG_CHANNEL" },
        division: { path: "/organizational/division", label: msg.divisionSubMenu, permCode: "BE_ORG_DIV" },
        saleOffice: { path: "/organizational/saleOffice", label: msg.saleOfficeSubMenu, permCode: "BE_ORG_OFF" },
        saleGroup: { path: "/organizational/saleGroup", label: msg.saleGroupSubMenu, permCode: "BE_ORG_GROUP", subMenuPath: ["/organizational/saleGroupEdit"] },
        saleRep: { path: "/organizational/saleRep", label: msg.saleRepSubMenu, permCode: "BE_ORG_REP" },
        mappingApprover: { path: "/organizational/mappingApprover", label: msg.mappingApproverSubMenu, permCode: "BE_ORG_MAPAP" },
        roleOnSOM: { path: "/organizational/roleOnSOM", label: msg.roleOnSOMSubMenu, permCode: "BE_ORG_ROLE" },
        saleArea: { path: "/organizational/saleArea", label: msg.saleAreaSubMenu, permCode: "BE_ORG_AREA" },
        businessUnit: { path: "/organizational/businessUnit", label: msg.businessUnitSubMenu, permCode: "BE_ORG_BU" },
        plant: { path: "/organizational/plant", label: msg.plantSubMenu, permCode: "BE_ORG_PLANT" },
        shippingPoint: { path: "/organizational/shippingPoint", label: msg.shippingPointSubMenu, permCode: "BE_ORG_SHIP" },
        territory: { path: "/organizational/territory", label: msg.territorySubMenu, permCode: "BE_ORG_TERT", subMenuPath: ["/organizational/territoryEdit"] },
        userGroup: { path: "/organizational/userGroup", label: msg.userGroupMenu, permCode: "BE_ORG_GROUP_APP" },
        acessRights: { path: "/organizational/acessRights", label: msg.acessRightsMenu, permCode: "BE_ORG_GROUP_PERM" }
    },
    master: {
        permCode: "BE_MAS",
        mappingRegionWithProvince: { path: "/master/mappingRegionWithProvince", label: msg.mappingRegionWithProvinceSubMenu, permCode: "BE_MAS_REGION", subMenuPath: ["/master/mappingRegionWithProvinceEdit"] },
        province: { path: "/master/province", label: msg.provinceSubMenu, permCode: "BE_MAS_PROV" },
        district: { path: "/master/district", label: msg.districtSubMenu, permCode: "BE_MAS_DIST" },
        subDistrict: { path: "/master/subDistrict", label: msg.subDistrictSubMenu, permCode: "BE_MAS_SUBDIST" },
    },
    visitPlant: {
        permCode: "BE_SITEVISIT",
        brand: { path: "/visitPlant/brand", label: msg.brandSubMenu, permCode: "BE_SITEVISIT_BRAND" },
        location: { path: "/visitPlant/location", label: msg.locationSubMenu, permCode: "BE_SITEVISIT_LOC" },
        locationType: { path: "/visitPlant/locationType", label: msg.locationTypeSubMenu, permCode: "BE_SITEVISIT_LOCT" },
        catagories: { path: "/visitPlant/catagories", label: msg.catagoriesSubMenu, permCode: "BE_SITEVISIT_CATE" },
        service: { path: "/visitPlant/service", label: msg.serviceSubMenu, permCode: "BE_SITEVISIT_SERV" },
        bank: { path: "/visitPlant/bank", label: msg.bankSubMenu, permCode: "BE_SITEVISIT_BANK" },
        templateCategory: { path: "/visitPlant/templateCategory", label: msg.templateCategorySubMenu, permCode: "BE_SITEVISIT_TPCATE" },
        template: { path: "/visitPlant/template", label: msg.templateSubMenu, subMenuPath: ["/visitPlant/templateEdit"], permCode: "BE_SITEVISIT_TP" },
        question: { path: "/visitPlant/question", label: msg.questionSubMenu, permCode: "BE_SITEVISIT_QUESTION" },
        acttachmentCatagories: { path: "/visitPlant/acttachmentCatagories", label: msg.acttachmentCatagoriesSubMenu, permCode: "BE_SITEVISIT_ATTCATE" },
        templateStockCard: { path: "/visitPlant/templateStockCard", label: msg.templateStockCardSubMenu, permCode: "BE_SITEVISIT_TPSTOCK", subMenuPath: ["/visitPlant/templateStockCardAddProduct"] },
        templateForSA: { path: "/visitPlant/templateForSA", label: msg.templateForSASubMenu, permCode: "BE_SITEVISIT_TPSA", subMenuPath: ["/visitPlant/templateForSAEdit"] },
        product: { path: "/visitPlant/product", label: msg.productSubMenu, permCode: "BE_SITEVISIT_GASOLINE" },
        reasonNotVisit: { path: "/visitPlant/reasonNotVisit", label: msg.reasonNotVisitSubMenu, permCode: "BE_SITEVISIT_REASON" },
        qrMaster: { path: "/visitPlant/qrMaster", label: msg.qrMasterSubMenu, permCode: "BE_SITEVISIT_QR" }
    },
    saleArea: {
        permCode: "BE_SALEORD",
        product: { path: "/saleArea/product", label: msg.productSaleAreaSubMenu, permCode: "BE_SALEORD_PROD" }
    }
}
export default forwardRef(sessionAndNavBarControl)