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
}

export default NewAccountForm;