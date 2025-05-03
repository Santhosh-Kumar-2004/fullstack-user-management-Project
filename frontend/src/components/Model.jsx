import React from "react";
import "../styles/Model.css"; 

const Modal = ({ isOpen, onClose, children }) => {
    // Props | Data/Functions passed from Parent ➔ Child
    // isOpen | Decides modal visibility
    // onClose | Callback function to close modal
    // children | Anything between <Modal> ... </Modal>
    if (!isOpen) return null;

    return (
        <div className="overlayStyles" onClick={onClose}>
            <div className="modalStyles" onClick={(e) => e.stopPropagation()}>   {/* stops the event from bubbling up to parent elements. Without stopPropagation(), clicking inside the modal would close it!*/}
                <button className="closeButtonStyles" onClick={onClose}>
                    X
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
