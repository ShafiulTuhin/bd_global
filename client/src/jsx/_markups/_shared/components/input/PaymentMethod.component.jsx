import SelectInput from "./Select.component";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import { useEffect, useState } from "react";

export default function PaymentMethod({ onChange, attributes }) {
  const {
    services: { type },
  } = useServiceContextHook();
  const [paymentMethods, setPaymentMethods] = useState({ "": "All" });

  useEffect(() => {
    (async () => {
      try {
        let { data } = await type.findByName("payment_methods");
        if (data) setPaymentMethods((state) => ({ ...state, ...data }));
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <SelectInput
      onChange={onChange}
      attributes={{
        name: "payment-methods",
        id: "payment-methods",
        ...attributes,
      }}
      data={paymentMethods}
    />
  );
}
