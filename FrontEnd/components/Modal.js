import React, { useRef, forwardRef } from 'react';
import Modal from 'react-bootstrap/Modal'
import Button from "@components/Button"
import ReactToPrint from "react-to-print";
import * as msg from '@msg'

export default function ComponentModal(props) {
    const {
        isBtnClose = true,
        isShow,
        onClose,
        onSave,
        title,
        children,
        disableBtn = false,
        disableBtnCancel = false,
        hideFooter = false,
        btnPrint = false,
        isPrintQr = false,
        size = '',
        customLable
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
            {!hideFooter ?
                <Modal.Footer>
                    <div className="col-12 d-flex align-items-center justify-content-end row p-0">
                        {!disableBtnCancel ?
                            <div className="col-3">
                                <Button onClick={onClose} type="cancle" customLabel={customLable ? customLable : msg.cancle}></Button>
                            </div>
                            : null}
                        {btnPrint ?
                            <div className="col-3">
                                <ReactToPrint
                                    trigger={() => <Button type="primary" customLabel={msg.print}></Button>}
                                    content={() => printAreaRef.current}
                                />
                            </div>
                            :
                            !disableBtn ?
                                <div className="col-3">
                                    <Button onClick={onSave} type="save"></Button>
                                </div>
                                :
                                null
                        }
                    </div>
                </Modal.Footer>
                : null
            }
        </Modal>
    )
}