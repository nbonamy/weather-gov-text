module.exports = {
  apps : [{
    name   : "weather-gov-text",
    script : "./index.js",
    watch: true,
		watch_delay: 1000,
    log_date_format: "YYYY-MM-DD HH:mm:ss"
  }]
}
