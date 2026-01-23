import { OAuth2Client } from "google-auth-library";

// We create a function that returns the client, 
// ensuring it reads the latest process.env values when called.
export const getGoogleClient = () => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};