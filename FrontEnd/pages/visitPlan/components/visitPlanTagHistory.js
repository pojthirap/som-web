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

    if (router.pathname == "/visitPlan/createOrEdit" || router.pathname == "/visitPlan/editTask" || router.pathname == "/visitPlan/editLocation") mainPagePath = msg.createPlan;

    return (
        <div className="tag-history">
            <Head>
                <title>{menuPath ? menuPath : namePath ? msg.detailProspect : mainPagePath}</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <div className="container p-0">
                <div className=" padding-row row align-items-center primaryLabel">
                    <Image src="/img/icon/icon-calendar.png" width="24" height="24" />
                    <div><span className="ml-2">/</span><span className="ml-2">{mainPagePath}</span></div>
                    {namePath ? <div><span className="ml-2">/</span><span className="ml-2">{namePath}</span></div> : null}
                    {menuPath ? <div><span className="ml-2">/</span><span className="ml-2">{menuPath}</span></div> : null}

                </div>
            </div>
        </div>
    )
}
