import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import TransactionsTable from './TransactionsTable';
import './Transactions.css';

class Transactions extends Component {
    
    render() {
        return (
            <div>
                <div class="headerBar">
                    <h1>Transactions</h1>
                </div>

                <div class="mainPanel">
                    <TransactionsTable/>
                </div>
            </div>
        );
    }
}

export default Transactions;