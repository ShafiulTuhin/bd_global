import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import App from "./App";

import reportWebVitals from "./reportWebVitals";
import SimpleReactLightbox from "simple-react-lightbox";
import "./i18n";

const loadingMarkup = (
  <div className="py-4 text-center">
    <h3>Loading..</h3>
  </div>
);

ReactDOM.render(
  <Suspense fallback={loadingMarkup}>
    <React.StrictMode>
      <SimpleReactLightbox>
        <App />
      </SimpleReactLightbox>
    </React.StrictMode>
  </Suspense>,
  document.getElementById("app")
);
reportWebVitals();
