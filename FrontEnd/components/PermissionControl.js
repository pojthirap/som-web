import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'

export default function permissionControl({ children }) {
    const pageList = [
        { path: "/account/prospect", permCode: "FE_ACC_PROSP_S01" },
        { path: "/account/createProspect", permCode: "FE_ACC_PROSP_S011" },
        { path: "/account/menuSelect", permCode: "FE_ACC_PROSP_S012", valueKey: "type", value: "0" },
        { path: "/account/edit", permCode: "FE_ACC_PROSP_S012", valueKey: "type", value: "0" },

        { path: "/account/customer", permCode: "FE_ACC_CUST_S01" },
        { path: "/account/menuSelect", permCode: "FE_ACC_CUST_S011", valueKey: "type", value: "2" },
        { path: "/account/edit", permCode: "FE_ACC_CUST_S011", valueKey: "type", value: "2" },

        { path: "/account/rentstation", permCode: "FE_ACC_PUMP_S01" },
        { path: "/account/menuSelect", permCode: "FE_ACC_PUMP_S011", valueKey: "type", value: "1" },
        { path: "/account/edit", permCode: "FE_ACC_PUMP_S011", valueKey: "type", value: "1" },

        { path: "/account/otherProspect", permCode: "FE_ACC_OTHER_S01" },
        { path: "/account/menuSelect", permCode: "FE_ACC_OTHER_S011", valueKey: "type", value: "3" },
        { path: "/account/edit", permCode: "FE_ACC_OTHER_S011", valueKey: "type", value: "3" },

        { path: "/visitPlan/main", permCode: "FE_PLAN_TRIP_S01" },
        { path: "/visitPlan/createOrEdit", permCode: "FE_PLAN_TRIP_S011", valueKey: "type", value: ["M", "O"] },
        { path: "/visitPlan/createOrEdit", permCode: "FE_PLAN_TRIP_S013", valueKey: "type", value: "E" },
        { path: "/visitPlan/createOrEdit", permCode: "FE_PLAN_TRIP_S015", valueKey: "type", value: ["V", "A"] },
        { path: "/visitPlan/editTask", permCode: "FE_PLAN_TRIP_S014" },
        { path: "/visitPlan/editLocation", permCode: "FE_PLAN_TRIP_S014" },

        { path: "/saleOrder/main", permCode: "FE_SALEORD_S01" },
        { path: "/saleOrder/addEdit", permCode: ["FE_SALEORD_S011", "FE_SALEORD_S012", "FE_SALEORD_S013", "FE_SALEORD_S014"] },

        { path: "/report/visitPlanRawData", permCode: "FE_REP_MENU01" },
        { path: "/report/visitPlanTransaction", permCode: "FE_REP_MENU02" },
        { path: "/report/visitPlanDaily", permCode: "FE_REP_MENU03" },
        { path: "/report/visitPlanMonthly", permCode: "FE_REP_MENU04" },
        { path: "/report/visitPlanActual", permCode: "FE_REP_MENU05" },
        { path: "/report/meterRawData", permCode: "FE_REP_MENU06" },
        { path: "/report/meterTransaction", permCode: "FE_REP_MENU07" },
        { path: "/report/stockCardRawData", permCode: "FE_REP_MENU08" },
        { path: "/report/stockCardCustomerSummary", permCode: "FE_REP_MENU09" },
        { path: "/report/prospectRawData", permCode: "FE_REP_MENU10" },
        { path: "/report/prospectPerformancePerSaleRep", permCode: "FE_REP_MENU11" },
        { path: "/report/prospectPerformancePerSaleGroup", permCode: "FE_REP_MENU12" },
        { path: "/report/saleOrderRawdata", permCode: "FE_REP_MENU13" },
        { path: "/report/saleOrderByChannel", permCode: "FE_REP_MENU14" },
        { path: "/report/saleOrderByCompany", permCode: "FE_REP_MENU15" },
        { path: "/report/assign", permCode: "FE_REP_MENU16" },
        { path: "/report/imageInTemplate", permCode: "FE_REP_MENU17" },
        { path: "/masterData/qrMaster", permCode: "FE_MAS_QR" },
        { path: "/masterData/location", permCode: "FE_MAS_LOC" },
    ]
    const currentPath = useRouter().pathname;
    const getPathValue = (reduxObj) => {
        return reduxObj[currentPath] ? reduxObj[currentPath] : {};
    }
    const pathValue = getPathValue(useSelector((state) => state.pathValue));
    const permList = useSelector((state) => state.permList);
    let pathValueWrong = false;
    let havingPerm = false;

    const filterList = pageList.filter(element => element.path == currentPath);
    if (filterList.length == 1) {
        if (Array.isArray(filterList[0].permCode)) {
            filterList[0].permCode.forEach((permCode) => {
                havingPerm = havingPerm || permList.some(perm => perm.permObjCode == permCode)
            })
        } else {
            havingPerm = permList.some(perm => perm.permObjCode == filterList[0].permCode)
        }
    } else if (filterList.length > 1) {
        const valueFromPathValue = pathValue[filterList[0].valueKey];
        const foundPage = filterList.find(element => {

            if (Array.isArray(element.value)) {
                let checkValue = false
                element.value.forEach((tmpValue) => {
                    checkValue = checkValue || tmpValue == valueFromPathValue
                })
                return checkValue
            } else {
                return element.value == valueFromPathValue
            }
        });
        if (foundPage) {
            havingPerm = permList.some(perm => perm.permObjCode == foundPage.permCode)
        } else {

            pathValueWrong = true
        }
    } else {
        havingPerm = true
    }

    if (pathValueWrong) {
        return (
            <div className="h1 huge-font mt-4 ml-4">
                somting wrong in page flow plese try again.
            </div>
        )
    }
    else if (havingPerm) {
        return children;
    } else {
        return (
            <div className="h1 huge-font mt-4 ml-4">
                You don't have permission in this page.
            </div>
        )
    }
}