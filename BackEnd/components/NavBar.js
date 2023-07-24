import 'react-pro-sidebar/dist/css/styles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'

export default function Main({ logoutFunction }) {
    const userProfile = useSelector((state) => state.userProfile);
    return (
        <div className="navBar row border-bottom d-flex justify-content-end font-normal">
            <div className="mr-2 d-flex justify-content-center align-items-center">
                <FontAwesomeIcon icon={faUser} className="navBarIcon" />
                <span className="ml-1">{userProfile && userProfile.firstName ? userProfile.firstName : ""}</span>
            </div>
            <div onClick={logoutFunction} className="mr-2 d-flex justify-content-center align-items-center px-2 cursor-pointer">
                <FontAwesomeIcon icon={faSignOutAlt} className="navBarIcon" />
                <span className="ml-1">ออกจากระบบ</span>
            </div>
        </div>
    )
}