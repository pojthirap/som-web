import React from 'react';
import Button from "@components/Button"

export default function Main(props) {
    const {
        onSearch,
        onClear,
        disabledBackground = false,
        btn = false,
        btnType = "primary",
        btnFunction,
        btnLabel,
        disableBtn = false,
        hideBtn = false,
        cardLabel = "ค้นหา"
    } = props;
    React.useEffect(() => {
        // onsole.log(props);
    })
    return (
        <div className={"mt-4 mb-4" + (disabledBackground ? "" : " content-search")}>
            <div className="title-search justify-content-between row pb-3">
                <div>{cardLabel}</div>
                {btn ?
                    <div className="">
                        <Button type={btnType} customLabel={btnLabel} onClick={() => btnFunction()} />
                    </div>
                    : null}
            </div>
            <div className="mt-4 mb-4">
                {props.children}
            </div>
            {hideBtn ? null :
                <div className="row d-flex justify-content-center">
                    <div className="col-6 col-md-3 col-xl-2">
                        <Button onClick={onSearch} type="search" disabled={disableBtn}></Button>
                    </div>
                    <div className="col-6 col-md-3 col-xl-2">
                        <Button onClick={onClear} type="clear" disabled={disableBtn}></Button>
                    </div>
                </div>}

        </div>
    )
}