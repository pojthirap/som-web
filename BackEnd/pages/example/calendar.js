import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import React, { useState } from 'react';
import Calendar from "@components/Calendar"
import Router from 'next/router';
import { useCookies } from "react-cookie";
import Button from '@material-ui/core/Button';


export default function CalendarUI() {
    const [cookie, setCookie] = useCookies()
    const [dates] = useState(new Date());
    return (
        <div>
            <div style={{ margin: 30 }}>
                <Calendar value={dates}></Calendar>
            </div>
            <Button className="col-1" onClick={() => {
                setCookie("lang", cookie.lang == "th" ? "en" : "th", { path: "/", });
                Router.reload(window.location.pathname);
            }} color="primary">
                {cookie.lang == "en" ? "en" : "th"}
            </Button>
        </div>

    )
}