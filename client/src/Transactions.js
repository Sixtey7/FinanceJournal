import React, { Component } from 'react';

class Transaction extends Component {
    state = {transactions: []}

    componentDidMount() {
        //get the transaction data from the backend
        fetch('/transactions')
            .then(res => res.json())
            .then(transactions => this.setState({ transactions }));
    }

    render() {
        return (
            <div className="TransactionTable">
                <h1>Transactions</h1>
                <table>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.transactions.map(transaction => 
                        <tr>
                            <td>{transaction.data.name}</td>
                            <td>{transaction.data.date}</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Transaction;