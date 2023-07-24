import { useState } from 'react';
import NavBar from "@components/NavBar"
import SideBar from "@components/SideBar"
import { useRouter } from 'next/router'
import * as msg from '@msg'
function
    navBarWrapper({ callAPI, children }) {
    const router = useRouter();
    const [toggleSizeBar, setToggleSizeBar] = useState(true);

    function toggleSideBar() {
        setToggleSizeBar(!toggleSizeBar);
    }
    function getToggleSizeBar() {
        return toggleSizeBar;
    }
    function getSdeBarClass() {
        return toggleSizeBar ? " open" : "";
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
            <NavBar callAPIFunction={callAPI} menuPath={menuPath} />
            <div className={"content" + getSdeBarClass()}>
                <div className="contentBlackScreen" onClick={() => { toggleSideBar("S") }}></div>
                <div className="contentContainer">
                    {children}
                </div>
            </div>
        </div>
    )
}

const menuPath = {
    home: { path: "/", label: "Home" },
    account: {
        label: "Account",
        prospect: {
            path: "/account/prospect",
            label: msg.prospect,
            subMenuPath: ["/account/createProspect"],
            subMenuWithValue: [
                { path: "/account/menuSelect", valueKey: "type", value: "0" },
                { path: "/account/edit", valueKey: "type", value: "0" }
            ]
        },
        customer: {
            path: "/account/customer",
            label: msg.customer,
            subMenuWithValue: [
                { path: "/account/menuSelect", valueKey: "type", value: "2" },
                { path: "/account/edit", valueKey: "type", value: "2" }
            ]
        },
        rentstation: {
            path: "/account/rentstation",
            label: msg.rentstation,
            subMenuWithValue: [
                { path: "/account/menuSelect", valueKey: "type", value: "1" },
                { path: "/account/edit", valueKey: "type", value: "1" }
            ]
        },
        otherprospect: {
            path: "/account/otherProspect",
            label: msg.otherProspect,
            subMenuWithValue: [
                { path: "/account/menuSelect", valueKey: "type", value: "3" },
                { path: "/account/edit", valueKey: "type", value: "3" }
            ]
        },
    },
    salesVisitPlan: {
        path: "/visitPlan/main",
        label: "Sales Visit Plan",
        subMenuPath: ["/visitPlan/createOrEdit", "/visitPlan/editTask"]
    },
    saleOrder: { path: "/saleOrder/main", label: "Sales Order" },
    report: {
        label: "Report",
        visitPlanRawData: { path: "/report/visitPlanRawData", label: "VisitPlan Rawdata" },
        visitPlanTransaction: { path: "/9", label: "VisitPlan Transaction" },
        visitPlanDaily: { path: "/10", label: "VisitPlan daily" },
        visitPlanMonthly: { path: "/11", label: "VisitPlan monthly" },
        visitPlanActual: { path: "/12", label: "VisitPlan actual" },
        meterRawdata: { path: "/13", label: "Meter rawdata" },
        meterTransaction: { path: "/14", label: "Meter Transaction" },
        stockCardRawdata: { path: "/15", label: "StockCard Rawdata" },
        stockCardCustomerSummary: { path: "/16", label: "StockCard CustomerSummary" },
        prospectRawdata: { path: "/17", label: "Prospect Rawdata" },
        prospectPerformanePerSaleRep: { path: "/18", label: "Prospect PerformanePerSaleRep" },
        prospectPerformanePerSaleGroup: { path: "/19", label: "Prospect PerformanePerSaleGroup" },
        saleOrderRawdata: { path: "/20", label: "SaleOrder Rawdata" },
        saleOrderByChannel: { path: "/21", label: "SaleOrder ByChannel" },
        saleOrderByCompany: { path: "/22", label: "SaleOrder ByCompany" },
        assign: { path: "/23", label: "Assign" },
    },
    masterData: {
        label: "Master Data",
        qrMaster: { path: "/masterData/qrMaster", label: "QR Master" },
        locationMaster: { path: "/masterData/location", label: "Location Master" },
    }
}

export default navBarWrapper