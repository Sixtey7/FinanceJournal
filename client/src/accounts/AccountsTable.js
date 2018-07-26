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




    _sortAccounts(accountA, accountB) {
        return accountA.id - accountB.id;
    }
}