import { Modal } from "react-bootstrap";

export const ModalForm = ({
  useFormRenderer,
  modalProps = {},
  formData,
  isOpen,
  onClose,
}) => {
  const [title, form] = useFormRenderer(formData || {});

  return (
    <Modal
      {...{
        dialogClassName: "contained-modal",
        show: isOpen,
        onHide: onClose,
        "aria-labelledby": "modal-box",
        ...modalProps,
      }}
    >
      <Modal.Header closeButton id="contained-modal-header">
        <Modal.Title>
          <h3 className="lead">{title}</h3>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body id="contained-modal-body">{form}</Modal.Body>
    </Modal>
  );
};
