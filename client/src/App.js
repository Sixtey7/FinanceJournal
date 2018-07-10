import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {transactions: []}

  componentDidMount() {
    fetch('/transactions')
      .then(res => res.json())
      .then(transactions => this.setState({ transactions }));
  }

  render() {
    return (
      <div className="App">
        <h1>Transactions</h1>
        {this.state.transactions.map(transaction => 
          <div key={transaction.id}>{transaction.data.name}</div>
        )}
      </div>
    );
  }
}

export default App;
