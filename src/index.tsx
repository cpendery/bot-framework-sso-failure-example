import * as React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication, Configuration } from "@azure/msal-browser";
import App from "./App";

const rootElement = document.getElementById("root");
//@ts-ignore
const root = createRoot(rootElement);

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.REACT_APP_AUTHENTICATION_CLIENT_ID ?? "",
    authority: `https://login.microsoftonline.com/common`,
  },
  cache: {
    cacheLocation: "localStorage",
  },
};
const pca = new PublicClientApplication(msalConfig);

root.render(
  <StrictMode>
    <MsalProvider instance={pca}>
      <App />
    </MsalProvider>
  </StrictMode>
);
