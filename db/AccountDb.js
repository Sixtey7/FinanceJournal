'use strict'

let _logger = require('../config/logger')('AccountDb');
let PGHelper = require('../utils/PGHelper');

let _pgHelper = new PGHelper;

class AccountDb {
    async getAllAccounts() {
        var client = await _pgHelper.getPool().connect();
        try {
            let result = await client.query('SELECT * FROM ' + _pgHelper.getAccountsTableName());
            return result.rows;
        }
        catch (e) {
            _logger.error(e.message, e.stack);
            throw e;
        }
        finally {
            client.release();
        }
    };

    async getAccount(accountId) {
        var client = await _pgHelper.getPool().connect();
        try {
            let result = await client.query('SELECT * FROM ' + _pgHelper.getAccountsTableName() + ' where id = $1', [accountId]);

            if (result.rows && result.rows.length > 0) {
                return result.rows[0]
            }
            else {
                _logger.warn('No account was found for id: ' + accountId);
                return {};
            }
        }
        catch(e) { 
            _logger.error(e.message, e.stack);
            throw e;
        }
        finally {
            client.release();
        }
    }

    async insertAccount(accountToInsert) {
        var client = await _pgHelper.getPool().connect();
        try {
            let newKey = 0;            
            let findBiggestNumberResult = await client.query('SELECT MAX(id) FROM ' + _pgHelper.getAccountsTableName());
            
            if (findBiggestNumberResult.rows[0]) {
                newKey = findBiggestNumberResult.rows[0].max + 1;
            }

            let result = await client.query('INSERT INTO ' + _pgHelper.getAccountsTableName() + ' (id, data) VALUES ($1, $2)', [newKey, accountToInsert]);
        
            return newKey;
        }
        catch (e) {
            _logger.error(e.message, e.stack);
        }
        finally {
            client.release();
        }
    }

    async updateAccount(id, data) {
        var client = await _pgHelper.getPool().connect();
        try {
            let result = await client.query('UPDATE ' + _pgHelper.getAccountsTableName() + ' set data = $2 where id = $1', [id, data]);
        
            return result.rowCount;;
        }
        catch(e) {
            _logger.error(e.message, e.stack);
            throw e;
        }
        finally {
            client.release();
        }
    };
}

module.exports = AccountDb;