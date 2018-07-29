import React, { Component } from 'react';
import ReactTable from 'react-table';
import './AccountsTable.css';
import 'react-table/react-table.css';

class AccountsTable extends Component {
    state = { accounts: [] };

    constructor() {
        super();
        this.renderEditable = this.renderEditable.bind(this);
        this.renderAmountEditable = this.renderAmountEditable.bind(this);
        this.handleDelete = thi.handleDelete.bind(this);
    }

    componentDidMount() {
        //get the accounts from the backend
        fetch('/accounts')
            .then(res => res.json())
            .then(accounts => accounts.sort(this._sortAccounts))
            .then(accounts => this.setState( { accounts }));

            this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    renderEditable(cellInfo) {
        return (
            <div 
                contentEditable
                suppressContentEditableWarning
                onBlur={ e => {
                    const account = this.state.accounts[cellInfo.index];
                    account['data'][cellInfo.column.id] = e.target.innerHTML;

                    this._updateAccount(account['id'], account['data'])''
                }}
                dangerouslySetInnerHTML={{
                    __html: this.state.accounts[cellInfo.index]['data'][cellInfo.column.id]
                }}
            />
        );
    }
    
    renderAmountEditable(cellInfo) {
        return (
            <div
                contentEditable
                suppressContentEditableWarning
                onBlur={ e => {
                    let allAccounts = this.state.accounts;
                    const thisAccount = allAccounts[cellInfo.index];
                    if (e.target.innerHTML) {
                        //may need to strip off the leading $
                        let value = 0;
                        if (e.target.innerHTML.charAt(0) === '$') {
                            value = parseFloat(e.target.innerHTML.substr(1));
                        }
                        else {
                            value = parseFloat(e.target.innerHTML);
                        }

                        //there is data in the cell, we need to update amount
                        let amount = 0;
                        if (cellInfo.column.Header === 'Debit') {
                            amount = -1 * value;
                        }
                        else {
                            amount = value;
                        }

                        thisAccount['data']['amount'] = amount;
                        this._updateAccount(thisAccount['id'], thisAccount['data']);
                    }
                    else {
                        console.log('cell was empty - blank out the value!');
                        thisAccount['data']['amount'] = 0;
                        this._updateAccount(thisAccount['id'], thisAccount['data']);
                    }

                    this.setState( { accounts: allAccounts });
                }}
                dangerouslySetInnerHTML={ this._determineAmount(cellInfo.column.Header, this.state.accounts[cellInfo.index]['data']['amount'])}
            />
        );
    }



    _sortAccounts(accountA, accountB) {
        return accountA.id - accountB.id;
    }

    //TODO: this could probably be pulled out to be generic, since its exactly the same between this and transtable
    _determineAmount(cellName, value) {
        if ((cellName === 'Credit' && value > 0) || (cellName === 'Debit' && value < 0)) {
            return { __html: '$' + Math.abs(value).toFixed(2)}
        }
        else {
            return { __html: '' }
        }
    }

    async _updateAccount(id, data) {
        fetch('/accounts/' + id, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }
}