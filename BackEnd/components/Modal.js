import React, { useRef, forwardRef } from 'react';
import Modal from 'react-bootstrap/Modal'
import Button from "@components/Button"
import ReactToPrint from "react-to-print";
import * as msg from "@msg";
export default function ComponentModal(props) {
    const {
        isShow,
        onClose,
        onSave,
        title,
        children,
        disableBtn = false,
        disableBtnCancel = false,
        btnPrint = false,
        onPrint,
        customLable,
        isBtnClose = false,
        size = '',
    } = props;

    const printAreaRef = useRef();
    return (
        <Modal show={isShow} onHide={onClose} size={size}>
            <Modal.Header className="primaryHeader" closeButton={isBtnClose}>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div ref={printAreaRef} className="bodyArea">
                    {children}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="col-12 d-flex align-items-center justify-content-end row p-0">
                    {!disableBtnCancel ?
                        <div className="col-2 p-0">
                            <Button onClick={onClose} type="close" customLabel={customLable ? customLable : msg.cancle}></Button>
                        </div>
                        : null}
                    {!disableBtn ?
                        <div className="col-2 p-0 ml-2">
                            <Button onClick={onSave} type="save"></Button>
                        </div> : null}
                    {btnPrint ?
                        <div className="col-2 p-0 ml-2">
                            <ReactToPrint
                                trigger={() => <Button onClick={onPrint} type="primary" customLabel="Print"></Button>}
                                content={() => printAreaRef.current}
                            />
                        </div> : null}
                </div>
            </Modal.Footer>
        </Modal>
    )
}