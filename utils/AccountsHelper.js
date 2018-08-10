'use strict'

let _logger = require('../config/logger')('AccountsHelper');
let Ajv = require('ajv');
let TransDB = require('../db/TransDb');
let AccountsDB = require('../db/AccountDb');

let _transDb = new TransDB();
let _accountDb = new AccountsDB();

class AccountsHelper {
    constructor() {
        _logger.debug('building a new Accounts Helper!');
        this.ajv = new Ajv({allErrors: true, "format": "full"});
        this.validator = this.ajv.compile(require('../schema/account.json'));
    }

    async insertAccountIntoDatabase(accountToInsert) {
        if (this.validator(accountToInsert)) {
            return await _accountDb.insertAccount(accountToInsert);
        }
        else {
            _logger.warn('Account to be inserted failed validation with error %s', this.ajv.errorsText(this.validator.errors));
            throw new Error('Account failed validation!');
        }
    }

    async updateAccount(id, accountToUpdate) {
        if (this.validator(accountToUpdate)) {
            return await _accountDb.updateAccount(id, accountToUpdate);
        }
        else {
            _logger.warn('ACcount to be updated failed validation with error %s', this.ajv.errorsText(this.validator.errors));
            throw new Error('Account failed validation!');
        }
    };

    async determineAndUpdateDynamicAccount(accountId) {
        //first, determine if we are dealing with a dynamic account
        try {
            let accountToVerify = await _accountDb.getAccount(accountId);
            
            if (accountToVerify) {                
                if (accountToVerify.data.dynamic) {
                    _logger.debug('Determined account: ' + accountId + ' is dynamic!');
                    this.updateDynamicAccount(accountToVerify);
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
    }

    /**
     * Recaulate the total for an account
     * NOTE: This could probably be smarter, where it caches values at a certain point, but, for now it just redoes the entire math
     * @param {number} accountId - the id of the account to update 
     */
    async updateDynamicAccount(accountToUpdate) {
        let allAccounts = await _transDb.getTransactionsForAccount(accountToUpdate.id);
        _logger.debug('found %d transactions for the account that need updating!', allAccounts.length);
        //start building the total
        let total = 0;
        allAccounts.forEach(function(thisTrans) {
            total += thisTrans.data.amount;
        });

        total = total.toFixed(2);
        _logger.debug('build the total: %d', total); 

        accountToUpdate.data.amount = total;

        _accountDb.updateAccount(accountToUpdate.id, accountToUpdate.data);

    }
}

module.exports = AccountsHelper;