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

module.exports = router;