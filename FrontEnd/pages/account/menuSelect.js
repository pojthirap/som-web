import { useRef } from "react"
import AccountTagHistory from 'pages/account/components/AccountTagHistory'
import CheckBox from '@components/Checkbox'
import Button from '@components/Button'
import CardButton from 'pages/account/components/CardButton'
import PermissionChecker from '@components/PermissionChecker';
import { getInputData, toString } from '@helper'
import { useSelector, useDispatch } from 'react-redux'
import * as prospectType from '@enum/prospectMenuType'
import * as prospectMenuPerm from '@enum/prospectMenuPerm'
import * as customerMenuPerm from '@enum/customerMenuPerm'
import * as rentstationMenuPerm from '@enum/rentstationMenuPerm'
import * as otherProspectMenuPerm from '@enum/otherProspectMenuPerm'
import * as msg from '@msg'
import * as apiPath from '@apiPath'
import { async } from "regenerator-runtime"

export default function MenuSelect({ callAPI, redirect, customAlert, getPathValue }) {
    const pathValue = getPathValue(useSelector((state) => state.pathValue));
    const dispatch = useDispatch();
    const isCustomerPage = pathValue.type == "2";
    const isOtherProspectPage = pathValue.type == "3";
    const tapCheckBoxRef = useRef({});
    const userProfile = useSelector((state) => state.userProfile);
    let permList = {}
    if (pathValue.type == "1") permList = rentstationMenuPerm;
    else if (pathValue.type == "2") permList = customerMenuPerm;
    else if (pathValue.type == "3") permList = otherProspectMenuPerm;
    else permList = prospectMenuPerm;

    const Redirect = (tab) => {
        dispatch(redirect("/account/edit", { data: pathValue.data, tab: tab, type: pathValue.type, isRecomentBu: (pathValue.isRecomentBu ? true : false), isTerritory: (pathValue.isTerritory ? true : false) }))
    }

    const handleClone = async () => {
        const inputData = getInputData(tapCheckBoxRef);
        let checkTap = []
        if (!inputData.isInvalid) {
            Object.keys(inputData.data).forEach((obj) => {
                if (inputData.data[obj]) {
                    checkTap.push(obj);
                }
            })
            const jsonRequest = {
                prospectId: toString(pathValue.data.prospect.prospectId),
                functionTab: checkTap
            }

            const jsonResponse = await callAPI(apiPath.cloneProspect, jsonRequest)
            if (jsonResponse && jsonResponse.errorCode == "S_SUCCESS") {
                customAlert(msg.cloneSuccess)
                dispatch(redirect("/account/prospect"))
            }
        }
    }

    const handleChangeCheckBox = (value, type) => {
        if (type == prospectType.ATM) {
            tapCheckBoxRef.current[prospectType.SR].setData(value)
        } else if (type == prospectType.SR) {
            tapCheckBoxRef.current[prospectType.ATM].setData(value)
        }
    }

    const CheckBoxForClone = ({ type, disabled = false, defultCheck = false }) => {
        if (isOtherProspectPage) {
            return (
                <div className="date-container">
                    <CheckBox
                        ref={el => tapCheckBoxRef.current[type] = el}
                        onChange={value => handleChangeCheckBox(value, type)}
                        disabled={disabled}
                        defaultValue={defultCheck}
                    />
                </div>
            )
        } else {
            return null;
        }
    }
    return (
        <div className="bg-gray fullScreen">
            <AccountTagHistory />
            <div className="container pb-4">
                <div className="row pb-3">
                    <span className="h1">{pathValue.data.prospectAccount.accName}</span>
                </div>
                <div className="row content-detailprospect">
                    <PermissionChecker permCode={permList.SA}>
                        <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                            <CheckBoxForClone type={prospectType.SA} />
                            <CardButton customStyle="mb-3" pageType={prospectType.SA} onClick={() => Redirect(prospectType.SA)} />
                        </div>
                    </PermissionChecker>
                    <PermissionChecker permCode={permList.FEED}>
                        <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                            <CheckBoxForClone type={prospectType.FEED} />
                            <CardButton customStyle="mb-3" pageType={prospectType.FEED} onClick={() => Redirect(prospectType.FEED)} />
                        </div>
                    </PermissionChecker>
                    <PermissionChecker permCode={permList.ST}>
                        <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                            <CheckBoxForClone type={prospectType.ST} disabled />
                            <CardButton customStyle="mb-3" pageType={prospectType.ST} onClick={() => Redirect(prospectType.ST)} />
                        </div>
                    </PermissionChecker>
                    <PermissionChecker permCode={permList.AD}>
                        <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                            <CheckBoxForClone type={prospectType.AD} />
                            <CardButton customStyle="mb-3" pageType={prospectType.AD} onClick={() => Redirect(prospectType.AD)} />
                        </div>
                    </PermissionChecker>
                    <PermissionChecker permCode={permList.CT}>
                        <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                            <CheckBoxForClone type={prospectType.CT} />
                            <CardButton customStyle="mb-3" pageType={prospectType.CT} onClick={() => Redirect(prospectType.CT)} />
                        </div>
                    </PermissionChecker>
                    {isCustomerPage ?
                        <PermissionChecker permCode={permList.SO}>
                            <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                                <CardButton customStyle="mb-3" pageType={prospectType.SO} onClick={() => Redirect(prospectType.SO)} />
                            </div>
                        </PermissionChecker>
                        :
                        null
                    }
                    <PermissionChecker permCode={permList.ATM}>
                        <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                            <CheckBoxForClone type={prospectType.ATM} />
                            <CardButton customStyle="mb-3" pageType={prospectType.ATM} onClick={() => Redirect(prospectType.ATM)} />
                        </div>
                    </PermissionChecker>
                    <PermissionChecker permCode={permList.VH}>
                        <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                            <CheckBoxForClone type={prospectType.VH} />
                            <CardButton customStyle="mb-3" pageType={prospectType.VH} onClick={() => Redirect(prospectType.VH)} />
                        </div>
                    </PermissionChecker>
                    <PermissionChecker permCode={permList.SR}>
                        <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                            <CheckBoxForClone type={prospectType.SR} />
                            <CardButton customStyle="mb-3" pageType={prospectType.SR} onClick={() => Redirect(prospectType.SR)} />
                        </div>
                    </PermissionChecker>
                    <PermissionChecker permCode={permList.RB}>
                        <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                            <CheckBoxForClone type={prospectType.RB} disabled />
                            <CardButton customStyle="mb-3" pageType={prospectType.RB} onClick={() => Redirect(prospectType.RB)} />
                        </div>
                    </PermissionChecker>
                    <PermissionChecker permCode={permList.TFSA}>
                        <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                            <CheckBoxForClone type={prospectType.TFSA} />
                            <CardButton customStyle="mb-3" pageType={prospectType.TFSA} onClick={() => Redirect(prospectType.TFSA)} />
                        </div>
                    </PermissionChecker>
                    <PermissionChecker permCode={permList.DBD}>
                        <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                            <CheckBoxForClone type={prospectType.DBD} />
                            <CardButton customStyle="mb-3" pageType={prospectType.DBD} onClick={() => Redirect(prospectType.DBD)} />
                        </div>
                    </PermissionChecker>
                    {isCustomerPage ?
                        <PermissionChecker permCode={permList.MT}>
                            <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                                <CardButton customStyle="mb-3" pageType={prospectType.MT} onClick={() => Redirect(prospectType.MT)} />
                            </div>
                        </PermissionChecker>
                        :
                        null
                    }
                    {isCustomerPage ?
                        <PermissionChecker permCode={permList.SC}>
                            <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                                <CardButton customStyle="mb-3" pageType={prospectType.SC} onClick={() => Redirect(prospectType.SC)} />
                            </div>
                        </PermissionChecker>
                        :
                        null
                    }
                    {isCustomerPage ?
                        <PermissionChecker permCode={permList.SD}>
                            <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                                <CardButton customStyle="mb-3" pageType={prospectType.SD} onClick={() => Redirect(prospectType.SD)} />
                            </div>
                        </PermissionChecker>
                        :
                        null
                    }
                    <PermissionChecker permCode={permList.AT}>
                        <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                            <CheckBoxForClone type={prospectType.AT} disabled />
                            <CardButton customStyle="mb-3" pageType={prospectType.AT} onClick={() => Redirect(prospectType.AT)} />
                        </div>
                    </PermissionChecker>
                    <PermissionChecker permCode={permList.BASIC}>
                        <div className="col-6 col-md-3 col-lg-2 d-flex justify-content-center">
                            <CheckBoxForClone type={prospectType.BASIC} disabled defultCheck />
                            <CardButton customStyle="mb-3" pageType={prospectType.BASIC} onClick={() => Redirect(prospectType.BASIC)} />
                        </div>
                    </PermissionChecker>
                </div>
                {isOtherProspectPage ?
                    <div className="row justify-content-center mt-4">
                        <div className="col-12 col-md-6 col-lg-3">
                            <Button onClick={handleClone} customLabel={msg.clone} />
                        </div>

                    </div>
                    : null
                }
            </div>
        </div >
    )
}