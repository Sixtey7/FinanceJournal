'use strict';

const pino = require('pino');

const logLevels = Object.keys(pino.levels.values);

module.exports = function(processName) {
    console.log('building a logger!');
    let options = {
        name: processName,
        serializers: {
            req: pino.stdSerializers.req,
            res: pino.stdSerializers.res
        }
    };

    //variable to store whether or not we're in dev mode
    let pretty = pino.pretty();
    pretty.pipe(process.stdout);
    

    let logger = pino(options, pretty);
    logger.info('built a logger!');

    logger.level = 'debug';

    return logger ;
};