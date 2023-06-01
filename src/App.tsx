import { useMsal } from "@azure/msal-react";
import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import "./style.css";
import ReactWebChat, {
  createDirectLine,
  createStore,
} from "botframework-webchat";
import { loginRequest } from "./util";
import { AttachmentMiddleware } from "./BotFramework";

const WebChat = () => {
  const [token, setToken] = useState("");
  const userId = "dl_" + Math.floor(Math.random() * 1_000_000_000);
  const headers = {
    Authorization: `Bearer ${process.env.REACT_APP_BOT_SERVICE_KEY ?? ""}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetch("https://directline.botframework.com/v3/directline/conversations", {
      body: JSON.stringify({ User: { Id: userId } }),
      method: "POST",
      headers,
    })
      .then((response) => response.json())
      .then((data) => {
        setToken(data.token);
      });
  }, []);

  const store = useMemo(
    () =>
      createStore(
        {},
        ({ dispatch }: { dispatch: any }) =>
          (next: any) =>
          (action: any) => {
            if (action.type === "DIRECT_LINE/CONNECT_FULFILLED") {
              dispatch({
                type: "WEB_CHAT/SEND_EVENT",
                payload: {
                  name: "webchat/join",
                  value: {
                    language: window.navigator.language,
                  },
                },
              });
            }
            return next(action);
          }
      ),
    []
  );

  const directLine = useMemo(() => createDirectLine({ token }), [token]);
  return (
    <ReactWebChat
      directLine={directLine}
      attachmentMiddleware={AttachmentMiddleware}
      userID=""
      store={store}
    />
  );
};

export default function App() {
  const { instance } = useMsal();
  const [showChat, setShowChat] = useState(false);
  const onClick = React.useCallback(async () => {
    const result = await instance.loginPopup(loginRequest);
    if (result) {
      instance.setActiveAccount(result.account);
      setShowChat(true);
    }
  }, [instance]);
  return (
    <div>
      <button onClick={onClick}>Login</button>
      {showChat && <WebChat />}
    </div>
  );
}
