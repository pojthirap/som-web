import { useState } from 'react';
import NavBar from "@components/NavBar"
import SideBar from "@components/SideBar"
import { useRouter } from 'next/router'

function navBarWrapper({ callAPI, children }) {
    const router = useRouter();
    const [toggleMediumSize, setToggleMediumSize] = useState(true);
    const [toggleSmallSize, setToggleSmallSize] = useState(false);

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
            />
            <div className={"content" + getSdeBarClass()}>
                <div className="contentBlackScreen" onClick={() => { toggleSideBar("S") }}></div>
                <NavBar callAPIFunction={callAPI} />
                <div className="contentContainer">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default navBarWrapper