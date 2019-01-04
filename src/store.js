import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga'

import saga from './saga';
import reducer from './reducer';

const sagaMiddleware = createSagaMiddleware()
const store = createStore(
  reducer,
  applyMiddleware(sagaMiddleware)
);
sagaMiddleware.run(saga);

export default store;