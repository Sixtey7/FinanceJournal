let express = require('express');
let router = express.Router();
let Ajv = require('ajv');
let Pool = require('pg-pool');

const Importer = require('../utils/importer');
const TransHelper = require('../utils/TransHelper');

let _logger = require('../config/logger')('TransactionDB', false);
let _transHelper = new TransHelper();

let ajv = new Ajv({allErrors: true, "format" : "full"});

let validator = ajv.compile(require('../schema/transaction.json'));

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

/**
 * Get all of the transactions from the database
 */
router.get('/', function (req, res, next) {
    _logger.debug('running dbTest!');

    (async () => {
        var client = await pool.connect();
        try {
            _logger.debug('running the query!');
            let result = await client.query('select * from ' + TABLE_NAME );
            //_logger.debug('Got the result: %j', result.rows);
            res.status(200).send(result.rows);
        }
        finally {
            client.release();
        }
    })().catch(e => {
        _logger.error(e.message, e.stack);
        //note: in a real world, we probs don't want to send the error message to the user 
        //but rather a cleaned up message, but I'm lazy
        res.status(500).send(e.message);
    })
    
});

router.get('/:transId', function(req, res, next) {
    _logger.info('running test get row for id %d', req.params.transId);
    (async () => {
        var client = await pool.connect();
        try {
            let result = await client.query('SELECT * FROM ' + TABLE_NAME + ' where id = $1', [req.params.transId]);
            _logger.debug('Got the result: %j', result.rows[0]);
            res.status(200).send(result.rows[0]);
        }
        finally {
            client.release();
        }
    })().catch(e => {
        _logger.error(e.message, e.stack);
        res.status(500).send(e.message);
    });
});

router.put('/', function(req, res, next) {
    _logger.info('Inserting an object into the database!');

    _logger.debug('got the object %j', req.body);

    let data = req.body;

    if (validator(data)) {
        (async () => {
            var client = await pool.connect();

            try {
                let findBiggestNumberResult = await client.query('SELECT MAX(id) FROM ' + TABLE_NAME);
                _logger.debug('largest number %d', findBiggestNumberResult.rows[0].max);
                let result = await client.query('INSERT INTO ' + TABLE_NAME + ' (id, data) VALUES ($1, $2) RETURNING id', [findBiggestNumberResult.rows[0].max + 1, req.body]);
                _logger.debug('Got the result ' + JSON.stringify(result));
                res.status(200).send(result.rows[0].id + '');
            }
            finally {
                client.release();
            }
        })().catch(e => {
            _logger.error(e.message, e.stack);
            res.status(500).send(e.message);
        });
    }
    else {
        //data provided failed validation, return an error to the client
        let errorText = ajv.errorsText(validator.errors);
        _logger.warn('input provided failed validation with error %s', errorText);
        res.status(400).send(errorText);
    }
});

router.post('/:transId', function(req, res, next) {
    _logger.debug('Got an update for transaction %d with data %j', req.params.transId, req.body);

    let data = req.body;
    if (validator(data)) {
        (async () => {
            var client = await pool.connect();

            try {
                let result = await client.query('UPDATE ' + TABLE_NAME + ' SET data = $2 where id = $1', [req.params.transId, req.body]);
                _logger.debug('Got the result: ' + result.rows[0]);
                res.status(200).send();
            }
            finally {
                client.release();
            }
        })().catch(e => {
            _logger.error(e.message, e.stack);
            res.status(500).send(e.message);
        });
    }
    else {
        //data provided failed validation, return an error to the client
        let errorText = ajv.errorsText(validator.errors);
        _logger.warn('input provided failed validation with error %s', errorText);
        res.status(400).send(errorText);
    }
});

/**
 * Delete the transaction specified by transId from the database
 */
router.delete('/:transId', function(req, res, next) {
    _logger.debug('Got a request to delete transaction %d', req.params.transId);

    (async () => {
        var client = await pool.connect();

        try {
            let result = await client.query('DELETE FROM ' + TABLE_NAME + ' where id = $1', [req.params.transId]);
            _logger.debug('Got the result %j', result);
            res.status(200).send('' + result.rowCount);
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
 * Delete all of the transactionsfromthe database
 * Note: just havinga delete request to / might make more sense, but seemed too easy to hit by accident
 */
router.delete('/delete/all', function(req, res, next) {
    _logger.debug('Got a request to delete all of the transactions from the database');

    (async () => {
        var client = await pool.connect();

        try {
            let result = await client.query('DELETE FROM ' + TABLE_NAME);
            _logger.debug('Got the result %j', result);
            res.status(200).send(result.rowCount + '');
        }
        finally { 
            client.release();
        }
    })().catch(e =>{
        _logger.error(e.message);
        _logger.error(e.stack);
        res.status(500).send(e.message);
    })
});
router.put('/import', function(req, res, next) {
    _logger.debug('running the import!');

    let importer = new Importer();

    (async () => {
    
        let result = await importer.createTransactionsFromCSV(req.body);

        //_logger.debug('got the result %j', result);

        await _transHelper.insertAllIntoDatabase(result);

        res.status(200).send();
    })().catch(e => {
        _logger.error(e.message);
        _logger.error(e.stack);
        res.status(500).send(e.message);  
    });
    //res.status(200).send();


});

module.exports = router;