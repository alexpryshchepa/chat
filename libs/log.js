var winston = require('winston');

function getLogger(module) {
  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        colorize: true,
        label: module.filename,
      }),
    ],
  });
}

module.exports = getLogger;