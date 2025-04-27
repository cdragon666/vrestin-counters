// src/ProtectedRoute.js
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import AuthPage from "./AuthPage";
import App from "./App";

export default function ProtectedRoute() {
  const [user, setUser] = useState(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  if (user === undefined) return <div>Loading...</div>;
  return user ? <App /> : <AuthPage />;
}
