import { useContext } from "react";
import { ServiceContext } from "../_context/service.context";

export default function useServiceContextHook() {
  const values = useContext(ServiceContext);
  return values;
}
