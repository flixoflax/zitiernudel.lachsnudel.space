import "./style.css";
import React from "react";
// eslint-disable-next-line @typescript-eslint/naming-convention
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.querySelector("#root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
