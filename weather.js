
const express = require('express')
const { json_status, tomorrow, getDayName } = require('./utils')

// some constants
const API_BASE_URL = 'https://api.weather.gov'

// we need fetch
if (typeof fetch == 'undefined') {
  fetch = require('node-fetch')
}

module.exports = class {

  constructor(settings) {
    this._settings = settings
  }

  routes() {

    const router = express.Router()

    router.get('/daily/:day', (req, res, next) => {
      this.getDailyForecast(req.params.day)
        .then((result) => json_status(res, null, result))
        .catch(err => next(err))
    })

    router.get('/hourly/:hour', (req, res, next) => {
      this.getHourlyForecast(req.params.hour)
        .then((result) => json_status(res, null, result))
        .catch(err => next(err))
    })

    return router

  }

  async getDailyForecast(day) {

    // we need lowercase
    day = day.toLocaleLowerCase()

    // get the forecast
    let forecast = await this._callApi(`/gridpoints/${this._getLocation()}/forecast`)

    // we need to get the right day name
    if (day.startsWith('tomorrow')) {
      day = day.replace('tomorrow', getDayName(tomorrow()))
    }

    // log
    console.log(`Extracting daily forecast for day=${day}`)

    // extract forecast
    let forecastText = ''
    for (let period of forecast.properties.periods) {
      if (period.name.toLocaleLowerCase() == day) {
        forecastText = this._genForecastText(period)
        break
      }
    }

    // if not found
    if (forecastText == '') {
      throw new Error(`No forecast found for ${day}`)
    }
    
    return {
      text: forecastText,
      //forecast: forecast
    }
  }

  async getHourlyForecast(hour) {

    // we need lowercase
    hour = hour.toLocaleLowerCase()

    // get the forecast
    let forecast = await this._callApi(`/gridpoints/${this._getLocation()}/forecast/hourly`)

    // get today date
    let day = new Date().getDate()

    // am/pm stuff
    if (hour.toString().endsWith('am')) {
      hour = parseInt(hour.replace('am', ''))
    } else if (hour.toString().endsWith('pm')) {
      hour = parseInt(hour.replace('pm', '')) + 12
    }

    // we need to get the right hour
    if (hour == 'now') {
      hour = new Date().getHours()
    } else if (hour.toString().startsWith('+')) {
      hour = new Date().getHours() + parseInt(hour)
      if (hour > 23) {
        hour = hour - 24
        day = tomorrow().getDate()
      }
    } else {
      let now = new Date().getHours()
      if (hour < now) {
        if (now < 12) hour = parseInt(hour) + 12
        else day = tomorrow().getDate()
      }
    }

    // pad
    day = day.toString().padStart(2, '0')
    hour = hour.toString().padStart(2, '0')

    // log
    console.log(`Extracting hourly forecast for day=${day} hour=${hour}`)

    // extract forecast
    let forecastText = ''
    for (let period of forecast.properties.periods) {
      if (period.startTime.includes(`${day}T${hour}:`)) {
        forecastText = this._genForecastText(period)
        break
      }
    }

    // if not found
    if (forecastText == '') {
      throw new Error(`No forecast found for ${hour}`)
    }

    return {
      text: forecastText,
      //forecast: forecast
    }

  }

  _genForecastText(period) {

    // start with short
    let text = `${period.shortForecast}.`
    if (this._settings.parts?.forecast == 'detailed' && period.detailedForecast != '') {
      text = `${period.detailedForecast}.`
    }

    // temperature
    if (this._settings.parts?.temperature !== false && period.temperature) {
      text += ` Temperature: ${this._genTemperatureText(period)}. `
    }

    // chance of precipitation
    if (this._settings.parts?.precipitation !== false && period.probabilityOfPrecipitation) {
      text += ` Chance of precipitation: ${period.probabilityOfPrecipitation.value}%. `
    }

    // wind speed
    if (this._settings.parts?.wind !== false && period.windSpeed) {
      text += ` Wind speed: ${period.windSpeed}. `
    }

    // done
    return text

  }

  _genTemperatureText(period) {

    let temp = period.temperature
    let unit = period.temperatureUnit

    // if right unit
    if (this._settings.temperature?.unit && this._settings.temperature.unit != unit) {

      if (unit == 'F') {
        // farhenheit to celsius
        temp = Math.round((temp -32) * 5/9)
        unit = 'C'
      } else if (unit == 'C') {
        // celsius to farhenheit
        temp = Math.round(temp * 9/5 + 32)
        unit = 'F'
      }

    }

    // done
    return `${temp}°${unit}`

  }

  _getLocation() {
    return `${this._settings.location.gridId}/${this._settings.location.gridX},${this._settings.location.gridY}`
  }

  async _callApi(path, params) {

    // call it
    let url = this._getUrl(API_BASE_URL, path, params)
    console.log(`GET ${url}`)
    let response = await fetch(url, this._getFetchOptions())

    // parse and check auth
    let json = await response.json();
    return json

  }

  _getUrl(baseUrl, path, params) {
    let url = `${baseUrl}${path}`
    for (let key in params) {
      let sep = url.includes('?') ? '&' : '?'
      url += `${sep}${key}=${encodeURIComponent(params[key])}`
    }
    return url
  }

  _getFetchOptions() {
    return {
      headers: {
        'User-Agent': '(https://github.com/nbonamy/weather-gov-text, nicolas@bonamy.fr)'
      }
    }
  }

}