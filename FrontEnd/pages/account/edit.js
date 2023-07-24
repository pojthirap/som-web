import { useState, useRef, useEffect } from 'react';
import AccountTagHistory from 'pages/account/components/AccountTagHistory'
import { useDispatch, useSelector } from 'react-redux'
import { toString } from '@helper'
import CardButton from 'pages/account/components/CardButton'
import PermissionChecker from '@components/PermissionChecker';
import SA from './editTab/SA'
import Feed from './editTab/Feed'
import SalesTerritory from './editTab/SalesTerritory'
import Address from './editTab/Address'
import Contacts from './editTab/Contacts'
import SaleOrder from './editTab/SaleOrder'
import Attachments from './editTab/Attachments'
import VisitingHours from './editTab/VisitingHours'
import SurveyResults from './editTab/SurveyResults'
import RecommendBU from './editTab/RecommendBU'
import TemplateForSA from './editTab/TemplateForSA'
import DBD from './editTab/DBD'
import Meter from './editTab/Meter'
import StockCount from './editTab/StockCount'
import SalesData from './editTab/SalesData'
import AccountTeam from './editTab/AccountTeam'
import Basic from './editTab/Basic'
import * as prospectType from '@enum/prospectMenuType'
import * as prospectMenuPerm from '@enum/prospectMenuPerm'
import * as customerMenuPerm from '@enum/customerMenuPerm'
import * as rentstationMenuPerm from '@enum/rentstationMenuPerm'
import * as otherProspectMenuPerm from '@enum/otherProspectMenuPerm'
import * as apiPath from '@apiPath'

