import React, { Component } from 'react';
import ReactTable from 'react-table';
import './Transactions.css'
import 'react-table/react-table.css';

class Transaction extends Component {
    state = {transactions: []}

    constructor() {
        super();
        this.renderEditable = this.renderEditable.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.renderAmountEditable = this.renderAmountEditable.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
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

            //TODO: set the default page here and see if that works as expected 
            //                    page = { Math.floor(this.state.transactions.length / 75) }

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

    /**
     * Helper method that is used to determine whether or not the amount should be put into a debit/credit cell
     * @param {*string} cellName - the name of the cell that is being updated
     * @param {*float} value - the value that could be put into the cell 
     */
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

    handleDelete(event) {
        console.log('delete selected for ' + this.state.transactions[event.target.id]['data']['name']);

        let allTrans = this.state.transactions;

        //tell the backend about the deletion
        this._deleteTransaction(allTrans[event.target.id]['id']);

        //update the state to remove the item
        delete allTrans[event.target.id];

        this.massageDataset(allTrans);
        this.setState({ transactions: allTrans });
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

    async _deleteTransaction(id) {
        console.log('deleting id: ' + id);
        fetch('/transactions/' + id, {
            method: 'DELETE',
        });

        //TODO: should check the result and make sure a 1 was returned
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
                                        <span class = {row.value < 2500 ? 'bad-balance' : '' }>
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
                                            <option value="FUTURE">FUTURE</option>
                                            <option value="PLANNED">PLANNED</option>
                                            <option value="ESTIMATE">ESTIMATE</option>
                                            <option value="PENDING">PENDING</option>
                                            <option value="CONFIRMED">CONFIRMED</option>
                                        </select>
                                    ),
                                    maxWidth: 125
                                },
                                {
                                    Header: 'D',
                                    id: 'deleteRow',
                                    Cell: row => (
                                        <div>
                                            <button onClick={this.handleDelete} id = { row.index }>D</button>
                                        </div>
                                    ),
                                    maxWidth: 40
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
                                return { className: 'confirmedTransactionRow' }
                            }
                            else if (type === 'PENDING') {
                                return { className: 'pendingTransactionRow' }
                            }
                            else if (type === 'PLANNED') {
                                return { className: 'plannedTransactionRow' }
                            }
                            else if (type === 'ESTIMATE') {
                                return { className: 'estimateTransactionRow' }
                            }
                            else if (type === 'FUTURE') {
                                return { className: 'futureTransactionRow' }
                            }
                        }
                        return { };
                    }}
                    defaultPageSize={75}
                    minRows={0}
                    showPaginationTop = { true }
                    pageSizeOptions = { [5, 10, 20, 25, 50, 75, 100, 1000] }
                    className="-highlight"
                />
            </div>
        );
    }
}

export default Transaction;