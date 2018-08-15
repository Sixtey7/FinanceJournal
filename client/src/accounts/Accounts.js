import React, { Component } from 'react';
import AccountsTable from './AccountsTable';
import './Accounts.css';
import { Form, Button } from 'antd';
import 'antd/dist/antd.css';
import NewAccountForm from './NewAccountForm';

class Accounts extends Component {
    constructor(props) {
        super();
        this.state = {
            formvisible: false
        };
    };

    showModal = () => {
        this.setState({
            formvisible: true
        });
    }

    handleCreate = async () => {
        const form = this.form;

        let values = form.getForm().getFieldsValue();
        console.log('Got the values: ' + JSON.stringify(values));

        //TODO: Need to confirm if this code is reachable
        if (isNaN(values.amount)) {
            console.error('user provided an amount that is not a number!');
            return;
        }

        //TODO: Need to confirm if this code is reachable
        if (!values.title) {
            console.error('user didn\'t fill out all of the required values!');
            return;
        }

        //build the new account 
        let account = {
            name: values.title,
            amount: parseInt(values.amount, 10),
            notes: values.notes,
            dynamic: values.dynamic
        };

        console.log('about to call the backend to add the account');
        fetch('/accounts/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(account)
        })
        .then(res => res.json())
        .then(res => {
            let newAccount = {
                'id': parseInt(res, 10),
                'data': account
            }
            this.accountsTable.addAccountToTable(newAccount);
        });

        form.resetFields();
        this.setState({ formvisible: false });
    }

    handleCancel = () => {
        this.form.resetFields();
        this.setState({ formvisible: false });
    }

    saveFormRef = (form) => {
        this.form  = form;
    }

    render() {
        const NewAcctForm = Form.create()(NewAccountForm)
        return (
            <div>
                <div className = "headerBar">
                    <h1>Accounts</h1>
                    <div>
                        <Button className = "btn btn-default newAccountsButton" onClick={this.showModal}>Add</Button>
                        <NewAcctForm
                            formvisible = { this.state.formvisible }
                            onCancel = { this.handleCancel }
                            onCreate = { this.handleCreate }
                            ref = { this.saveFormRef }
                        />
                    </div>
                </div>

                <div className = "mainPanel">
                    <AccountsTable onRef ={ref => (this.accountsTable = ref)}/>
                </div>
            </div>
        );
        
    }
};


export default Accounts;