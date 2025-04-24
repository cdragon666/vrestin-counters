import { useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1a1a1a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: "400px", width: "100%", backgroundColor: "#2e2e2e", padding: "2rem", borderRadius: "12px", textAlign: "center", boxShadow: "0 0 10px rgba(0,0,0,0.5)" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>MTG Mechanics Master</h1>
        <p style={{ fontSize: "0.95rem", color: "#ccc", marginBottom: "1.5rem" }}>
          A smart companion to help you master +1/+1 counters, triggers, replacement effects, and more.
        </p>
        <h2 style={{ marginBottom: "1rem" }}>{isLogin ? "Login" : "Create Account"}</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem", borderRadius: "6px", border: "none" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem", borderRadius: "6px", border: "none" }}
        />
        <button
          onClick={handleAuth}
          style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem", backgroundColor: "#4caf50", color: "white", fontWeight: "bold", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
        <p style={{ color: "red", minHeight: "1.5rem" }}>{error}</p>
        <p>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: "none", border: "none", color: "#00eaff", cursor: "pointer", fontWeight: "bold" }}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
