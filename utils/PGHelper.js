'use strict';

let Pool = require('pg-pool');

let pool = new Pool({
    database : 'financejournal',
    user: 'fjuser',
    password: '12345',
    port: 5432,
    ssl: false,
    max: 20,
    min: 4,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 1000
});

class PGHelper {
    getPool() {
        return pool;
    };
    
    getAccountsTableName() {
        return 'accounts';
    };

    getTransactionsTableName() {
        return 'transactions';
    };
}

module.exports = PGHelper;