export default function Edit(pageProp) {
    const { getPathValue, updateCurrentPathValue, callAPI } = pageProp;
    const focusDivRef = useRef(null);
    const dispatch = useDispatch();
    const pathValue = getPathValue(useSelector((state) => state.pathValue));
    const [currentTab, setCurrentTab] = useState(pathValue.tab);
    const isCustomerPage = pathValue.type == "2";
    let permList = {}
    if (pathValue.type == "1") permList = rentstationMenuPerm;
    else if (pathValue.type == "2") permList = customerMenuPerm;
    else if (pathValue.type == "3") permList = otherProspectMenuPerm;
    else permList = prospectMenuPerm;

    useEffect(() => {
        focusDivRef.current.scrollIntoView();
    }, [])
    const onTabSelect = (type) => {
        setCurrentTab(type)
        pathValue.tab = type;
        dispatch(updateCurrentPathValue(pathValue));
    }

    const updateProspectData = async () => {
        const jsonRequest = {
            searchOption: 0,
            searchOrder: 0,
            startRecord: 0,
            length: 0,
            pageNo: 1,
            model: {
                prospectId: toString(pathValue.data.prospect.prospectId),
                prospectType: pathValue.type,
                activeFlag: "Y"
            }
        }
        const jsonResponse = await callAPI(apiPath.searchMyAccount, { ...jsonRequest })
        if (jsonResponse && jsonResponse.data && jsonResponse.data.records && jsonResponse.data.records.length == 1) {
            let tmpPathvalue = { ...pathValue };
            tmpPathvalue.data = jsonResponse.data.records[0];
            dispatch(updateCurrentPathValue(tmpPathvalue));
        }
    }

    const Content = () => {
        let pagePropAndPathValue = { ...pageProp };
        pagePropAndPathValue.pathValue = pathValue;
        pagePropAndPathValue.updateProspectData = () => updateProspectData();

        switch (currentTab) {
            case prospectType.SA:
                return <SA {...pagePropAndPathValue} />
            case prospectType.FEED:
                return <Feed {...pagePropAndPathValue} />
            case prospectType.ST:
                return <SalesTerritory {...pagePropAndPathValue} />
            case prospectType.AD:
                return <Address {...pagePropAndPathValue} />
            case prospectType.CT:
                return <Contacts {...pagePropAndPathValue} />
            case prospectType.SO:
                return <SaleOrder {...pagePropAndPathValue} />
            case prospectType.ATM:
                return <Attachments {...pagePropAndPathValue} />
            case prospectType.VH:
                return <VisitingHours {...pagePropAndPathValue} />
            case prospectType.SR:
                return <SurveyResults {...pagePropAndPathValue} />
            case prospectType.RB:
                return <RecommendBU {...pagePropAndPathValue} />
            case prospectType.TFSA:
                return <TemplateForSA {...pagePropAndPathValue} />
            case prospectType.DBD:
                return <DBD {...pagePropAndPathValue} />
            case prospectType.MT:
                return <Meter {...pagePropAndPathValue} />
            case prospectType.SC:
                return <StockCount {...pagePropAndPathValue} />
            case prospectType.SD:
                return <SalesData {...pagePropAndPathValue} />
            case prospectType.AT:
                return <AccountTeam {...pagePropAndPathValue} />
            case prospectType.BASIC:
                return <Basic {...pagePropAndPathValue} />
            default:
                return <div className="d-flex justify-content-center h1 mt-5">ไม่พบ TAB</div>
        }
    }
    return (
        <div className="fullScreen">
            <AccountTagHistory />
            <div className="bg-gray">
                <div className="container pb-3">
                    <div className="accountTabContainer">
                        <PermissionChecker permCode={permList.SA}>
                            <div key={1} className="accountTabItem" ref={pathValue.tab == prospectType.SA ? focusDivRef : null}>
                                <CardButton pageType={prospectType.SA} onClick={() => onTabSelect(prospectType.SA)} notActive={prospectType.SA != currentTab} />
                            </div>
                        </PermissionChecker>
                        <PermissionChecker permCode={permList.FEED}>
                            <div key={2} className="accountTabItem" ref={pathValue.tab == prospectType.FEED ? focusDivRef : null}>
                                <CardButton pageType={prospectType.FEED} onClick={() => onTabSelect(prospectType.FEED)} notActive={prospectType.FEED != currentTab} />
                            </div>
                        </PermissionChecker>
                        <PermissionChecker permCode={permList.ST}>
                            <div key={3} className="accountTabItem" ref={pathValue.tab == prospectType.ST ? focusDivRef : null}>
                                <CardButton pageType={prospectType.ST} onClick={() => onTabSelect(prospectType.ST)} notActive={prospectType.ST != currentTab} />
                            </div>
                        </PermissionChecker>
                        <PermissionChecker permCode={permList.AD}>
                            <div key={4} className="accountTabItem" ref={pathValue.tab == prospectType.AD ? focusDivRef : null}>
                                <CardButton pageType={prospectType.AD} onClick={() => onTabSelect(prospectType.AD)} notActive={prospectType.AD != currentTab} />
                            </div>
                        </PermissionChecker>
                        <PermissionChecker permCode={permList.CT}>
                            <div key={5} className="accountTabItem" ref={pathValue.tab == prospectType.CT ? focusDivRef : null}>
                                <CardButton pageType={prospectType.CT} onClick={() => onTabSelect(prospectType.CT)} notActive={prospectType.CT != currentTab} />
                            </div>
                        </PermissionChecker>
                        {isCustomerPage ?
                            <PermissionChecker permCode={permList.SO}>
                                <div key={5} className="accountTabItem" ref={pathValue.tab == prospectType.SO ? focusDivRef : null}>
                                    <CardButton pageType={prospectType.SO} onClick={() => onTabSelect(prospectType.SO)} notActive={prospectType.SO != currentTab} />
                                </div>
                            </PermissionChecker>
                            :
                            null
                        }
                        <PermissionChecker permCode={permList.ATM}>
                            <div key={6} className="accountTabItem" ref={pathValue.tab == prospectType.ATM ? focusDivRef : null}>
                                <CardButton pageType={prospectType.ATM} onClick={() => onTabSelect(prospectType.ATM)} notActive={prospectType.ATM != currentTab} />
                            </div>
                        </PermissionChecker>
                        <PermissionChecker permCode={permList.VH}>
                            <div key={7} className="accountTabItem" ref={pathValue.tab == prospectType.VH ? focusDivRef : null}>
                                <CardButton pageType={prospectType.VH} onClick={() => onTabSelect(prospectType.VH)} notActive={prospectType.VH != currentTab} />
                            </div>
                        </PermissionChecker>
                        <PermissionChecker permCode={permList.SR}>
                            <div key={8} className="accountTabItem" ref={pathValue.tab == prospectType.SR ? focusDivRef : null}>
                                <CardButton pageType={prospectType.SR} onClick={() => onTabSelect(prospectType.SR)} notActive={prospectType.SR != currentTab} />
                            </div>
                        </PermissionChecker>
                        <PermissionChecker permCode={permList.RB}>
                            <div key={9} className="accountTabItem" ref={pathValue.tab == prospectType.RB ? focusDivRef : null}>
                                <CardButton pageType={prospectType.RB} onClick={() => onTabSelect(prospectType.RB)} notActive={prospectType.RB != currentTab} />
                            </div>
                        </PermissionChecker>
                        <PermissionChecker permCode={permList.TFSA}>
                            <div key={10} className="accountTabItem" ref={pathValue.tab == prospectType.TFSA ? focusDivRef : null} >
                                <CardButton pageType={prospectType.TFSA} onClick={() => onTabSelect(prospectType.TFSA)} notActive={prospectType.TFSA != currentTab} />
                            </div>
                        </PermissionChecker>
                        <PermissionChecker permCode={permList.DBD}>
                            <div key={11} className="accountTabItem" ref={pathValue.tab == prospectType.DBD ? focusDivRef : null}>
                                <CardButton pageType={prospectType.DBD} onClick={() => onTabSelect(prospectType.DBD)} notActive={prospectType.DBD != currentTab} />
                            </div>
                        </PermissionChecker>
                        {isCustomerPage ?
                            <PermissionChecker permCode={permList.MT}>
                                <div key={12} className="accountTabItem" ref={pathValue.tab == prospectType.MT ? focusDivRef : null}>
                                    <CardButton pageType={prospectType.MT} onClick={() => onTabSelect(prospectType.MT)} notActive={prospectType.MT != currentTab} />
                                </div>
                            </PermissionChecker>
                            :
                            null
                        }
                        {isCustomerPage ?
                            <PermissionChecker permCode={permList.SC}>
                                <div key={12} className="accountTabItem" ref={pathValue.tab == prospectType.SC ? focusDivRef : null}>
                                    <CardButton pageType={prospectType.SC} onClick={() => onTabSelect(prospectType.SC)} notActive={prospectType.SC != currentTab} />
                                </div>
                            </PermissionChecker>
                            :
                            null
                        }
                        {isCustomerPage ?
                            <PermissionChecker permCode={permList.SD}>
                                <div key={12} className="accountTabItem" ref={pathValue.tab == prospectType.SD ? focusDivRef : null}>
                                    <CardButton pageType={prospectType.SD} onClick={() => onTabSelect(prospectType.SD)} notActive={prospectType.SD != currentTab} />
                                </div>
                            </PermissionChecker>
                            :
                            null
                        }
                        <PermissionChecker permCode={permList.AT}>
                            <div key={12} className="accountTabItem" ref={pathValue.tab == prospectType.AT ? focusDivRef : null}>
                                <CardButton pageType={prospectType.AT} onClick={() => onTabSelect(prospectType.AT)} notActive={prospectType.AT != currentTab} />
                            </div>
                        </PermissionChecker>
                        <PermissionChecker permCode={permList.BASIC}>
                            <div key={13} className="accountTabItem" ref={pathValue.tab == prospectType.BASIC ? focusDivRef : null}>
                                <CardButton pageType={prospectType.BASIC} onClick={() => onTabSelect(prospectType.BASIC)} notActive={prospectType.BASIC != currentTab} />
                            </div>
                        </PermissionChecker>
                    </div>
                </div>
            </div>
            {Content()}
        </div>
    )
}