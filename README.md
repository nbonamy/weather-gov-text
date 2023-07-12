# weather-gov-text
Generates text weather forecasts from weather.gov API.

The goal is to provide a text that can be fed to a TTS system for integration into a home/smart assistant for instance.

Example of text created:

> Showers And Thunderstorms. Temperature: 22°C.  Chance of precipitation: 91%.  Wind speed: 10 mph.

## Installation

`npm install`

## Configuration

You need to create a `config.yml` file to specify your location. Example:

```yaml
location:
  gridId: LOT
  gridX: 76
  gridY: 73
```

You can obtain this information by making a call to `https://api.weather.gov/points/41.8781,-87.6298` (replace latitude, longitudfe with yours).

Weather.gov temperatures are in Farenheit. If you want them to be converted in Celsius, add this to `config.yml`:

```yaml
temperature:
  unit: C
```

You can also configure how the text will be built with `parts` options:

| Name            | Options            | Default |                                                   |
|-----------------|--------------------|---------|---------------------------------------------------|
| `forecast`      | `short`/`detailed` | `short` | Switch between shortForecast and detailedForecast |
| `temperature`   | `true`/`false`     | `true`  | Include temperature                               |
| `precipitation` | `true`/`false`     | `true`  | Include precipitation                             |
| `wind`          | `true`/`false`     | `true`  | Include wind                                      |

Example:

```yaml
parts:
  forecast: detailed
  precipitation: false
```

## Endpoints

### `/daily/<day>`

Where `day` can be:

- today
- tonight
- tomorrow
- tomorrow night
- any day name (monday, tuesday...)
- any day name (monday, tuesday...) followed by tonight

### `/hourly/<hour>`

Where `hour` can be:

- now
- a time of the day (9 or 10pm)
- an offset if number of hours (+1 or +10)

