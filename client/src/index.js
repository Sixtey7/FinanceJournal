import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import Transaction from './transactions/Transactions';
import AccountsTable from './accounts/AccountsTable';
ReactDOM.render(<Transaction />, document.getElementById('root'));
//ReactDOM.render(<AccountsTable />, document.getElementById('root'));
registerServiceWorker();
