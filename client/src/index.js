import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import Transaction from './Transactions';

ReactDOM.render(<Transaction />, document.getElementById('root'));
registerServiceWorker();
