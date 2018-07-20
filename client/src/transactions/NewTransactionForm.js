import React, { Component } from 'react';
import { Modal, Form, Input, DatePicker } from 'antd';

class NewTransactionForm extends Component {
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
                        {getFieldDecorator('title')(<Input  placeholder="title"/>)}
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