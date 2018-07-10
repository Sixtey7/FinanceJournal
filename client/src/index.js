import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import Transaction from './Transactions';

//ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<Transaction />, document.getElementById('root'));
registerServiceWorker();
