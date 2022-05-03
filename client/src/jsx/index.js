import { Suspense, lazy } from "react";
import { Switch, Route } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import React from "react";

import ServiceContextProvider from "./_context/service.context";

import Error404 from "./_markups/_shared/components/Error404.component";
import Loader from "./_markups/_shared/components/Loader.component";
import "./_markups/_shared/style/variables.css";

const AdminMarkup = lazy(() => import("./_markups/admin"));
const GuestMarkup = lazy(() => import("./_markups/guest"));

function Markup() {
  return (
    <ServiceContextProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          // alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Switch>
          {/* Admin user page */}
          <Route path="/admin">
            <Suspense fallback={<Loader />}>
              <AdminMarkup></AdminMarkup>
            </Suspense>
          </Route>

          {/* Guest user pages */}
          <Route path="/">
            <Suspense fallback={<Loader />}>
              <GuestMarkup></GuestMarkup>
            </Suspense>
          </Route>

          {/* Error Page */}
          <Route>
            <Error404></Error404>
          </Route>
        </Switch>
      </div>
    </ServiceContextProvider>
  );
}

export default Markup;
