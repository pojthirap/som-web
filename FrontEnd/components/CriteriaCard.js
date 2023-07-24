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
        disableBtn = false
    } = props;
    React.useEffect(() => {
        // onsole.log(props);
    })
    return (
        <div className={"mt-4 mb-4" + (disabledBackground ? "" : " content-search")}>
            <div className="title-search justify-content-between row pb-3">
                <div>ค้นหา</div>
                {btn ?
                    <div className="">
                        <Button type={btnType} customLabel={btnLabel} onClick={() => btnFunction()} />
                    </div>
                    : null}
            </div>
            <div className="mt-4 mb-4">
                {props.children}
            </div>
            {disableBtn ? null :
                <div className="row d-flex justify-content-center">
                    <div className="col-6 col-md-3 col-xl-2">
                        <Button onClick={onSearch} type="search"></Button>
                    </div>
                    <div className="col-6 col-md-3 col-xl-2">
                        <Button onClick={onClear} type="clear"></Button>
                    </div>
                </div>}

        </div>
    )
}