import React, { Component } from 'react';
import ReactDOM from 'react-dom';
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

    handleCreate = () => {
        const form = this.form;
        //do validation here

        form.resetFields();
        this.setState({ formvisible: false });
    }

    handleCancel = ()  => {
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
                    <TransactionsTable/>
                </div>
            </div>
        );
    }
}

export default Transactions;