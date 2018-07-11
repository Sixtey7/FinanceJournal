'use strict'

let _logger = require('../config/logger')('TransHelper');
let Ajv = require('ajv');
let Pool = require('pg-pool');

let pool = new Pool({
    database: 'financejournal',
    user: 'fjuser',
    password: '12345',
    port: 5432,
    ssl: false,
    max: 20,
    min: 4,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 1000
});

const TABLE_NAME = 'transactions';


class TransHelper {
    constructor() {
        _logger.debug('building a new Trans Helper!');
        this.ajv = new Ajv({allErrors: true, "format" : "full"});
        this.validator = this.ajv.compile(require('../schema/transaction.json'));
    }

    async insertIntoDatabase(transToInsert) {
        if (this.validator(transToInsert)) {
            var client = await pool.connect();
            try {
                let findBiggestNumberResult = await client.query('SELECT MAX(id) FROM ' + TABLE_NAME);
                //_logger.debug('largest number %d', findBiggestNumberResult.rows[0].max);
                let result = await client.query('INSERT INTO ' + TABLE_NAME + ' (id, data) VALUES ($1, $2)', [findBiggestNumberResult.rows[0].max + 1, transToInsert]);
                //_logger.debug('Got the result ' + result.rows[0]);
            }
            finally {
                client.release();
            }
        }
        else {
            _logger.warn('Trans to be inserted failed validation with error %s', this.ajv.errorsText(this.validator.errors));
            throw new Error('Object Failed Validation!');
        }
    }

    async insertAllIntoDatabase(allTransToInsert) {
        for (let thisTrans in allTransToInsert) {
            await this.insertIntoDatabase(allTransToInsert[thisTrans]);
        }
    };
}

module.exports = TransHelper;