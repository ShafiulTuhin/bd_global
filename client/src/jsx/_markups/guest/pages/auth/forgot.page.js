import { Redirect } from "react-router";
// CONSTANTS
import _constants from "../../../../_constants";

// HOOKS
import useServiceContextHook from "../../../../_hooks/service.context.hook";

// HELPERS
import { routeMap } from "../../routes";
// COMPONENTS
import AuthForm from "../../components/form/auth.form";

export default function ForgotPassword() {
  const { session } = useServiceContextHook();

  return !session?.user ? (
    <AuthForm.ForgotPassword />
  ) : (
    <Redirect to={{ pathname: routeMap.home }}></Redirect>
  );
}
