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
    }

    componentDidMount() {
        //get the transaction data from the backend
        fetch('/transactions')
            .then(res => res.json())
            .then(transactions => transactions.sort(function(a, b){ 
                return (new Date(a.data.date)) - (new Date(b.data.date))
            }))
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
    }

    handleTypeChange(event) {
        console.log('Transaction: ' + this.state.transactions[event.target.id]['data']['name'] + ' was change to: ' + event.target.value);
        this.state.transactions[event.target.id]['data']['type'] = event.target.value;
        this._updateTransaction(this.state.transactions[event.target.id]['id'], this.state.transactions[event.target.id]['data']);

        //TODO: This needs to force the table to update - currenetly it doesn't until a hard refresh
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
                                    Cell: row => (
                                        <span>
                                            {
                                                row.value < 0 ? '$' + Math.abs(row.value).toFixed(2) : ''
                                            }
                                        </span>
                                    ),
                                    maxWidth: 125
                                },
                                {
                                    Header: 'Credit',
                                    accessor: 'data.amount',
                                    Cell: row => (
                                        <span>
                                            {
                                                row.value > 0 ? '$' + row.value.toFixed(2) : ''
                                            }
                                        </span>
                                    ),
                                    maxWidth: 125
                                },
                                {
                                    Header: 'Total',
                                    accessor: 'total',
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
                                            <option value="PLANNED">PLANNED</option>
                                            <option value="ESTIMATE">ESTIMATE</option>
                                            <option value="PENDING">PENDING</option>
                                            <option value="CONFIRMED">CONFIRMED</option>
                                            <option value=""></option>
                                        </select>
                                    )
                                }
                            ]
                        }

                    ]}
                    getTrProps={(state, rowInfo) => {
                        if (rowInfo) {
                            console.log(rowInfo);
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