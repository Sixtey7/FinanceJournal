'use strict';

const pino = require('pino');

const logLevels = Object.keys(pino.levels.values);

module.exports = function(processName) {
    let options = {
        name: processName,
        serializers: {
            req: pino.stdSerializers.req,
            res: pino.stdSerializers.res
        },
        level: 'debug'
    };

    //variable to store whether or not we're in dev mode
    let pretty = pino.pretty();
    pretty.pipe(process.stdout);
    

    let logger = pino(options, pretty);
    logger.debug('Logger configured for use!');

    return logger ;
};