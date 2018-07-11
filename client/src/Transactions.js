import React, { Component } from 'react';
import ReactTable from 'react-table';
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
                style={{ backgroundColor: '#fafafa' }}
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
                                                row.value < 0 ? Math.abs(row.value) : ''
                                            }
                                        </span>
                                    )
                                },
                                {
                                    Header: 'Credit',
                                    accessor: 'data.amount',
                                    Cell: row => (
                                        <span>
                                            {
                                                row.value > 0 ? row.value : ''
                                            }
                                        </span>
                                    )
                                },
                                {
                                    Header: 'Total',
                                    accessor: 'total'
                                }
                            ]
                        },
                        {
                            Header: 'Details',
                            columns: [
                                {
                                    Header: 'Date',
                                    accessor: 'data.date'
                                },
                                {
                                    Header: 'Type',
                                    accessor: 'data.type'
                                },
                                {
                                    Header: 'Notes',
                                    accessor: 'notes',
                                    Cell: this.renderEditable
                                }
                            ]
                        }

                    ]}
                    defaultPageSize={10}
                    className="-striped -highlight"
                />
            </div>
        );
    }
}

export default Transaction;