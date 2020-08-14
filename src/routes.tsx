import {Router, BrowserRouter, Route} from 'react-router-dom';
import React from 'react';

import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';
import Points from './pages/Points';
import Detail from './pages/Detail';

const Routes = () => {
    return (
        <BrowserRouter>
            <Route component={Home} path="/" exact />
            <Route component={CreatePoint} path="/create-point" />
            <Route component={CreatePoint} path="/update-point/:id" />
            <Route component={Points} path="/list-point" />
            <Route component={Detail} path="/points-item/:id" />


        </BrowserRouter>
    );  

}

export default Routes;
