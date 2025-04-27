import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState } from "react";
import AuthPage from "./AuthPage";
import MechanicsMaster from "./MechanicsMaster";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AuthPage setUser={setUser} />} />
          <Route
            path="/mechanics-master"
            element={
              <ProtectedRoute user={user}>
                <MechanicsMaster />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
