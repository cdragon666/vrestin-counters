import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./AuthPage";
import MechanicsMaster from "./MechanicsMaster";
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <MechanicsMaster />
            </ProtectedRoute>
          }
        />
        {/* Redirect any unknown route to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
