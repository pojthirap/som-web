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

    var date = new Date()
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var c = new Date(year + 543, month, day);

    const [dateHeader, setDateHeader] = useState(moment(c))

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

    const eventStyleGetter = (event) => {
        var backgroundColor = event.color;
        var style = {
            backgroundColor: backgroundColor,
        };
        return {
            style: style
        };
    }

    const handleChange = (e) => {
        var date = new Date(e)
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var c = new Date(year + 543, month, day);

        setDateHeader(moment(c))
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
                monthHeaderFormat: moment(dateHeader).format('MMMM YYYY'),
                weekdayFormat: "dddd",
                dateFormat: "D"
            }}
            eventPropGetter={eventStyleGetter}
            onNavigate={e => handleChange(e)}

        />
    )
}