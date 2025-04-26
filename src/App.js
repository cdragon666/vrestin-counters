import React, { useState } from "react";
import "./App.css";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import CounterCalculator from "./CounterCalculator";

function App() {
  const [user, setUser] = useState(null);

  auth.onAuthStateChanged((user) => {
    setUser(user);
  });

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="App">
      {user ? (
        <>
          <header>
            <h1>MTG Mechanics Master</h1>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </header>
          <main>
            <CounterCalculator />
          </main>
        </>
      ) : (
        <div className="auth-message">
          <h2>Welcome to MTG Mechanics Master</h2>
          <p>Please login or sign up to continue.</p>
        </div>
      )}
    </div>
  );
}

export default App;
