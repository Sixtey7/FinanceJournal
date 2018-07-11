import React, { Component } from 'react';
import ReactTable from 'react-table';
import './Transaction.css'
import 'react-table/react-table.css';

class Transaction extends Component {
    state = {transactions: []}

    constructor() {
        super();
        this.renderEditable = this.renderEditable.bind(this);
    }

    componentDidMount() {
        //get the transaction data from the backend
        fetch('/transactions')
            .then(res => res.json())
            .then(transactions => transactions.sort(function(a, b){ 
                return a.id - b.id
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
                    //TODO make a post request to the backend to make the update

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
                        }
                        return { };
                    }}
                    defaultPageSize={10}
                    className=""
                />
            </div>
        );
    }
}

export default Transaction;