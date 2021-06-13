import React from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  BrowserRouter as Router,
  useLocation,
  Switch,
  Route,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
        {/* <Route path="/lasheras" exact component={Lasherasval} />
            <Route path="/maipu" exact component={Maipuval} />
            <Route path="/finproceso" exact component={Finproceso} />
            <Route path="/confirmado" exact component={Confirmacion} />
            <Route path="/error" exact component={Generalerror} />
            <Route component={Notfound} /> */}
      </Switch>
    </Router>
  );
}

export default App;
