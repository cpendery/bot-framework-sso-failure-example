import * as React from "react";

import { useCallback, useEffect, useRef } from "react";
import { hooks } from "botframework-webchat";
import { loginRequest } from "./util";

import { useMsal } from "@azure/msal-react";

const { useActivities, usePostActivity } = hooks;

export const AttachmentMiddleware = () => (next: any) => (card: any) => {
  if (card === undefined) {
    return next(card);
  }

  switch (card.attachment.contentType) {
    case "application/vnd.microsoft.card.oauth":
      return <OAuthCard attachment={card.attachment} />;
    default:
      return next(card);
  }
};

const OAuthCard: React.FunctionComponent<{ attachment: any }> = ({
  attachment,
}) => {
  const { current: invokeId } = useRef(
    Math.floor(Math.random() * 1_000_000_000)
  );
  const connectionName = attachment.content?.connectionName ?? "";
  const oauthId = attachment.content?.tokenExchangeResource?.id ?? "";

  const [activities] = useActivities();
  const postActivity = usePostActivity() as unknown as (activity: any) => void;
  const { instance } = useMsal();

  const authenticate = useCallback(async () => {
    const { accessToken } = await instance.acquireTokenSilent(loginRequest);
    postActivity({
      channelData: { invokeId },
      type: "invoke",
      name: "signin/tokenExchange",
      value: {
        id: oauthId,
        connectionName,
        accessToken,
      },
    });
  }, [invokeId, oauthId, postActivity]);

  useEffect(() => {
    const invokeActivity = activities.filter(
      ({ channelData: { invokeId: activityInvokeId } }) =>
        invokeId === activityInvokeId
    );
    console.log(invokeActivity);
  }, [activities, invokeId]);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  return (
    <div>
      <p>Trying to log you in</p>
    </div>
  );
};

export default OAuthCard;
