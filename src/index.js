import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'antd/dist/antd.css';
import './index.css';
import App from './App';
import store from './store';

const Main = () => (
    <Provider store={store}>
        <App />
    </Provider>
);

ReactDOM.render(<Main />, document.getElementById('root'));

