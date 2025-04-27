// src/AuthPage.js
import { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import "./AuthPage.css";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>MTG Mechanics Master</h1>
        <p>You bring the deck. We'll handle the rules.</p>
        <p>Your smart, easy-to-use assistant for decoding the chaos of Magic: The Gathering.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">{isSignUp ? "Sign Up" : "Login"}</button>
        </form>
        <p>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <span onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? " Login" : " Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
