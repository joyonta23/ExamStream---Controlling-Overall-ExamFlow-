import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));
const googleClientId = (
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "297372661384-7omhitbakkms778n9ff2d0ngk4veqt9c.apps.googleusercontent.com"
).trim();

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
