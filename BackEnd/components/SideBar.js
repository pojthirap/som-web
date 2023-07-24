import React, { useState } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import { ProSidebar, SidebarHeader, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import Head from 'next/head'
import * as msg from "@msg";
import 'react-pro-sidebar/dist/css/styles.css'

export default function Main(props) {
    const currentPath = useRouter().pathname;
    const permList = useSelector((state) => state.permList);
    const { menuPath } = props

    function MenuItemWithLink({ pathObj, parent, currentKey }) {
        let active = currentPath == path;
        const label = pathObj.label
        const path = pathObj.path

        if (menuPath[parent][currentKey].subMenuPath) {
            menuPath[parent][currentKey].subMenuPath.forEach((subPath) => {
                active = active || currentPath == subPath;
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
            if (key != "permCode") {
                listObj.push(
                    <MenuItemWithLink key={index} parent={parent} currentKey={key} pathObj={menuPath[parent][key]} />
                );
            }

        });
        return listObj;
    }
    function isMenuOpen(menu) {
        let isOpen = false;
        if (menuPath[menu]) {
            let keys = Object.keys(menuPath[menu]);
            keys.forEach((key) => {
                isOpen = isOpen || menuPath[menu][key].path == currentPath;
                if (menuPath[menu][key].subMenuPath) {
                    menuPath[menu][key].subMenuPath.forEach((subPath) => {
                        isOpen = isOpen || currentPath == subPath;
                    });
                }
            });
        }
        return isOpen;
    }
    function getTitleLabel() {
        let title = msg.defaultTitle;
        let menuKeys = Object.keys(menuPath);
        menuKeys.forEach((menuKey) => {
            let subMenuKeys = Object.keys(menuPath[menuKey]);
            subMenuKeys.forEach((subMenuKey) => {
                if (currentPath == menuPath[menuKey][subMenuKey].path) title = menuPath[menuKey][subMenuKey].label;
                if (menuPath[menuKey][subMenuKey].subMenuPath) {
                    menuPath[menuKey][subMenuKey].subMenuPath.forEach((subPath) => {
                        if (currentPath == subPath) title = menuPath[menuKey][subMenuKey].label;
                    });
                }
            });
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
            </Head>
            <div className="sideBarToggleM">
                <div onClick={() => { props.toggleSideBar("M") }}>
                    <FontAwesomeIcon icon={faBars} className="navBarIcon" />
                </div>
            </div>
            <div className="sideBarToggleS">
                <div onClick={() => { props.toggleSideBar("S") }}>
                    <FontAwesomeIcon icon={faBars} className="navBarIcon" />
                </div>
            </div>
            <ProSidebar toggled={false} className={"sideBar" + props.getSdeBarClass()}>
                <Menu iconShape="square" >
                    <SidebarHeader className="d-flex justify-content-center" >
                        <div>
                            <Image src="/img/nav/logo.png" width="85" height="88" />
                            <div className="font-normal">Main Menu</div>
                        </div>
                    </SidebarHeader>
                    {checkPermMenu("organizational") ?
                        <SubMenu title={msg.organizationalMenu} defaultOpen={isMenuOpen("organizational")} icon={<Image src="/img/nav/icon-chart.png" width="24" height="24" />}>
                            <ListSubMenu parent={"organizational"} />
                        </SubMenu>
                        : null
                    }
                    {checkPermMenu("master") ?
                        <SubMenu title={msg.masterMenu} defaultOpen={isMenuOpen("master")} icon={<Image src="/img/nav/icon-podium.png" width="24" height="24" />}>
                            <ListSubMenu parent={"master"} />
                        </SubMenu>
                        : null
                    }
                    {checkPermMenu("visitPlant") ?
                        <SubMenu title={msg.visitPlantMenu} defaultOpen={isMenuOpen("visitPlant")} icon={<Image src="/img/nav/icon-location.png" width="24" height="24" />}>
                            <ListSubMenu parent={"visitPlant"} />
                        </SubMenu>
                        : null
                    }
                    {checkPermMenu("saleArea") ?
                        <SubMenu title={msg.saleAreaMenu} defaultOpen={isMenuOpen("saleArea")} icon={<Image src="/img/nav/icon-bag.png" width="24" height="24" />}>
                            <ListSubMenu parent={"saleArea"} />
                        </SubMenu>
                        : null
                    }
                </Menu>
            </ProSidebar>
        </div>
    )
}
