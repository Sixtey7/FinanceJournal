let express = require('express');
let router = express.Router();
const Importer = require('../utils/importer');
const TransDb = require('../db/TransDb');
const TransHelper = require('../utils/TransHelper');
const AccountsHelper = require('../utils/AccountsHelper');

let _logger = require('../config/logger')('TransactionDB', false);
let _accountsHelper = new AccountsHelper();
let _transHelper = new TransHelper();
let _transDb = new TransDb();

/**
 * Get all of the transactions from the database
 */
router.get('/', function (req, res, next) {
    _logger.debug('getting all transactions!');

    (async () => { 
        let result = await _transDb.getAllTransactions();
        res.status(200).send(result);  
    })().catch(e => {
        _logger.error(e.message, e.stack);
        res.status(500).send(e.message);
    });
    
});

router.get('/:transId', function(req, res, next) {
    _logger.debug('running test get row for id %d', req.params.transId);

    (async () => {
        let result = await _transDb.getTransactionForId(req.params.transId);
        res.status(200).send(result);
    })().catch(e => {
        _logger.error(e.message, e.stack);
        res.status(500).send(e.message);
    })
});

router.put('/', function(req, res, next) {
    _logger.info('Inserting an object into the database!');

    _logger.debug('got the object %j', req.body);

    (async () => {
        let result = await _transHelper.insertTrans(req.body);
        res.status(200).send(result + '');
    })().catch(e => {
        _logger.error(e.message, e.stack);
        res.status(500).send(e.message);
    })
});

router.post('/:transId', function(req, res, next) {
    _logger.debug('Got an update for transaction %d with data %j', req.params.transId, req.body);

    (async () => { 
        let result = await _transHelper.updateTransaction(req.params.transId, req.body);
        res.status(200).send(result + '');  
    })().catch(e => {
        _logger.error(e.message, e.stack);
        res.status(500).send(e.message);
    });
});

/**
 * Delete the transaction specified by transId from the database
 */
router.delete('/:transId', function(req, res, next) {
    _logger.debug('Got a request to delete transaction %d', req.params.transId);

    (async () => {
        let result = await _transDb.deleteTransaction(req.params.transId);
        res.status(200).send('' + result);
    })().catch(e => {
        _logger.error(e.message, e.stack);
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
        let result = await _transDb.deleteAllTransactions();
        res.status(200).send('' + result);
    })().catch(e => {
        _logger.error(e.message, e.stack);
        res.status(500).send(e.message);
    });

});

router.put('/import', function(req, res, next) {
    _logger.debug('running the import!');

    let importer = new Importer();

    (async () => {

        //create an account to hold this list of transactions
        let newAccount = {
            name : 'Checking',
            dynamic: true
        };

        let newAccountId = await _accountsHelper.insertAccountIntoDatabase(newAccount);
        let result = await importer.createTransactionsFromCSV(req.body, newAccountId);

        //_logger.debug('got the result %j', result);

        await _transHelper.insertAllIntoDatabase(result);

        res.status(200).send();
    })().catch(e => {
        _logger.error(e.message);
        _logger.error(e.stack);
        res.status(500).send(e.message);  
    });
});

module.exports = router;