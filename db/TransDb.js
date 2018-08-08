'use strict'

let _logger = require('../config/logger')('TransDb')
let PGHelper = require('../utils/PGHelper');

let _pgHelper = new PGHelper;

class TransDb {
    async getAllTransactions() {
        var client = await _pgHelper.getPool().connect();
        try { 
            let result = await client.query('SELECT * FROM ' + _pgHelper.getTransactionsTableName());
            return result.rows;
        }
        catch(e) {
            _logger.error(e.message, e.stack);
            throw e;
        }
        finally {
            client.release();
        }
    };

    async getTransactionForId(transId) {
        var client = await _pgHelper.getPool().connect();
        try {
            let result = await client.query('SELECT * FROM ' + _pgHelper.getTransactionsTableName() + ' where id = $1', [transId]);
            if (result.rows && result.rows.length > 0) {
                return result.rows[0];
            }
            else {
                _logger.warn('No transaction was found for id: %d', transId);
                return {};
            }
        }
        catch(e) {
            _logger.error(e.message, e.stack);
            throw new Error(e.message);
        }
        finally {
            client.release();
        }
    };

    async getTransactionsForAccount(accountId) {
        var client = await _pgHelper.getPool().connect();
        try {
            //TODO: Need to figure out how to query inside of a data json blob
            let result = await client.query('SELECT * FROM ' + _pgHelper.getTransactionsTableName() + ' where data->>\'accountId\'= $1', [accountId]);
            if (result.rows) {
                return result.rows;
            }
            else {
                _logger.warn('No transactions were found associated with account: %d', accountId);
                return new Array();
            }
        }
        catch(e) {
            _logger.error(e.message, e.stack);
            throw e;
        }
        finally {
            client.release();
        }
    };

    async insertIntoDatabase(transToInsert) {
        var client = await _pgHelper.getPool().connect();
        try {
            let findBiggestNumberResult = await client.query('SELECT MAX(id) FROM ' + _pgHelper.getTransactionsTableName());
            let newKey = findBiggestNumberResult.rows[0].max + 1;
            //_logger.debug('largest number %d', findBiggestNumberResult.rows[0].max);
            let result = await client.query('INSERT INTO ' + _pgHelper.getTransactionsTableName() + ' (id, data) VALUES ($1, $2)', [newKey, transToInsert]);
            //_logger.debug('Got the result ' + result.rows[0]);
            return newKey;
        }
        finally {
            client.release();
        }
    }

    async updateTransaction(id, data) {
        //validate that the transaction was successful
        var client = await _pgHelper.getPool().connect();
        try {
            let result = await client.query('UPDATE ' + _pgHelper.getTransactionsTableName() + ' SET data = $2 where id = $1', [id, data]);
            _logger.debug('Got the result: ' + result.rowCount);

            return result.rowCount;
        }
        catch(e) {
            _logger.error(e.message, e.stack);
            throw e;
        }
        finally { 
            client.release();
        }
    };

    async deleteTransaction(transToDelete) {
        var client = await _pgHelper.getPool().connect();
        try {
            let result = await client.query('DELETE FROM ' + _pgHelper.getTransactionsTableName() + ' where id = $1', [transToDelete]);
            return result.rowCount
        }
        catch(e) {
            _logger.error(e.message, e.stack);
            throw e;
        }
        finally {
            client.release();
        }
    }

    async deleteAllTransactions() {
        var client = await _pgHelper.getPool().connect();
        try {
            let result = await client.query('DELETE FROM ' + _pgHelper.getTransactionsTableName());
            return result.rowCount;
        }
        catch(e) {
            _logger.error(e.message, e.stack);
            throw e;
        }
        finally {
            client.release();
        }
    }

}

module.exports = TransDb;