import { getGoogleClient } from "../utils/googleClient.ts";

export const getGoogleUser = async (code: string) => {
  const client = getGoogleClient(); // Create the client here, inside the function

  const { tokens } = await client.getToken(code);

  client.setCredentials(tokens);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) throw new Error("Invalid Google token");

  return payload;
};