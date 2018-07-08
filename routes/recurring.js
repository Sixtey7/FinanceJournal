let express = require('express');
let router = express.Router();
let Ajv = require('ajv');
let Pool = require('pg-pool');

let _logger = require('../config/logger')('RecurringDB');

let ajv = new Ajv({allErrors: true, "format" : "full"});

let validator = ajv.compile(require('../schema/recurring.json'));

//TODO: This should be pulled out to a config module
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

const TABLE_NAME = 'recurring';

/**
 * Get all of the recurring transactions from the database
 */
router.get('/', function(req, res, next) {
    _logger.debug('getting all recurring transactions');

    (async () => {
        var client = await pool.connect();
        try {
            let result = await client.query('select * from ' + TABLE_NAME);
            _logger.debug('Got the result %j', result.rows);
            res.status(200).send(result.rows);
        }
        finally {
            client.release();
        }
    })().catch(e => {
        _logger.error(e.message);
        _logger.error(e.stack);
        res.status(500).send(e.message);
    });
});

router.get('/:recurrId', function(req, res, next) {
    _logger.debug('getting the recurring transaction for id: %d', req.params.recurrId);
    (async () => {
        var client = await pool.connect();
        try {
            let result = await client.query('SELECT * FROM ' + TABLE_NAME + ' where id = $1', [req.params.recurrId]);
            _logger.debug('Got the result %j', result.rows);
            res.status(200).send(result.rows[0]);
        }
        finally {
            client.release();
        }
    })().catch(e => {
        _logger.error(e.message);
        _logger.error(e.stack);
        res.status(500).send(e.message);
    });
});

/**
 * Add a new recurring transaction to the database
 */
router.put('/', function(req, res, next) {
    _logger.debug('Adding this new recurring transaction to the database: %j', req.body);

    let data = req.body;

    //make sure that the data is valid
    if (validator(data)) {
        (async () => {
            var client = await pool.connect();

            try {
                //find the biggest number so we can find the next id
                //TODO: the database should probably just be set up to autoincrement this id
                let findBiggestNumberResult = await client.query('SELECT MAX(id) FROM ' + TABLE_NAME);
                _logger.debug('largest number %d', findBiggestNumberResult.rows[0].max);
                let result = await client.query('INSERT INTO ' + TABLE_NAME + ' (id, data) VALUES ($1, $2)', [findBiggestNumberResult.rows[0].max + 1, req.body]);
                _logger.debug('Got the result $j', result.rows);
                //TODO: Should probably send back the updated element so the ui would have the id that was generated
                res.status(200).send();
            }
            finally {
                client.release();
            }
        })().catch(e => {
            _logger.error(e.message);
            _logger.error(e.stack);
            res.status(500).send(e.message);
        });
    }
    else {
        //data that was provided failed schema validation
        let errorText = ajv.errorsText(validator.errors);
        _logger.warn('input provided failed validation with error %s', errorText);
        res.status(400).send(errorText);
    }
});

router.post('/:recurrId', function(req, res, next) {
    _logger.debug('Got an update for recurring transaction %d with data %j', req.params.recurrId, req.body);

    let data = req.body;
    if (validator(data)) {
        (async () => {
            var client = await pool.connect();

            try {
                let result = await client.query('UPDATE ' + TABLE_NAME + ' SET data = $2 WHERE id = $1', [req.params.recurrId, req.body]);
                _logger.debug('Got the result: %j', result);
                //TODO: Probably want to send the updated row back to the client
                res.status(200).send();
            }
            finally {
                client.release();
            }
        })().catch(e => {
            _logger.error(e.message);
            _logger.error(e.stack);
            res.status(500).send(e.message);
        })
    }
    else {
        //failed validation!
        let errorText = ajv.errorsText(validator.errors);
        _logger.warn('input provided failed validation with error %s', errorText);
        res.status(400).send(errorText);
    }
});

module.exports = router;
