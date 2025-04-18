// src/index.js

import React from "react";
import ReactDOM from "react-dom/client";
import ProtectedRoute from "./ProtectedRoute";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ProtectedRoute />
  </React.StrictMode>
);
