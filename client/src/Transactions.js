import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

class Transaction extends Component {
    state = {transactions: []}

    componentDidMount() {
        //get the transaction data from the backend
        fetch('/transactions')
            .then(res => res.json())
            .then(transactions => transactions.sort(function(a, b){ 
                return a.id - b.id
            }))
            .then(transactions => this.setState({ transactions }));
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
                                    accessor: 'data.name'
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
                                    accessor: 'data.notes'
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