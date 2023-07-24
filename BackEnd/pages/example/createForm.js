import React from 'react';
import TextField from "@components/TextField"
import Select from "@components/Select"
import Radio from "@components/Radio"
import Checkbox from "@components/Checkbox"
import Button from "@components/Button"

export default function createFormExample() {

    const mockData = [
        {label: 'Swedish', value: 'sv'},
        {label: 'English', value: 'en'},
    ];

    const [genderRadio, setGenderRadio] = React.useState("")

    const [genderCheckbox, setGenderCheckbox] = React.useState("")

    const handleChangeGenderRadio = (event) => {
        setGenderRadio(event.target.value)
    };

    const handleChangeGenderCheckbox = (event) => {
        setGenderCheckbox(event.target.checked);
    };

    function answerObj() {
        return (
            <div className="bigCard">
                <div className="row">
                    <div className="col-7">
                        <TextField label="Phase" placeholder="test"></TextField>
                    </div>
                    <div className="col-5">
                        <Select label="Phase" placeholder="test" options={mockData}></Select>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="col-12">
            
            <div className="row">
                    <div className="col-6">
                        <TextField label="Phase" placeholder="test"></TextField>
                    </div>
                    <div className="col-6">
                        <Select label="Phase" placeholder="test" options={mockData}></Select>
                    </div>
                </div>
        </div>
    )
}

function Alert() {
    alert("I am an alert box!");
}