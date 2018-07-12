import React, { Component } from 'react';
import ReactTable from 'react-table';
import './Transaction.css'
import 'react-table/react-table.css';

class Transaction extends Component {
    state = {transactions: []}

    constructor() {
        super();
        this.renderEditable = this.renderEditable.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.renderAmountEditable = this.renderAmountEditable.bind(this);
    }

    componentDidMount() {
        //get the transaction data from the backend
        fetch('/transactions')
            .then(res => res.json())
            .then(transactions => transactions.sort(function(a, b){ 
                return (new Date(a.data.date)) - (new Date(b.data.date))
            }))
            .then(transactions => this.massageDataset(transactions))
            .then(transactions => this.setState({ transactions }));
    }

    renderEditable(cellInfo) {
        return (
            <div 
                contentEditable
                suppressContentEditableWarning
                onBlur={ e => {
                    console.log('on blur running!');
                    const transaction = this.state.transactions[cellInfo.index];
                    transaction['data'][cellInfo.column.id] = e.target.innerHTML;

                    console.log('Set the property to: ' + JSON.stringify(transaction));

                    this._updateTransaction(transaction['id'], transaction['data']);

                    //TODO if a debit or credit or date amount changes, need to do stuff
                }}
                dangerouslySetInnerHTML={{
                    __html: this.state.transactions[cellInfo.index]['data'][cellInfo.column.id]
                }}
            />
        );
    }

    renderAmountEditable(cellInfo) {
        //TODO Gotta handle the case where the debit or credit cells are edited, those need special attention
        return (
            <div
                contentEditable
                suppressContentEditableWarning
                onBlur={ e => {
                    console.log('running on blur in amount!');
                    let allTrans = this.state.transactions;
                    const transaction = allTrans[cellInfo.index];
                    if (e.target.innerHTML) {
                        console.log('This was in the cell -' + e.target.innerHTML + '-');
                        //need to strip off the leading $
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
                            amount = value
                        }


                        transaction['data']['amount'] = amount;
                        this._updateTransaction(transaction['id'], transaction['data']);
                    }
                    else {
                        console.log('cell was empty - blank out the value');
                        transaction['data']['amount'] = 0;
                        this._updateTransaction(transaction['id'], transaction['data']);
                    }

                    this.massageDataset(allTrans);
                    this.setState( { transactions: allTrans });
                }}
                dangerouslySetInnerHTML= {this._determineAmount(cellInfo.column.Header, this.state.transactions[cellInfo.index]['data']['amount'])}
            />
        );
    }

    _determineAmount(cellName, value) {
        console.log('running determineAmount for cellName ' + cellName + ' and value: ' + value);
        if ((cellName === 'Credit' && value > 0) || (cellName === 'Debit' && value < 0)) {
            return { __html: '$' + Math.abs(value).toFixed(2)}
        }
        else {
            return { __html: ''}
        }
    }

    handleTypeChange(event) {
        console.log('Transaction: ' + this.state.transactions[event.target.id]['data']['name'] + ' was change to: ' + event.target.value);

        //copy out the array, modify it, and then reset the state - this will tell react to update the display
        let allTrans = this.state.transactions;
        allTrans[event.target.id]['data']['type'] = event.target.value;
        this._updateTransaction(allTrans[event.target.id]['id'], allTrans[event.target.id]['data']);

        this.setState( { transactions: allTrans });
    }

    massageDataset(dataset) {

        let currentBalance = 0;
        for (let thisTransId in dataset) {
            let thisTrans = dataset[thisTransId];
            currentBalance = currentBalance += thisTrans.data.amount;
            thisTrans['total'] = currentBalance;
        }


        return dataset;
    }

    async _updateTransaction(id, data) {
        console.log('updating id: ' + id + ' with value: ' + JSON.stringify(data));
            fetch('/transactions/' + id, {
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
                    data= { this.state.transactions }
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
                                },
                                {
                                    Header: 'Total',
                                    accessor: 'total',
                                    Cell: row => (
                                        <span>
                                            {
                                                '$' + row.value.toFixed(2)
                                            }
                                        </span>
                                    ),
                                    maxWidth: 150
                                }
                            ]
                        },
                        {
                            Header: 'Details',
                            columns: [
                                {
                                    Header: 'Date',
                                    accessor: 'data.date',
                                    Cell: row => (
                                        <span>
                                            { (new Date(row.value)).toLocaleDateString() }
                                        </span>
                                    ),
                                    maxWidth: 125
                                },
                                {
                                    Header: 'Notes',
                                    accessor: 'notes',
                                    Cell: this.renderEditable
                                },
                                {
                                    Header: 'Type',
                                    accessor: 'data.type',
                                    Cell: row => (
                                        <select id = { row.index } value = { row.value || '' } onChange = {this.handleTypeChange}  >
                                            <option value=""></option>
                                            <option value="PLANNED">PLANNED</option>
                                            <option value="ESTIMATE">ESTIMATE</option>
                                            <option value="PENDING">PENDING</option>
                                            <option value="CONFIRMED">CONFIRMED</option>
                                        </select>
                                    )
                                }
                            ]
                        }

                    ]}
                    getTrProps={(state, rowInfo) => {
                        if (rowInfo) {
                            //console.log(rowInfo);
                            let type = this.state.transactions[rowInfo.index].data.type;
                            //NOTE: to remove the padded look, add this to the return statement:
                                //, style: { border: '1px solid black', margin: '0px'}
                            if (type === 'CONFIRMED') {
                                return { className: 'confirmedTransactionRow'}
                            }
                            else if (type === 'PENDING') {
                                return { className: 'pendingTransactionRow'}
                            }
                            else if (type === 'PLANNED') {
                                return { className: 'plannedTransactionRow'}
                            }
                            else if (type === 'ESTIMATE') {
                                return { className: 'estimateTransactionRow'}
                            }
                        }
                        return { };
                    }}
                    defaultPageSize={10}
                    className="-highlight"
                />
            </div>
        );
    }
}

export default Transaction;