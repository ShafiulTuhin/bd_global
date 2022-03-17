import { toast } from "react-toastify";

/**
 *
 * @param {String} [message]
 * @param {String | 'success' | 'error' | 'warning' | 'info'} [type]
 */
export function notify(message = "", type = "success") {
  return toast[type](message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    closeButton: false,
  });
}
