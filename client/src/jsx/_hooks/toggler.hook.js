import { useState } from "react";

function useToggler(defaultValue = false) {
  const [isOpen, setIsOpen] = useState(defaultValue);
  const [toggledPayload, setPayload] = useState(null);
  const onOpen = (payload = null) => {
    // console.log(payload);
    setIsOpen(true);
    setPayload(payload);
  };
  const onClose = (payload = null) => {
    setIsOpen(false);
    setPayload(payload);
  };

  return {
    isOpen,
    onOpen,
    onClose,
    toggledPayload,
  };
}

export default useToggler;
