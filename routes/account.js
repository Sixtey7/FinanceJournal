"use strict";

let express = require('express');
let router = express.Router();
let Ajv = require('ajv');
let Pool = require('pg-pool');

let _logger = require('../config/logger')('AccountDB');

let ajv = new Ajv({allErrors: true, "format": "full"});

let validator = ajv.compile(require('../schema/recurring.json'));

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

const TABLE_NAME = 'accounts';

//TODO: all of these CRUD routes could probably be a single file that took the table as a paramter
/**
 * Get all of the acccounts from the database
 */
router.get('/', function(req, res, next) {
    _logger.debug('getting all accounts');

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

/**
 * Get a specific account from the database
 */
router.get('/:accountId', function (req, res, next) {
    _logger.debug('getting the account with id %d', req.params.accountId);
    (async () => {
        var client = await pool.connect();
        try {
            let result = await client.query('SELECT * FROM ' + TABLE_NAME + ' where id = $1', [req.params.accountId]);
            _logger.debug('Got the result %j', result.rows);
            res.status(200).send(result.rows[0]);
        }
        finally { 
            client.release();
        }
    })().catch(e => {
        _logger.error(e.message);
        _logger.error(e.stack);
        resu.status(500).send(e.message);
    });
});

/**
 * Add a new account to the database
 */
router.put('/', function(req, res, next) {
    _logger.debug('Adding a new account to the database: %j', req.body);

    let data = req.body;

    if (validator(data)) {
        (async() => {
            var client = await pool.connect();

            try {
                let findBiggestNumber = await client.query('SELECT MAX(id) FROM ' + TABLE_NAME);
                let result = await client.query('INSERT INTO ' + TABLE_NAME + ' (id, data) VALUES ($1, $2)'[findBiggestNumber.rows[0].max + 1, req.body]);
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
        let errorText = ajv.errorsText(validator.errors);
        _logger.warn('input provided failed validation with error %s', errorText);
        res.status(400).send(errorText);
    }
});

router.post('/:accountId', function(req, res, next) {
    _logger.debug('Got an update for account %d with data %j', req.params.accountId, req.body);

    let data = req.body;
    if (validator(data)) {
        (async () => {
            var client = await pool.connect();

            try {
                let result = await client.query('UPDATE ' + TABLE_NAME + ' SET data = $2 WHERE id = $1', [req.params.accountId, req.body]);
                _logger.debug('Got the result: %j', result);
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
        let errorText = ajv.errorsText(validator.errors);
        _logger.warn('input provided failed validation with error %s', errorText);
        res.status(400).send(errorText);
    }
});

module.exports = router;