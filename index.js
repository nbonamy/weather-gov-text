
const express = require('express')
const portfinder = require('portfinder')
const mdns = require('mdns');
const Config = require('./config')
const Weather = require('./weather')
const { json_status } = require('./utils')

// init our stuff
const settings = new Config()

// now we can build our modules
const weather = new Weather(settings)

// we need a port
let startPort = settings.port
portfinder.getPort({ port: startPort },  async (err, port) => {

  // error
  if (err || (startPort != null && port != startPort)) {
    console.log(`Error: no available port found`)
    process.exit(1)
  }

  // our server
  const app = express()
  app.use(express.json({limit: '50mb'}));
  app.use('/', weather.routes())

  // error handler
  app.use((err, req, res, next) => {
    console.error(err.stack)
    json_status(res, err)
  })  

	// start it
	app.listen(port, () => {

		// log
		console.log(`Weather Text listening on port ${port}`)

		// advertise
		const ad = mdns.createAdvertisement(mdns.tcp('weathertext'), port);
		ad.start();

	})

})
