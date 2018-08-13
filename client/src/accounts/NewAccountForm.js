import React, { Component } from 'react';
import { Modal, Form, Input, Select } from 'antd';

const Option = Select.Option;

class NewAccountForm extends Component {
    
    validateAmount = (rule, value, callback) => {
        if (isNaN(value)) {
            callback('Please enter a valid number!');
            return;
        }

        callback();
    }

    render() {
        const { formvisible, onCancel, onCreate, from } = this.props;
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
            }
        };

        return (
            <Modal
                visible = { formvisible }
                title = "Create a new Account"
                okText = "Create"
                onCancel = { onCancel }
                onOk =  { onCreate }
            >
                <Form>
                    <FormItem label = "Title"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('title', {
                            rules: [{ required: true, message: 'Please enter a title!', whitespace: true}]
                        })(<Input placeholder="title"/>)}
                    </FormItem>

                    <FormItem label = "Amount"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('amount', {
                            rules: [{required: true, message: 'Please enter an amount!', whitespace: true}, { validator: this.validateAmount}]
                        })(<Input type="text"/>)}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}

export default NewAccountForm;