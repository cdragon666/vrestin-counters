import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import AuthPage from "./AuthPage";
import MechanicsMaster from "./MechanicsMaster";
import ProtectedRoute from "./ProtectedRoute";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./App.css";

function App() {
  const [user] = useAuthState(auth);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/"
            element={
              user ? <MechanicsMaster /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
