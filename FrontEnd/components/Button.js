import { useEffect } from "react"
import { faPlus, faSearch, faCheck } from '@fortawesome/free-solid-svg-icons'
import { faTrashAlt, faEdit } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as msg from "@msg";

export default function ComponentButton(props) {
    const { onClick, type, customIcon, customLabel, disabled, className = "", bigButton = false, smallButton = false } = props;
    useEffect(() => {
    })
    let style = "btn primaryButton";
    let icon = customIcon ? customIcon : null;
    let label = customLabel ? customLabel : "-";

    // primary
    if (type == "search") { style = "btn primaryButton", icon = faSearch, label = customLabel || msg.search }
    else if (type == "confirm") { style = "btn primaryButton", icon = faCheck, label = customLabel || msg.confirm }
    else if (type == "add") { style = "btn primaryButton", icon = faPlus, label = customLabel || msg.add }
    else if (type == "edit") { style = "btn primaryButton", icon = faEdit, label = customLabel || msg.edit }
    else if (type == "go") { style = "btn primaryButton", label = customLabel || msg.go }
    else if (type == "save") { style = "btn primaryButton", label = customLabel || msg.save }

    // secondary
    else if (type == "clear") { style = "btn secondaryButton", icon = faTrashAlt, label = customLabel || msg.clear }
    else if (type == "close") { style = "btn secondaryButton", label = customLabel || msg.close }
    else if (type == "cancle") { style = "btn secondaryButton", label = customLabel || msg.cancle }

    // danger
    else if (type == "del") { style = "btn dangerButton", icon = faTrashAlt, label = customLabel || "" }

    // info
    else if (type == "addInfo") { style = "btn infoButton", icon = faPlus, label = customLabel || "" }

    else if (type == "delNew") { style = "btn dangerButtonNew", label = customLabel || msg.deleteFull }
    else if (type == "editNew") { style = "btn primaryButtonNew", label = customLabel || msg.edit }

    // custom    
    if (type == "primary") { style = "btn primaryButton" }
    else if (type == "secondary") { style = "btn secondaryButton" }
    else if (type == "tertiary") { style = "btn tertiaryButton" }
    else if (type == "dangerNew") { style = "btn dangerButtonNew" }
    

    style = style + (className ? (" " + className) : "") + (bigButton ? " bigButton" : "") + (smallButton ? " smallButton" : "");
    return (
        <button type="button" className={style} onClick={onClick} disabled={disabled}>
            {icon ? <FontAwesomeIcon icon={icon} className={"iconButton mr-1" + (bigButton ? " bigIcon" : "")} /> : ""}{label}
        </button>
    )
}


