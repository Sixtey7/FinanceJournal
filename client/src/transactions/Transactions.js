import React, { Component } from 'react';
//import ReactDOM from 'react-dom';
import TransactionsTable from './TransactionsTable';
import './Transactions.css';
import NewTransactionForm from './NewTransactionForm';
import { Form, Button } from 'antd';
import 'antd/dist/antd.css';

class Transactions extends Component {

    constructor(props) {
        super();
        this.state = 
        {
            formvisible: false
        }
    }

    showModal = () => {
        this.setState({
            formvisible: true
        });
    }

    handleCreate = async () =>  {
        const form = this.form;

        let values = form.getForm().getFieldsValue();
        console.log('Got the values: ' + JSON.stringify(values));
        //perform some basic validation
        if (isNaN(values.amount)) {
            console.error('user provided an amount that is not a number!');
            return;
        }
        if (!values.title || !values.type || !values.date) {
            console.error('user didn\'t fill out all the required values!');
            return;
        }

        //build the new transaction
        let data = {
            name: values.title,
            date: new Date(values.date).toJSON(),
            amount: parseInt(values.amount),
            type: values.type.toUpperCase(),
            notes: values.notes
        }
        
        console.log('about to fetch');
        //send the data to the backend
        let result;
        fetch('/transactions/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(res => {
                let newTrans = {
                    'id': parseInt(res),
                    'data': data
                }
                this.transTable.addTransToTable(newTrans);
            });
        ;

        form.resetFields();
        this.setState({ formvisible: false });
    }

    handleCancel = ()  => {
        this.form.resetFields();
        this.setState({ formvisible: false});
    }

    saveFormRef = (form) => {
        this.form = form;
    }

    render() {
        const NewTransForm = Form.create()(NewTransactionForm);

        return (
            <div>
                <div className="headerBar">
                    <h1>Transactions</h1>
                    <div>
                        <Button className="btn btn-default newTransButton" onClick={this.showModal}>Add</Button>
                        <NewTransForm
                            formvisible = {this.state.formvisible}
                            onCancel = {this.handleCancel}
                            onCreate = {this.handleCreate}
                            ref = {this.saveFormRef}
                        />
                    </div>
                </div>

                <div className="mainPanel">
                    <TransactionsTable onRef={ref => (this.transTable = ref)}/>
                </div>
            </div>
        );
    }
}

export default Transactions;