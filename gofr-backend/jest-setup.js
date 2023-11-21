const winston = require('winston')
const siteConfig = require(`./__tests__/config/default.json`)

global["appsitepath" + process.pid] = process.env.APP__SITE__PATH || siteConfig.app.site.path
global["appcorepath" + process.pid] = process.env.APP__CORE__PATH || siteConfig.app.core.path

winston.add( new winston.transports.Console( {
  level: "error",
  silent: true,
  format: winston.format.prettyPrint(),
  colorize: true
} ) )
