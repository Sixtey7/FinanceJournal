'use strict'

let _logger = require('../config/logger')('TransHelper');
let Ajv = require('ajv');
let PGHelper = require('./PGHelper');
let TransDb = require('../db/TransDb');
let AccountHelper = require('./AccountsHelper');

let _transDb = new TransDb();
let _accountHelper = new AccountHelper();

class TransHelper {
    constructor() {
        _logger.debug('building a new Trans Helper!');
        this.ajv = new Ajv({allErrors: true, "format" : "full"});
        this.validator = this.ajv.compile(require('../schema/transaction.json'));
    }

    async insertTrans(transToInsert) {
        if (this.validator(transToInsert)) {
            return await _transDb.insertIntoDatabase(transToInsert);
        }
        else {
            _logger.warn('Trans to be inserted failed validation with error %s', this.ajv.errorsText(this.validator.errors));
            throw new Error('Object Failed Validation!');
        }
    }

    async insertAllIntoDatabase(allTransToInsert) {
        let allKeys = new Array();
        for (let thisTrans in allTransToInsert) {
            let newKey = await this.insertTrans(allTransToInsert[thisTrans]);
            allKeys.push(newKey);
        }

        return allKeys;
    };

    async updateTransaction(id, data) {
        if (this.validator(data)) {
            _transDb.updateTransaction(id, data);

            //need to tell the account helper that it might need to update itself
            _accountHelper.determineAndUpdateDynamicAccount(data.accountId);            
        }
        else {
            let errorsText = this.ajv.errorsText(this.validator.errors);
            _logger.warn('input provided failed validation with error %s', errorsText);
            throw new Error(errorsText);
        }
    }
}

module.exports = TransHelper;