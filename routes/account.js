"use strict";

let express = require('express');
let router = express.Router();
let Ajv = require('ajv');
let AccountDB = require('../db/AccountDb');
let AccountHelper = require('../utils/AccountsHelper');
let _logger = require('../config/logger')('AccountDB');

let ajv = new Ajv({allErrors: true, "format": "full"});

let validator = ajv.compile(require('../schema/account.json'));

let _accountDb = new AccountDB();
let _accountHelper = new AccountHelper();

/**
 * Get all of the acccounts from the database
 */
router.get('/', function(req, res, next) {
    _logger.debug('getting all accounts');

    (async () => {
        let result = await _accountDb.getAllAccounts();
        res.status(200).send(result);
        
    })().catch(e => {
        _logger.error(e.message, e.stack);
        res.status(500).send(e.message);
    });
});

/**
 * Get a specific account from the database
 */
router.get('/:accountId', function (req, res, next) {
    _logger.debug('getting the account with id %d', req.params.accountId);
    
    (async () => {
        let result = await _accountDb.getAccount(req.params.accountId);
        res.status(200).send(result);
    })().catch(e => {
        _logger.error(e.message, e.stack);
        res.status(500).send(e.message);
    })
});

/**
 * Add a new account to the database
 */
router.put('/', function(req, res, next) {
    _logger.debug('Adding a new account to the database: %j', req.body);

    (async () => {
        let result = await _accountHelper.insertAccountIntoDatabase(req.body);
        res.status(200).send('' + result);
    })().catch(e => {
        _logger.error(e.message, e.stack);
        res.status(500).send(e.message);
    });

});

router.post('/:accountId', function(req, res, next) {
    _logger.debug('Got an update for account %d with data %j', req.params.accountId, req.body);

    (async () => {
        let result = await _accountHelper.updateAccount(req.params.accountId, req.body)
        res.status(200).send(result + '');
    })().catch(e => {
        _logger.error(e.message, e.stack);
        res.status(500).send(e.message);
    });
});

module.exports = router;