import { useState } from 'react';
import Modal from 'react-bootstrap/Modal'

function Main({ src, dontShowWhenClick = false, children }) {
    const [isShowImg, setIsShowImg] = useState(false);
    const handleOnClick = () => {
        if (!dontShowWhenClick) setIsShowImg(true);
    }
    return (
        <div>
            <div onClick={() => handleOnClick()} className={dontShowWhenClick ? "" : "cursor-pointer"}>
                {children ? children : <img src={`${process.env.apiPath}${src}`} className="image" />}
            </div>
            <Modal show={isShowImg} onHide={() => setIsShowImg(false)} size="xl" className="modal-image" dialogClassName="modal-image-dialog">
                <img src={`${process.env.apiPath}${src}`} className="image" />
            </Modal>
        </div>
    );
}

export default Main