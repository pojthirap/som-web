import React from 'react';
import Image from 'next/image'
import Link from 'next/link'
import { ProSidebar, SidebarHeader, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import Head from 'next/head'
import * as msg from '@msg'
import 'react-pro-sidebar/dist/css/styles.css'

export default function Main(props) {
    const { menuPath } = props
    const currentPath = useRouter().pathname;
    const getPathValue = (reduxObj) => {
        return reduxObj[currentPath] ? reduxObj[currentPath] : {};
    }
    const pathValue = getPathValue(useSelector((state) => state.pathValue));
    const permList = useSelector((state) => state.permList);
    function isOpenClass() {
        return props.getToggleSizeBar() ? " open" : "";
    }

    function isOpenSideBarSize() {
        return props.getToggleSizeBar() ? "200px" : "50px";
    }

    function SubMenuItemWithLink({ parent, currentKey, pathObj }) {
        let active = currentPath == path;
        const label = pathObj.label
        const path = pathObj.path

        if (parent && menuPath[parent][currentKey].subMenuPath) {
            menuPath[parent][currentKey].subMenuPath.forEach((subPathData) => {
                if (subPathData.valueKey) {
                    active = active || (currentPath == subPathData.path && pathValue[subPathData.valueKey] == subPathData.value);
                } else {
                    active = active || currentPath == subPathData.path;
                }
            });
        }
        if ((pathObj.permCode && permList.some(perm => perm.permObjCode == pathObj.permCode)) || !pathObj.permCode) {
            return (
                <MenuItem active={active}>
                    <Link href={path}>
                        {label}
                    </Link>
                </MenuItem>
            )
        } else {
            return null
        }
    }
    function ListSubMenu({ parent }) {
        if (!menuPath[parent]) return null;
        var listObj = [];
        Object.keys(menuPath[parent]).forEach(function (key, index) {
            if (key == "label") {
                listObj.push(
                    <h1 key={index} className="mt-2">
                        {menuPath[parent][key]}
                    </h1>
                )

            }
            else if (key != "permCode") {
                listObj.push(
                    <SubMenuItemWithLink key={index} parent={parent} currentKey={key} pathObj={menuPath[parent][key]} />
                );
            }

        });
        return listObj;
    }



    function MenuItemWithLink({ pathKey, imgSrc }) {
        const pathObj = menuPath[pathKey]
        if ((pathObj.permCode && permList.some(perm => perm.permObjCode == pathObj.permCode)) || !pathObj.permCode) {
            let active = currentPath == pathObj.path;
            if (pathObj.subMenuPath) {
                pathObj.subMenuPath.forEach((subPath) => {
                    if (currentPath == subPath.path) active = true;
                });
            }
            return (
                <MenuItem active={active}>
                    <Link href={pathObj.path}>
                        <div>
                            <div className="d-flex justify-content-center" >
                                <Image src={imgSrc} width="24" height="24" />
                            </div>
                            <div className={"titleMenuItem" + isOpenClass()}>
                                {pathObj.label}
                            </div>
                        </div>
                    </Link>
                </MenuItem>
            )
        } else {
            return null
        }
    }


    function isMenuOpen(menu) {
        let isOpen = false;
        if (menuPath[menu]) {
            let keys = Object.keys(menuPath[menu]);
            keys.forEach((key) => {
                isOpen = isOpen || menuPath[menu][key].path == currentPath;
                if (menuPath[menu][key].subMenuPath) {
                    menuPath[menu][key].subMenuPath.forEach((subPathData) => {
                        if (subPathData.valueKey) {
                            isOpen = isOpen || (currentPath == subPathData.path && pathValue[subPathData.valueKey] == subPathData.value);
                        } else {
                            isOpen = isOpen || currentPath == subPathData.path;
                        }
                    });
                }
            });
        }
        return isOpen;
    }

    function SubMenuTitle({ imgSrc, title }) {
        return (
            <div>
                <div className="d-flex justify-content-center" >
                    <Image src={imgSrc} width="24" height="24" />
                </div>
                <div className={"titleMenuItem" + isOpenClass()}>
                    {title}
                </div>
            </div>
        )
    }

    function getTitleLabel() {
        let title = msg.defaultTitle;
        let menuKeys = Object.keys(menuPath);
        menuKeys.forEach((menuKey) => {
            let subMenuKeys = Object.keys(menuPath[menuKey]);

            if (menuPath[menuKey].path) {
                if (currentPath == menuPath[menuKey].path) title = menuPath[menuKey].label;
                if (menuPath[menuKey].subMenuPath) {
                    menuPath[menuKey].subMenuPath.forEach((subPath) => {
                        if (currentPath == subPath.path) title = menuPath[menuKey].label;
                    });
                }
            } else {
                subMenuKeys.forEach((subMenuKey) => {
                    if (currentPath == menuPath[menuKey][subMenuKey].path) title = menuPath[menuKey][subMenuKey].label;
                    if (menuPath[menuKey][subMenuKey].subMenuPath) {
                        menuPath[menuKey][subMenuKey].subMenuPath.forEach((subPath) => {
                            if (currentPath == subPath) title = menuPath[menuKey][subMenuKey].label;
                        });
                    }
                });
            }
        });
        return title;
    }

    function checkPermMenu(parentKey) {
        const pathObj = menuPath[parentKey]
        return (pathObj.permCode && permList.some(perm => perm.permObjCode == pathObj.permCode)) || !pathObj.permCode
    }


    return (
        <div>
            <Head>
                <title>{getTitleLabel()}</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <ProSidebar toggled={false} className={"sideBar" + isOpenClass()} collapsed collapsedWidth={isOpenSideBarSize()}>
                <Menu iconShape="square" >
                    <SidebarHeader className="sideBarHeader" >
                        <div className={"sideBarIcon" + isOpenClass()}>
                            <Image src="/img/icon/logo.png" width="75" height="77" />
                        </div>
                        <div className="sideBarToggleItem" onClick={() => { props.setToggleSizeBar("M") }}>
                            <FontAwesomeIcon icon={faBars} className="navBarIcon" color="#777" size="xs" />
                        </div>
                    </SidebarHeader>
                    <MenuItemWithLink pathKey={"home"} imgSrc="/img/icon/icon-home.png" />
                    {checkPermMenu("account") ?
                        <SubMenu title={<SubMenuTitle title={menuPath.account.label} imgSrc="/img/icon/icon-account.png" />} open={isMenuOpen("account")}>
                            <ListSubMenu parent={"account"} />
                        </SubMenu>
                        : null
                    }
                    <MenuItemWithLink pathKey={"salesVisitPlan"} imgSrc="/img/icon/icon-calendar.png" />
                    <MenuItemWithLink pathKey={"saleOrder"} imgSrc="/img/icon/icon-cart.png" />

                    {checkPermMenu("report") ?
                        <SubMenu title={<SubMenuTitle title={menuPath.report.label} imgSrc="/img/icon/icon-chart.png" />} open={isMenuOpen("report")}>
                            <ListSubMenu parent={"report"} />
                        </SubMenu>
                        : null
                    }
                    {checkPermMenu("masterData") ?
                        <SubMenu title={<SubMenuTitle title={menuPath.masterData.label} imgSrc="/img/icon/icon-analysis.png" />} open={isMenuOpen("masterData")}>
                            <ListSubMenu parent={"masterData"} />
                        </SubMenu>
                        : null
                    }
                </Menu>
            </ProSidebar>
        </div>
    )
}


