# R6-API

![GitHub last commit](https://img.shields.io/github/last-commit/swiftcoda/R6-API.svg?style=for-the-badge)
[![GitHub stars](https://img.shields.io/github/stars/swiftcoda/R6-API.svg?style=for-the-badge)](https://github.com/swiftcoda/R6-API/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/swiftcoda/R6-API.svg?style=for-the-badge)](https://github.com/swiftcoda/R6-API/network)
[![GitHub license](https://img.shields.io/github/license/swiftcoda/R6-API.svg?style=for-the-badge)](https://github.com/swiftcoda/R6-API?tab=License-1-ov-file)

This Node.js (TypeScript) application is an Express.js API wrapper for the Ubisoft Rainbow Six®: Siege API, used to fetch and organize stats for up to 50 players per request.

This project is based on the [GameSense](https://jarrenmorris.com/gamesense/download) API, developed by [Jarren Morris](https://github.com/swiftcoda) and [Caleb Marquart](https://github.com/calebmarquart). It has been simplified to make fetching R6 stats easy for developers on a small scale.




## Technologies

This application has been developed using the TypeScript programming language. This application can run on a system with NPM, Node.js, and TypeScript installed.




## Installation

Ensure all necessary Node packages are installed according to `package.json`:

  >npm ci




## Configuration

You must modify the `config.json` file according to your needs.

### Start of Every R6 Season

Update the `"current_season"` property (Eg. `"Y9S2"`).

### Add Your Ubisoft Credentials

In order to access R6 stats for any player, you must be logged into a Ubisoft account with 2FA disabled. You can even create a "burner" Ubisoft account--it doesn't have to be your personal one.

Add your account's `"email"` and `"password"` to the configuration file.

### OPTIONAL: Change the Server Port

By default, the Express server is running on `localhost:3000`. You may change this port to fulfill your needs.

If using AWS EC2 to host this application, you may be required to use a port in the `8000`s range.




## Usage

Without a process manager installed, you can run a single instance of this application:

  >npm run start

  Avoid starting the application more than 3 times per hour as it logs into your Ubisoft account twice per start and can end up returning `Too Many Requests` errors.




## Contributors

Developer: Jarren Morris ([@SwiftCODA](https://github.com/swiftcoda)), Software Engineering Student

Developer: Caleb Marquart ([@calebmarquart](https://github.com/calebmarquart)), Computer Software Engineering Student


### Endpoints

GET `/r6/profiles/:platform/:username`

#### Request Parameters

| Parameter   | Description                                               | Valid Values      |
|-------------|-----------------------------------------------------------|-------------------|
| `:platform` | The platform on which the player's profile is located.    | `id`, `pc`, `psn`, `xbox` |
| `:username` | The identifier for the player's profile.                  | -                 |

<details>
  <summary> Example Response</summary>

```
{
  "code": 200,
  "profiles": {
    "54822057-4dba-41e2-98b4-42bbe4a9fc4b": {
      "currentSeason": {
        "ranked": {
          "abandons": 0,
          "championNumber": 0,
          "deaths": 325,
          "kdRatio": "1.04",
          "kills": 337,
          "losses": 35,
          "maxRank": "emerald iv",
          "maxRankPoints": 3645,
          "nextRank": "emerald iii",
          "nextRankByMaxRank": "emerald iii",
          "nextRankRankPoints": 3700,
          "previousRank": "emerald v",
          "rank": "emerald iv",
          "rankPointProgress": 0,
          "rankPoints": 3600,
          "winPercent": "52.70%",
          "wins": 35
        }
      },
      "level": 254,
      "lifetime": {
        "overall": {
          "aces": 38,
          "assists": 4651,
          "clutches": 239,
          "deaths": 16826,
          "headshots": 5368,
          "kdRatio": "0.96",
          "kills": 16218,
          "killTrades": 462,
          "losses": 2488,
          "minutesPlayed": 85439,
          "revives": 1031,
          "teamKills": 457,
          "winPercent": "52.51%",
          "wins": 2751
        },
        "casual": {},
        "ranked": {},
        "unranked": {}
      },
      "modified": 1714838665,
      "operators": {
        "overall": {
          "attackers": {
            "maverick": {
              "aces": 0,
              "clutches": 0,
              "deaths": 1,
              "kdRatio": "0.00",
              "kills": 0,
              "losses": 1,
              "minutesPlayed": 3,
              "operator": "maverick",
              "winPercent": "0.00%",
              "wins": 0
            }
          },
          "defenders": {
            "mira": {
              "aces": 0,
              "clutches": 0,
              "deaths": 1,
              "kdRatio": "0.00",
              "kills": 0,
              "losses": 1,
              "minutesPlayed": 5,
              "operator": "mira",
              "winPercent": "50.00%",
              "wins": 1
            }
          }
        },
        "casual": {},
        "ranked": {},
        "unranked": {},
        "platform": "psn",
        "profileId": "54822057-4dba-41e2-98b4-42bbe4a9fc4b"
      }
    }
  }
}
```

</details>


---

## Contributing

Want to contribute to this project?
Caught a mistake or want to contribute to the documentation?

Create an [issue](https://github.com/SwiftCODA/R6-API/issues/new/choose) or make a [pull request](https://github.com/SwiftCODA/R6-API/compare) with a detailed description of your proposed changes.




## License

R6-API is licensed under the MIT License.

This project is not affiliated with Ubisoft Entertainment. Tom Clancy’s, Rainbow Six, The Soldier Icon, Ubisoft and the Ubisoft logo are trademarks of Ubisoft Entertainment.
