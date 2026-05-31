export function isAuthorized(request: Request, apiKey: string | undefined) {
  if (!apiKey) {
    return process.env.NODE_ENV !== "production";
  }

  const headerApiKey = request.headers.get("x-api-key");
  const authorization = request.headers.get("authorization");

  return headerApiKey === apiKey || authorization === `Bearer ${apiKey}`;
}
