'use strict'

let _logger = require('../config/logger')('AccountsHelper');
let Ajv = require('ajv');
let PGHelper = require('./PGHelper');
let TransDB = require('../db/TransDb');

let pgHelper = new PGHelper();

let _transDb = new TransDB();

class AccountsHelper {
    constructor() {
        _logger.debug('building a new Accounts Helper!');
        this.ajv = new Ajv({allErrors: true, "format": "full"});
        this.validator = this.ajv.compile(require('../schema/account.json'));
    }

    async insertAccountIntoDatabase(accountToInsert) {
        if (this.validator(accountToInsert)) {
            var client = await pgHelper.getPool().connect();
            try {
                let findBiggestNumberResult = await client.query('SELECT MAX(id) FROM ' + pgHelper.getAccountsTableName());
                let newKey = 0;
                if (findBiggestNumberResult.rows[0]) {
                    newKey = findBiggestNumberResult.rows[0].max + 1;
                }

                _logger.debug('found the new account id: ' + newKey);

                let result = await client.query('INSERT INTO ' + pgHelper.getAccountsTableName() + ' (id, data) VALUES ($1, $2)', [newKey, accountToInsert]);

                return newKey;
            }
            catch (e) {
                _logger.error(e);
            }
            finally {
                client.release();
            }
        }
        else {
            _logger.warn('Account to be inserted failed validation with error %s', this.ajv.errorsText(this.validator.errors));
            throw new Error('Account failed validation!');
        }
    }

    async determineAndUpdateDynamicAccount(accountId) {
        //first, determine if we are dealing with a dynamic account
        var client = await pgHelper.getPool().connect();
        try {
            let accountDbResult = await client.query('SELECT * FROM ' + pgHelper.getAccountsTableName() + ' where id = $1', [accountId]);
            
            if (accountDbResult.rows && accountDbResult.rows.length > 0) {
                let accountToVerify = accountDbResult.rows[0].data;
                
                if (accountToVerify.dynamic) {
                    _logger.debug('Determined account: ' + accountId + ' is dynamic!');
                    this.updateDynamicAccount(accountId);
                }
                else { 
                    _logger.debug('Determine account ' + accountId + ' is not dynamic');
                }
            }
            else {
                _logger.error('Was asked to update an account that doesn\'t exist.  Provided id was: ' + accountId);
                throw new Error('Failed To Update Account Because It Didn\'t Exist!');
            }
        }
        catch(e) {
            _logger.error(e.message, e.stack);
        }
        finally {
            client.release();
        }
    }

    /**
     * 
     * @param {number} accountId - the id of the account to update 
     */
    async updateDynamicAccount(accountId) {
        let allAccounts = await _transDb.getTransactionsForAccount(accountId);
        _logger.debug('found %d transactions for the account that need updating!', allAccounts.length);
        //start building the total
        let total = 0;
        allAccounts.foreach(function(thisTrans) {

        });

        _logger.debug('build the total: %d', total);


    }
}

module.exports = AccountsHelper;