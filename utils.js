
module.exports = {

  json_status: function(res, err, result) {
    try {
      if (err) {
        res.status(err.code||500).json({ status: 'error', error: err.message||err, details: err })
      } else {
        res.json({ status: 'ok', result: result||'success' })
      }
    } catch (err) {
      console.error(err)
      try {
        res.json({ status: 'error', error: err })
      } catch {}
    }
  },

  tomorrow: function() {
    let tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  },

  getDayName: function(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLocaleLowerCase()
  },

}
