import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { getPathValue } from '@helper'
import Image from 'next/image'
import * as msg from '@msg'
import * as prospectType from '@enum/prospectMenuType'
import Head from 'next/head'

export default function Main() {
    const router = useRouter();
    const pathValue = getPathValue(useSelector((state) => state.pathValue), router.pathname);
    let mainPagePath = null
    let namePath = null
    let menuPath = null

    if (router.pathname == "/account/prospect") mainPagePath = msg.prospect;
    else if (router.pathname == "/account/createProspect") mainPagePath = msg.createProspect;
    else if (router.pathname == "/account/customer") mainPagePath = msg.customer;
    else if (router.pathname == "/account/rentstation") mainPagePath = msg.rentstation;
    else if (router.pathname == "/account/otherProspect") mainPagePath = msg.otherProspect;
    else if (router.pathname == "/account/menuSelect" || router.pathname == "/account/edit") {
        namePath = pathValue.data.prospectAccount.accName
        if (pathValue.type == "0") mainPagePath = msg.prospect;
        else if (pathValue.type == "2") mainPagePath = msg.customer;
        else if (pathValue.type == "1") mainPagePath = msg.rentstation;
        else if (pathValue.type == "3") mainPagePath = msg.otherProspect;

        if (router.pathname == "/account/edit") {
            const currentTab = pathValue.tab

            switch (currentTab) {
                case prospectType.SA:
                    menuPath = msg.labelSA
                    break;
                case prospectType.FEED:
                    menuPath = msg.labelFeed
                    break;
                case prospectType.ST:
                    menuPath = msg.labelSalesTerritory
                    break;
                case prospectType.AD:
                    menuPath = msg.labelAddress
                    break;
                case prospectType.CT:
                    menuPath = msg.labelContact
                    break;
                case prospectType.SO:
                    menuPath = msg.labelSaleOrder
                    break;
                case prospectType.ATM:
                    menuPath = msg.labelAttachments
                    break;
                case prospectType.VH:
                    menuPath = msg.labelVisitingHours
                    break;
                case prospectType.SR:
                    menuPath = msg.labelSurveyResults
                    break;
                case prospectType.RB:
                    menuPath = msg.labelRecommendBU
                    break;
                case prospectType.TFSA:
                    menuPath = msg.labelTemplateForSA
                    break;
                case prospectType.DBD:
                    menuPath = msg.labelDBD
                    break;
                case prospectType.MT:
                    menuPath = msg.labelMeter
                    break;
                case prospectType.SC:
                    menuPath = msg.labelStockCount
                    break;
                case prospectType.SD:
                    menuPath = msg.labelSaleData
                    break;
                case prospectType.AT:
                    menuPath = msg.labelAccountTeam
                    break;
                case prospectType.BASIC:
                    menuPath = msg.labelBasic
                    break;
                default:
                    menuPath = null
                    break;
            }
        }
    }

    return (
        <div className="tag-history">
            <Head>
                <title>{menuPath ? menuPath : namePath ? msg.detailProspect : mainPagePath}</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <div className="container p-0">
                <div className=" padding-row row align-items-center primaryLabel">
                    <Image src="/img/icon/icon-account.png" width="24" height="24" />
                    <div><span className="ml-2">/</span><span className="ml-2">{mainPagePath}</span></div>
                    {namePath ? <div><span className="ml-2">/</span><span className="ml-2">{namePath}</span></div> : null}
                    {menuPath ? <div><span className="ml-2">/</span><span className="ml-2">{menuPath}</span></div> : null}

                </div>
            </div>
        </div>
    )
}
