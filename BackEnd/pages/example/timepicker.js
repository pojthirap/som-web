import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Router from 'next/router';
import { useCookies } from "react-cookie";
import DatePicker from "@components/DatePicker"
import TimePicker from "@components/TimePicker"
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';

export default function MaterialUIPickers() {
    const [cookie, setCookie] = useCookies()
    const [date, setDate] = useState(new Date());

    return (
        <div>
            <TimePicker value={date} onChange={setDate}></TimePicker>
        </div>
    )
}