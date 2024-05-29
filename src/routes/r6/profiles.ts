import { RequestFullProfile } from "../../http/ubi-r6-stats";
import { R6Platform, R6Region } from "../../utilities/interfaces/enums";
import { R6UsernameIsValid, GUIDIsValid } from "../../utilities/validity";
import { Request, Response } from "express";

/**
 * Handles HTTP requests made to the following paths:
 *   /r6/profiles/{PLATFORM}/{USERNAME}
 *   /r6/profiles/id/{PROFILEID}
 * Makes necessary function calls to obtain all stats for the specified profiles.
 * Limit of 50 profiles.
 *
 * @param req Express request object.
 * @param res Express response object with callback properties.
 */
export function r6_profiles(req: Request, res: Response) {
  // Can be `id`, `pc`, `psn`, `xbox`.
  const platform = req.params.platform.toLowerCase() as R6Platform;

  // Can be 1-50 usernames or 1-50 profile ids.
  const username = req.params.username;

  // Determine if the URL parameters are valid.
  let isValid = true;

  switch (platform) {
    case R6Platform.id:
      // Check if the profileId (labeled username) is a valid GUID.
      isValid = GUIDIsValid(username);
      break;
    case R6Platform.pc:
    case R6Platform.psn:
    case R6Platform.xbox:
      // Check if the username is valid based on the platform.
      isValid = R6UsernameIsValid(username, platform);
      break;
    default:
      res.status(400).send({
        code: 400,
        error: "Bad Request",
        message:
          "Incorrect URL path. Use /profiles/{PC||PSN||XBOX}/{USERNAME} or /profiles/id/{PROFILE_ID}",
      });
      return;
  }

  if (isValid) {
    // Begin fetching stats from Ubisoft.
    RequestFullProfile(username, platform)
      .then((profileData) => {
        res.status(200).send(profileData);
      })
      .catch((error) => {
        console.error(error);

        res.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message:
            "Something went wrong on our end. Please contact our support team if this error persists.",
        });
      });
  } else {
    // To go into 'message' property of the HTTP error object.
    let errorMessage = new String();

    // Change error message depending on the platform.
    switch (platform) {
      case "id":
        errorMessage = "Profile ID(s) do not conform to the GUID format.";
        break;
      case "uplay":
      case "psn":
      case "xbl":
        errorMessage = "Username contains invalid characters.";
        break;
      default:
        // Invalid platform specified.
        res.status(400).end();
    }

    res.status(400).send({
      code: 400,
      error: "Bad Request",
      message: errorMessage,
    });
  }
}
