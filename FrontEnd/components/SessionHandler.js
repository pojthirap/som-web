import { useState, useEffect } from 'react';
import { getCookie } from "@helper";
import { useRouter } from 'next/router'
export default function permissionControl({ callAPI, redirect, children }) {
    const router = useRouter();
    const [loadding, setLoadding] = useState(true);

    if (!getCookie("publicSessionNo") && router.pathname != process.env.signInPath) {
        router.push({
            pathname: process.env.signInPath
        });
        return null
    } else {
        // console.log("test")
        return children;
    }

    // if (loadding) {
    //     return (
    //         <div>Lodding Session</div>
    //     )
    // } else {
    //     return children;
    // }
}