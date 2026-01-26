import { getGoogleClient } from "../utils/googleClient.ts";

export const getGoogleUser = async (code: string) => {
  const client = getGoogleClient();

  // --- THE FIX IS HERE ---
  const { tokens } = await client.getToken({
    code,
    // You MUST include this line, and it MUST match the frontend URL exactly.
    redirect_uri: 'https://auth.expo.io/@krishthevaelrion/pulseboard_mobile' 
  });
  // -----------------------

  client.setCredentials(tokens);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) throw new Error("Invalid Google token");

  return payload;
};
