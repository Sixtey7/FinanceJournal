import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import Transaction from './transactions/Transactions';

ReactDOM.render(<Transaction />, document.getElementById('root'));
registerServiceWorker();
