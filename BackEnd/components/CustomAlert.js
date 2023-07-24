import { useState } from 'react';
import Modal from 'react-bootstrap/Modal'
import Button from "@components/Button"
import * as msg from '@msg'

const alertType = {
    A: { title: "แจ้งเตือน", headerClass: "primaryHeader" },
    Q: { title: "คำถาม", headerClass: "primaryHeader" },
    W: { title: "แจ้งเตือน", headerClass: "warningHeader" },
    E: { title: "เกิดความผิดพลาด", headerClass: "errorHeader" },
}
function customAlert(props) {
    const {
        customAlertType = "A",
        customAlertMsg,
        customAlertShow,
        customAlertFunction,
        closeDialog,
    } = props;

    return (
        <Modal show={customAlertShow} onHide={() => closeDialog()}>
            <Modal.Header closeButton className={alertType[customAlertType].headerClass}>
                <Modal.Title>{alertType[customAlertType].title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{customAlertMsg}</Modal.Body>
            <Modal.Footer>
                {customAlertType == "Q" ?
                    <div className="col-12 d-flex align-items-center justify-content-end row p-0">
                        <div className="col-2 p-0">
                            <Button onClick={() => closeDialog()} type="close" customLabel={msg.cancle}></Button>
                        </div>
                        <div className="col-2 p-0 ml-2">
                            <Button onClick={() => {
                                closeDialog()
                                customAlertFunction()
                            }} type="save" customLabel={msg.confirm} />
                        </div>
                    </div>
                    :
                    <div className="col-12 d-flex align-items-center justify-content-end row p-0">
                        <div className="col-2 p-0">
                            <Button onClick={() => closeDialog()} type="close" customLabel={msg.close}></Button>
                        </div>
                    </div>
                }
            </Modal.Footer>
        </Modal>
    )
}

export default customAlert