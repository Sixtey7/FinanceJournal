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
                dangerouslySetInnerHTML={ this._determineAmmount(cellInfo.column.Header, this.state.accounts[cellInfo.index]['data']['amount'])}
            />
        );
    }



    _sortAccounts(accountA, accountB) {
        return accountA.id - accountB.id;
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