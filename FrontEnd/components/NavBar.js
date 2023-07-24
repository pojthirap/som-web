import 'react-pro-sidebar/dist/css/styles.css'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

export default function Main({ menuPath, logoutFunction }) {
    const router = useRouter();
    const userProfile = useSelector((state) => state.userProfile);


    function navBarColorClassName() {
        let colorClassName = "";
        router.pathname
        if (router.pathname == menuPath.home.path) {
            colorClassName = " bg-light-green"
        } else if (router.pathname == menuPath.salesVisitPlan.path) {
            colorClassName = " bg-light-green"
        } else if (router.pathname == menuPath.saleOrder.path) {
            colorClassName = " bg-light-green"
        } else if (router.pathname.includes("report")) {
            colorClassName = " bg-light-green"
        }

        return colorClassName;
    }

    return (
        <div className={"navBar font-normal" + navBarColorClassName()}>
            <div className="mr-2 d-flex justify-content-center align-items-center">
                {userProfile && userProfile.firstName ? userProfile.firstName : ""}
            </div>
            <div className="mr-2 d-flex justify-content-center align-items-center px-2 cursor-pointer" onClick={logoutFunction}>
                <FontAwesomeIcon icon={faSignOutAlt} className="navBarIcon" />
            </div>
        </div>
    )
}