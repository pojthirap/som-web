import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'

export default function permissionControl({ children }) {
    const pageList = [
        { path: "/organizational/company", permCode: "BE_ORG_COM_S01" },
        { path: "/organizational/saleOrg", permCode: "BE_ORG_ORG_S01" },
        { path: "/organizational/channel", permCode: "BE_ORG_CHANNEL_S01" },
        { path: "/organizational/division", permCode: "BE_ORG_DIV_S01" },
        { path: "/organizational/saleOffice", permCode: "BE_ORG_OFF_S01" },
        { path: "/organizational/saleGroup", permCode: "BE_ORG_GROUP_S01" },
        { path: "/organizational/saleGroupEdit", permCode: "BE_ORG_GROUP_S011" },
        { path: "/organizational/saleRep", permCode: "BE_ORG_REP_S01" },
        { path: "/organizational/mappingApprover", permCode: "BE_ORG_MAPAP_S01" },
        { path: "/organizational/roleOnSOM", permCode: "BE_ORG_ROLE_S01" },
        { path: "/organizational/saleArea", permCode: "BE_ORG_AREA_S01" },
        { path: "/organizational/businessUnit", permCode: "BE_ORG_BU_S01" },
        { path: "/organizational/plant", permCode: "BE_ORG_PLANT_S01" },
        { path: "/organizational/shippingPoint", permCode: "BE_ORG_SHIP_S01" },
        { path: "/organizational/territory", permCode: "BE_ORG_TERT_S01" },
        { path: "/organizational/territoryEdit", permCode: "BE_ORG_TERT_S011" },
        { path: "/organizational/userGroup", permCode: "BE_ORG_GROUP_APP_S011" },
        { path: "/organizational/acessRights", permCode: "BE_ORG_GROUP_PERM_S011" },
        { path: "/master/mappingRegionWithProvince", permCode: "BE_MAS_REGION_S01" },
        { path: "/master/mappingRegionWithProvinceEdit", permCode: "BE_MAS_REGION_S011" },
        { path: "/master/province", permCode: "BE_MAS_PROV_S01" },
        { path: "/master/district", permCode: "BE_MAS_DIST_S01" },
        { path: "/master/subDistrict", permCode: "BE_MAS_SUBDIST_S01" },
        { path: "/visitPlant/brand", permCode: "BE_SITEVISIT_BRAND_S01" },
        { path: "/visitPlant/location", permCode: "BE_SITEVISIT_LOC_S01" },
        { path: "/visitPlant/locationType", permCode: "BE_SITEVISIT_LOCT_S01" },
        { path: "/visitPlant/catagories", permCode: "BE_SITEVISIT_CATE_S01" },
        { path: "/visitPlant/service", permCode: "BE_SITEVISIT_SERV_S01" },
        { path: "/visitPlant/bank", permCode: "BE_SITEVISIT_BANK_S01" },
        { path: "/visitPlant/templateCategory", permCode: "BE_SITEVISIT_TPCATE_S01" },
        { path: "/visitPlant/template", permCode: "BE_SITEVISIT_TP_S01" },
        { path: "/visitPlant/templateEdit", permCode: "BE_SITEVISIT_TP_S011" },
        { path: "/visitPlant/question", permCode: "BE_SITEVISIT_QUESTION_S01" },
        { path: "/visitPlant/acttachmentCatagories", permCode: "BE_SITEVISIT_ATTCATE_S01" },
        { path: "/visitPlant/templateStockCard", permCode: "BE_SITEVISIT_TPSTOCK_S01" },
        { path: "/visitPlant/templateStockCardAddProduct", permCode: "BE_SITEVISIT_TPSTOCK_S011" },
        { path: "/visitPlant/templateForSA", permCode: "BE_SITEVISIT_TPSA_S01" },
        { path: "/visitPlant/templateForSAEdit", permCode: "BE_SITEVISIT_TPSA_S011" },
        { path: "/visitPlant/product", permCode: "BE_SITEVISIT_GASOLINE_S01" },
        { path: "/visitPlant/reasonNotVisit", permCode: "BE_SITEVISIT_REASON_S01" },
        { path: "/visitPlant/qrMaster", permCode: "BE_SITEVISIT_QR_S01" },
        { path: "/saleArea/product", permCode: "BE_SALEORD_PROD_S01" }
    ]
    const currentPath = useRouter().pathname;
    const permList = useSelector((state) => state.permList);
    let havingPerm = false;

    const filterList = pageList.find(element => element.path == currentPath);
    if (filterList) {
        havingPerm = permList.some(perm => perm.permObjCode == filterList.permCode)
    } else {
        havingPerm = true
    }
    if (havingPerm) {
        return children;
    } else {
        return (
            <div className="h1 huge-font mt-4 ml-4">
                You don't have permission in this page.
            </div>
        )
    }
}