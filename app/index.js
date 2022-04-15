import React, { Suspense } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import App from './containers/App';
import Loading from './components/Loading';
import './styles/index.styl';

const root = document.createElement('div');
root.setAttribute('id', 'app');

render(
  <Router>
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route render={(props) => <App {...props} />} />
      </Switch>
    </Suspense>
  </Router>,
  root
);

document.body.insertBefore(root, document.body.firstElementChild);
