import { useState, useRef, forwardRef } from "react"
import Image from 'next/image'
import * as msg from '@msg'
import * as prospectType from '@enum/prospectMenuType'

export default function CardButton(props, ref) {
    const {
        customStyle,
        onClick,
        pageType,
        notActive
    } = props;

    let label = "";
    let image = "";

    if (pageType == prospectType.SA) { label = msg.labelSA, image = "/img/iconProspect/Show.png" }
    else if (pageType == prospectType.FEED) { label = msg.labelFeed, image = "/img/iconProspect/Lock.png" }
    else if (pageType == prospectType.ST) { label = msg.labelSalesTerritory, image = "/img/iconProspect/Send.png" }
    else if (pageType == prospectType.AD) { label = msg.labelAddress, image = "/img/iconProspect/Address.png" }
    else if (pageType == prospectType.SO) { label = msg.labelSaleOrder, image = "/img/iconProspect/ShoppingCart.png" }
    else if (pageType == prospectType.CT) { label = msg.labelContact, image = "/img/iconProspect/Contact.png" }
    else if (pageType == prospectType.ATM) { label = msg.labelAttachments, image = "/img/iconProspect/Paper.png" }
    else if (pageType == prospectType.VH) { label = msg.labelVisitingHours, image = "/img/iconProspect/Clock.png" }
    else if (pageType == prospectType.SR) { label = msg.labelSurveyResults, image = "/img/iconProspect/Search.png" }
    else if (pageType == prospectType.RB) { label = msg.labelRecommendBU, image = "/img/iconProspect/Bookmark.png" }
    else if (pageType == prospectType.TFSA) { label = msg.labelTemplateForSA, image = "/img/iconProspect/Template.png" }
    else if (pageType == prospectType.DBD) { label = msg.labelDBD, image = "/img/iconProspect/dbd.png" }
    else if (pageType == prospectType.MT) { label = msg.labelMeter, image = "/img/iconProspect/Group.png" }
    else if (pageType == prospectType.SC) { label = msg.labelStockCount, image = "/img/iconProspect/ShoppingBag.png" }
    else if (pageType == prospectType.SD) { label = msg.labelSaleData, image = "/img/iconProspect/Chart.png" }
    else if (pageType == prospectType.AT) { label = msg.labelAccountTeam, image = "/img/iconProspect/Account.png" }
    else if (pageType == prospectType.BASIC) { label = msg.labelBasic, image = "/img/iconProspect/Paper.png" }

    return (
        <button className={"cardButton " + (customStyle ? customStyle : "")} onClick={() => onClick()}>
            <Image src={image} width="77" height="77" className={notActive ? "notActive" : ""} />
            <p> {label} </p>
        </button>
    )


}
