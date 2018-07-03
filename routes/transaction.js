let express = require('express');
let router = express.Router();
let Ajv = require('ajv');
let Pool = require('pg-pool');

let _logger = require('../config/logger')('TransactionDB', false);

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

//GET ONE
router.get('/testVal', function(req, res, next) {
    //TODO: Stub implementation that that returns valid, but garbage data
    let transaction = {
        "id" : Number(req.params.transId),
        "name" : "Trans " + req.params.transId,
        "date" : new Date().toISOString(),
        "amount" : 100,
        "type" : "PLANNED"
    }
    //res.send('Returning details about Transaction: ' + req.params.transId);

    //TODO playing with ajv and seeing how that validation works
    if (validator(transaction)) {
        res.send(transaction);
    }
    else {
        _logger.info('failed');
        res.status(500).send();
        _logger.info(ajv.errorsText(validator.errors));
    }
});

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
            _logger.debug('Got the result: %j', result.rows);
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

    _logger.debug('Id is: ' + req.body.id);

    //let data = JSON.parse(req.body);

    //_logger.debug('parsed the body %j', data);

    let data = req.body;

    if (validator(data)) {
        (async () => {
            var client = await pool.connect();

            try {
                //TODO: ID probably shouldn't be passed in here

                let findBiggestNumberResult = await client.query('SELECT MAX(id) FROM ' + TABLE_NAME);
                _logger.debug('largest number %d', findBiggestNumberResult.rows[0].max);
                let result = await client.query('INSERT INTO ' + TABLE_NAME + ' (id, data) VALUES ($1, $2)', [findBiggestNumberResult.rows[0].max + 1, req.body]);
                _logger.debug('Got the result ' + result.rows[0]);
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

module.exports = router;