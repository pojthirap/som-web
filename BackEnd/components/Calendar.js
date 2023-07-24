import React from 'react'
import { Calendar, Views, momentLocalizer } from 'react-big-calendar'
import events from '../utils/test/calendarTest'
import { useCookies } from "react-cookie";
import moment from "moment";

export default function Main({ value }) {

    const [cookie] = useCookies();

    const localizer = momentLocalizer(moment);

    const [event, setEvents] = React.useState(events)

    const handleSelect = ({ start, end }) => {
        const title = window.prompt('New Event name')
        if (title) {
            setEvents([...event, { start, end, title, }])
        }
    }

    return (
            <Calendar
                selectable
                events={event}
                defaultDate={value}
                className="calendar"
                localizer={localizer}
                views={['month', 'agenda', 'day']}
                onSelectSlot={handleSelect}
                onSelectEvent={event => alert(event.title)}
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