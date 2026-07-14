type UnauthorizedHandler = (rejectedToken: string) => void;

let unauthorizedHandler: UnauthorizedHandler | undefined;

export function notifyAuthenticatedRequestRejected(rejectedToken: string) {
  unauthorizedHandler?.(rejectedToken);
}

export function registerAuthenticatedRequestRejectedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;

  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = undefined;
  };
}
