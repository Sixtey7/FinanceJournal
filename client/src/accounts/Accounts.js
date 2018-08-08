import React, { Component } from 'react';
import AccountsTable from './AccountsTable';
import './Accounts.css';
import { Form, Button } from 'antd';
import 'antd/dist/antd.css';

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

    render() {
        return (
            <div>`
                <div className = "headerBar">
                    <h1>Accounts</h1>
                    <div>
                        <Button className = "btn btn-default newAccountsButton">Add</Button>
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