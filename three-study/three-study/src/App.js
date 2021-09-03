import React, { Suspense } from 'react';
import './App.css';
import { Route, Switch } from 'react-router-dom';
import { RouterList } from './page/RouterConfig.js';

function App() {
  return (
    <Suspense fallback={<div>等着吧你...</div>}>
      <Switch>
        {
          RouterList.map((s, i) => {
            let PageModule = s.component;
            return <Route key={'router' + i}
              path={s.pathname}
              exact
              render={(props) => <PageModule {...props} />}
            />
          })
        }
      </Switch>
    </Suspense>
  );
}

export default App;
