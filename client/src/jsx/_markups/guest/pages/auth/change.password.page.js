import { useEffect, useState } from "react";
// CONSTANTS
import _constants from "../../../../_constants";
// HOOKS
import useQuery from "../../../../_hooks/query.hook";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
// HELPERS
import { routeMap } from "../../routes";
// COMPONENTS
import AuthForm from "../../components/form/auth.form";

export default function ChangePassword() {
  const {
    session: { user },
  } = useServiceContextHook();
  const { id, token } = useQuery();
  const [queryToken, setQueryToken] = useState();

  useEffect(() => {
    if (user) {
      setQueryToken(user?.token);
    } else {
      setQueryToken(token);
    }
  }, [user, id, token]);

  return queryToken ? (
    <AuthForm.ChangePassword token={queryToken} />
  ) : (
    <div className="container" style={{ paddingTop: 120 }}>
      <h3 className="h3">Change password</h3>
      <p>You are not allowed to access this page</p>
    </div>
  );
}
// <Redirect to={{ pathname: routeMap.home }} />
