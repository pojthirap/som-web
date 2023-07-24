import React, { useState } from 'react';
import Button from '@material-ui/core/Button';  
import Router from 'next/router';
import { useCookies } from "react-cookie";
import DatePicker from "@components/DatePicker"
import 'react-calendar/dist/Calendar.css'
import 'react-date-picker/dist/DatePicker.css'

export default function datepickerExample() {
  const [cookie, setCookie] = useCookies()
  const [date, setDate] = useState(new Date());

  return (
    <div className="row" >
      <div className="col-4">
        <DatePicker value={date} onChange={setDate} showTodayButton={true}></DatePicker>
      </div>
      <Button className="col-1" onClick={() => {
          setCookie("lang", cookie.lang == "th" ? "en" : "th", {path: "/",});
          Router.reload();
        }} color="primary">
        {cookie.lang == "en" ? "en" : "th"}
      </Button>
    </div>
  )
}