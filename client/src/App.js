/// Components
import Markup from "./jsx";
import ThemeContextProvider from "./jsx/_context/theme.context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { CircularProgress } from "@material-ui/core";
import { BrowserRouter } from "react-router-dom";
import _helpers from "./jsx/_helpers";

const {
  store: { store, persistor },
} = _helpers;

const App = () => {
  return (
    <>
      <ThemeContextProvider>
        <Provider store={store}>
          <PersistGate
            loading={<CircularProgress color="primary" />}
            persistor={persistor}
          >
            <BrowserRouter >
              <Markup />
            </BrowserRouter>
          </PersistGate>
        </Provider>
      </ThemeContextProvider>
    </>
  );
};

export default App;
