import React, { Component } from 'react';
import { Modal, Form, Input, DatePicker, Select } from 'antd';

const Option = Select.Option;

class NewTransactionForm extends Component {
    state = {accounts: []}

    
    validateAmount = (rule, value, callback) => {
        if (isNaN(value)) {
            callback('Please enter a valid number!');
            return;
        }
        
        callback();
    }

    componentWillMount() {
        //need to get the list of accounts to populate the dropdown
        fetch('/accounts')
            .then(res => res.json())
            .then(accounts => this.setState({accounts}))
            .then(accounts => console.log(JSON.stringify(this.allAccounts)));

    }

    render() {
        const { formvisible, onCancel, onCreate, form } = this.props;
        const { getFieldDecorator } = form;
        const FormItem = Form.Item;

        const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
              },
        };
        
        const config = {
            rules: [{ type: 'object', required: true, message: 'Please select time!' }],
        };

        return (
            <Modal
                visible={formvisible}
                title = "Create a new Transaaction"
                okText = "Create"
                onCancel = {onCancel}
                onOk = { onCreate }
            >

                <Form>
                    <FormItem label="Title"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('title', {
                            rules: [{ required: true, message: 'Please enter a title!', whitespace: true }]
                        })(<Input  placeholder="title"/>)}
                    </FormItem>
                    <FormItem label="Amount"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('amount', {
                            rules: [{required: true, message: 'Please enter an amount!', whitespace: true}, { validator: this.validateAmount}]
                        })(<Input type="text"/>)}
                    </FormItem>
                    <FormItem label="Type"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('type', {
                            initialValue: "future"
                        })(<Select>
                            <Option value="future">Future</Option>
                            <Option value="planned">Planned</Option>
                            <Option value="estimate">Estimate</Option>
                            <Option value="pending">Pending</Option>
                            <Option value="confirmed">Confirmed</Option>
                        </Select>)}
                    </FormItem>
                    <FormItem label="Trans Date"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('date', config)(
                            <DatePicker />
                        )}
                    </FormItem>
                    <FormItem label="Notes"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('notes')(<Input type="textarea"/>)}
                    </FormItem>
                    <FormItem label="Account"
                        {...formItemLayout}
                    >
                    {getFieldDecorator('account', {
                        rules: [{required: true, message: 'Please select an account to associate the transaaction with!', type: 'number', whitespace: true}]
                    })(<Select>
                        {this.state.accounts.map(function(account) {
                            return <Option value={account.id} key={account.id}>{account.data.name}</Option>
                        })}
                        </Select>)}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

export default NewTransactionForm;