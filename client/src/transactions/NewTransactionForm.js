import React, { Component } from 'react';
import { Modal, Form, Input } from 'antd';

class NewTransactionForm extends Component {
    render() {
        const { formvisible, onCancel, onCreate, form } = this.props;
        const { getFieldDecorator } = form;
        const FormItem = Form.Item;
        return (
            <Modal
                visible={formvisible}
                title = "Create a new Transaaction"
                okText = "Create"
                onCancel = {onCancel}
                onOk = { onCreate }
            >

                <Form layout = "vertical">
                    <FormItem label="Title">
                        {getFieldDecorator('title')(<Input type="textarea" />)}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

export default NewTransactionForm;