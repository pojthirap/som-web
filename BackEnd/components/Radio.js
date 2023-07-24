import { useEffect } from "react"

export default function Main(props) {
    useEffect(() => {
        // console.log(props);
    })
    return (
        <div className="form-check">
            <input
                type="radio"
                className="form-check-input"
                name={props.name}
                value={props.value}
                checked={props.checked}
                onChange={props.onChange}
            ></input>
            <label
                className="form-check-label">
                {props.label}
            </label>
        </div>
    )
}