import React, { useEffect, useState } from 'react'
import { Calendar, Views, momentLocalizer } from 'react-big-calendar'
import { useCookies } from "react-cookie";
import moment from "moment";
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

export default function Main({ dates, events, onSelect }) {

    const [cookie] = useCookies();

    const localizer = momentLocalizer(moment);

    const [event, setEvents] = useState(events)
    const [value, setValue] = useState(dates)

    useEffect(() => {
        setEvents(events);
    }, [events])

    useEffect(() => {
        setValue(dates);
    }, [dates])


    const handleSelect = (obj) => {
        if (onSelect instanceof Function) {
            onSelect(moment(obj.start).toDate())
        }
    }
    const handleSelectEvent = (obj) => {
        if (Array.isArray(obj)) {
            if (onSelect instanceof Function) {
                onSelect(moment(obj[0].start).toDate())
            }
        } else {
            if (onSelect instanceof Function) {
                onSelect(moment(obj.start).toDate())
            }
        }
    }

    return (
        <Calendar
            selectable="ignoreEvents"
            events={event}
            defaultDate={value}
            className="calendar"
            localizer={localizer}
            views={['month']}
            onSelectSlot={handleSelect}
            onSelectEvent={handleSelectEvent}
            onShowMore={handleSelectEvent}
            locale={cookie.lang == "en" ? moment.locale('en') : moment.locale('th')}
            formats={{
                monthHeaderFormat: 'MMMM ' + toBuddhistYear(moment(), 'YYYY'),
            }}
        />
    )
}


function toBuddhistYear(moment, format) {
    var christianYear = moment.format('YYYY')
    var buddhishYear = (parseInt(christianYear) + (moment.locale() == "th" ? 543 : 0)).toString()
    return moment.format(format.replace('YYYY', buddhishYear).replace('YY', buddhishYear.substring(2, 4)))
        .replace(christianYear, buddhishYear)
}