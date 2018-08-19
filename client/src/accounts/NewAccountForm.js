import React, { Component } from 'react';
import { Modal, Form, Input, Switch } from 'antd';

class NewAccountForm extends Component {

    state = ( {dynamic: false });

    validateAmount = (rule, value, callback) => {
        if (isNaN(value)) {
            callback('Please enter a valid number!');
            return;
        }

        callback();
    }

    onSwitchClick = (currentState) => {
        this.setState({ dynamic: currentState});
        if (currentState) {
            this.props.form.setFieldsValue({ amount: 0 });
        }
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
                        })(<Input type="text" disabled={this.state.dynamic}/>)}
                    </FormItem>
                    <FormItem label = "Notes"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('notes')(<Input type="textarea"/>)}
                    </FormItem>
                    <FormItem label = "Dynamic"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('dynamic', { valuePropName: 'checked'})(<Switch onClick={this.onSwitchClick}/>)}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}

export default NewAccountForm;