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
        //this.handleDelete = this.handleDelete.bind(this);
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
       // this.props.onRef(undefined);
    }

    renderEditable(cellInfo) {
        return (
            <div 
                contentEditable
                suppressContentEditableWarning
                onBlur={ e => {
                    const account = this.state.accounts[cellInfo.index];
                    if (account['data'][cellInfo.column.id] !== e.target.innerText) {
                        account['data'][cellInfo.column.id] = e.target.innerText;
                        this._updateAccount(account['id'], account['data']);
                    }
                }}
                dangerouslySetInnerHTML={{
                    __html: this.state.accounts[cellInfo.index]['data'][cellInfo.column.id]
                }}
            />
        );
    }
    
    renderAmountEditable(cellInfo) {
        let thisAccount = this.state.accounts[cellInfo.index];
        if (thisAccount.data.dynamic === true) {
            return (
                <div
                    dangerouslySetInnerHTML= { this._determineAmount(cellInfo.column.Header, this.state.accounts[cellInfo.index]['data']['amount'])}
                />
            )
        }
        else {
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

                            if (thisAccount['data']['amount'] !== amount) {
                                thisAccount['data']['amount'] = amount;
                                this._updateAccount(thisAccount['id'], thisAccount['data']);
                            }
                        }
                        else {
                            console.log('cell was empty - may need blank out the value!');
                            //need to make sure that there was a value in the cell that was removed - not that the user clicked on an empty cell then clicked out
                            if ((cellInfo.column.Header === 'Debit' && thisAccount.data.amount < 0) || (cellInfo.column.Header === 'Credit' && thisAccount.data.amount > 0)) {
                                console.log('determined the value needed to be blanked out')
                                thisAccount['data']['amount'] = 0;
                                this._updateAccount(thisAccount['id'], thisAccount['data']);
                            }
                        }

                        this.setState( { accounts: allAccounts });
                    }}
                    dangerouslySetInnerHTML={ this._determineAmount(cellInfo.column.Header, this.state.accounts[cellInfo.index]['data']['amount'])}
                />
            );
        }
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

    addAccountToTable(newAccount) {
        console.log('Got the account: ' + JSON.stringify(newAccount));

        let allAccounts = this.state.accounts;

        allAccounts.push(newAccount);

        allAccounts.sort(this._sortAccounts);

        this.setState({ accounts: allAccounts });
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

    render() {
        return (
            <div>
                <ReactTable
                    data = { this.state.accounts }
                    columns = {[
                        {
                            Header: 'Source',
                            columns: [
                                {
                                    Header: 'Name',
                                    accessor: 'name',
                                    Cell: this.renderEditable
                                }
                            ]
                        },
                        {
                            Header: 'Finances',
                            columns: [
                                {
                                    Header: 'Debit',
                                    accessor: 'data.amount',
                                    Cell: this.renderAmountEditable,
                                    maxWidth: 125
                                },
                                {
                                    Header: 'Credit',
                                    accessor: 'data.amount',
                                    Cell: this.renderAmountEditable,
                                    maxWidth: 125
                                }
                            ]
                        },
                        {
                            Header: 'Details',
                            columns: [
                                {
                                    Header: 'Notes',
                                    accessor: 'notes',
                                    Cell: this.renderEditable
                                }
                            ]
                        }
                    ]}
                    getTrProps = {(state, rowInfo) => {
                        if (rowInfo) {
                            let dynamic = this.state.accounts[rowInfo.index].data.dynamic;
                            if (dynamic) {
                                return { className: 'dynamicAccountRow' }
                            }
                            else {
                                return { className: 'standardAccountRow' }
                            }
                        }
                    }}
                    defaultPageSize={10}
                    minRows={0}
                    showPaginationTop = { false }
                    showPaginationBottom = { false }
                    className="-highlight"
                />
            </div>
        );
    }
}

export default AccountsTable