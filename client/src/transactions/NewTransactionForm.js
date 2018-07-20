import React, { Component } from 'react';
import { Modal, Form, Input, DatePicker } from 'antd';

class NewTransactionForm extends Component {
    constructor(props) {
        super(props);
    
    this.state = {
        amount: 0
    };
    }
    handleAmountChange = (amount) => {
        const number = parseInt(amount.target.value || 0, 10);
        console.log('number was: ' + number);
        if (isNaN(number)) {
            console.log('returning!');
            this.props.form.setFieldsValue({amount: 'peaches'});
            return;
        }
        else {
            this.setState({number});
        }
    }
    render() {
        const { formvisible, onCancel, onCreate, form } = this.props;
        const { getFieldDecorator } = this.props.form;
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

        const state = this.state;
            
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
                        {getFieldDecorator('title')(<Input  placeholder="title"/>)}
                    </FormItem>
                    <FormItem label="Amount"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('amount')(<Input 
                            type="text"
                            onChange={this.handleAmountChange}/>)}
                    </FormItem>
                    <FormItem label="Trans Date"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('date-picker', config)(
                            <DatePicker />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

export default NewTransactionForm;