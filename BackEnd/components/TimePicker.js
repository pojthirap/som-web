import React from 'react';

const listHours = [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
];

const listMinutes = [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '38',
    '39',
    '40',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '47',
    '48',
    '49',
    '50',
    '51',
    '52',
    '53',
    '54',
    '55',
    '56',
    '57',
    '58',
    '59',
];

export default function Main({
    value,
    onChange,
}) {
    const [hours, setHours] = React.useState(value.getHours())

    const [minutes, setMinutes] = React.useState(value.getMinutes())

    const handleChangeHours = (event) => {
        setHours(event.target.value);
    };

    const handleChangeMinutes = (event) => {
        setMinutes(event.target.value);
    };

    return (
        <div className="row form-control m-0">
            <select
                className="col-6 select-timepicker"
                value={hours}
                onChange={handleChangeHours}
            >
                {listHours.map((hour) =>
                    <option key={hour} value={hour} >
                        {hour}
                    </option>)}
            </select>
            <select
                className="col-6 select-timepicker"
                value={minutes}
                onChange={handleChangeMinutes}
            >
                {listMinutes.map((minute) =>
                    <option key={minute} value={minute} >
                        {minute}
                    </option>)}
            </select>
        </div>
    );
}

