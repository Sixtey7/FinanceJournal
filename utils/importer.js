'use strict'

let _logger = require('../config/logger')('Importer');
let Ajv = require('ajv');

class Importer {
    constructor() {
        _logger.debug('building a new Importer!');
        this.ajv = new Ajv({allErrors: true, "format" : "full"});
        this.validator = this.ajv.compile(require('../schema/transaction.json'));
        _logger.debug("finished constructor'")
    }

    async createTransactionsFromCSV(csvData) {
        _logger.debug('doing the thing!');   

        let returnArray = new Array();
        //_logger.debug(csvData);
        let csvRows = csvData.split('\n');
        //_logger.debug(csvRows);

        csvRows.map(rowOfData => {
            let values = rowOfData.split(',');

            if (values.length === 1) {
                //I haven't been able to get curl to not add a blank line at the end, so we'll handle this here
                _logger.warn('row had a length of 1!');
            }
            else if (values.length !== 6) {
                _logger.error('Got a bad data row, row had ' + values.length  + ' number of elements!');
                throw new Error('Got a bad data row, row had ' + values.length  + ' number of elements!');
            }
            else {
                /**
                 * The layout of the rows is as follows
                 * 0 - Source
                 * 1 - Debit
                 * 2 - Credit
                 * 3 - Total
                 * 4 - Date
                 * 5 - Notes
                 */
                let newTrans = {
                    'name' : values[0],
                    'date' : new Date(values[4]).toJSON()
                };

                if (values[1]) {
                    newTrans['amount'] = parseFloat(-1 * values[1]);
                }
                else {
                    newTrans['amount'] = parseFloat(values[2]);
                }

                //Notes are a weird case because of how I've been using them.  There are a couple of special phrases to look for
                let notesString = values[5];
                let plannedLoc = notesString.indexOf('pln');
                if (plannedLoc < 0) {
                    plannedLoc = notesString.indexOf('planned');
                }

                let estLoc = notesString.indexOf('est');

                if ((estLoc < 0) && (plannedLoc < 0)) {
                    if (new Date(newTrans.date) < Date.now()) {
                        //no relvalent notes and in the past
                        newTrans['type'] = 'CONFIRMED';
                    }
                    else {
                        _logger.debug(newTrans.date + ' is not before ' + Date.now());
                        newTrans['type'] = 'FUTURE';
                    }
                }
                else {
                    if (estLoc > 0) {
                        _logger.debug('found an estimate');
                        newTrans['type'] = 'ESTIMATE';
                    }
                    if (plannedLoc > 0) {
                        _logger.debug('found a planned');
                        newTrans['type'] = 'PLANNED';
                    }
                }
                newTrans['notes'] = notesString;
                //_logger.debug('built the transaction: %j', newTrans);

                //make sure its valid
                if (this.validator(newTrans)) {
                    returnArray.push(newTrans);
                }
                else {
                    _logger.warn('Built transaction for object %j failed validation with the error: ' + this.ajv.errorsText(this.validator.errors), newTrans);
                }
                
            }
//            _logger.debug('found %d items', values.length);
        });
        return returnArray;
    }
}


module.exports = Importer;