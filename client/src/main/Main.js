import React, {Component} from 'react';
//import ReactDOM from 'react-dom';
import './Main.css';
import { Button } from 'antd';
import 'antd/dist/antd.css';

import Transaction from '../transactions/Transactions';
import Accounts from '../accounts/Accounts';

class Main extends Component {

    state = { visible: 'transactions' };

    toggleTransactions = () => {
        this.setState({ visible: 'transactions' });
    };

    toggleAccounts = () => {
        this.setState({ visible: 'accounts' });
    };

    render() {
        var content;
        if (this.state.visible === 'transactions') {
            content = 
                <div className = "">
                    <Transaction />
                </div>;
        }
        else if (this.state.visible === 'accounts') {
            content = 
                <div className = "">
                    <Accounts />
                </div>;
        }
        else {
            console.error('INVALID VISIBLE STATE: '  + this.state.visible);
        }
        return(
            <div>
                <div className = "topHeaderBar">
                    <Button className = "btn btn-default" onClick = {this.toggleTransactions}>Transactions</Button>
                    <Button className = "btn btn-default" onClick = { this.toggleAccounts }>Accounts</Button>
                </div>

                { content }
            </div>
        );
    };
};

export default Main;