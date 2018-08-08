import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

import Main from './main/Main';

ReactDOM.render(<Main />, document.getElementById('root'));

registerServiceWorker();
