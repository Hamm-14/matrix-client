import { useState, useEffect } from "react";
import { MatrixProvider } from "./context/MatrixContext";
import { Login } from "./components/Login";

export type Creds = {
  userId: string;
  accessToken: string;
  baseUrl: string;
  deviceId: string;
};

const App = () => {
  const [creds, setCreds] = useState<Creds | null>(null);

  useEffect(() => {
    // Check if we already have a session saved
    const saved = localStorage.getItem("matrix_creds");
    if (saved) {
      setCreds(JSON.parse(saved));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("matrix_creds");
    setCreds(null);
  };

  if (!creds) {
    return <Login onLoginSuccess={(newCreds) => setCreds(newCreds)} />;
  }

  return (
    <MatrixProvider credentials={creds}>
      <div className="app-layout">
        <button onClick={logout}>Logout</button>
        {/* Your Chat Components Go Here */}
        <h1>Welcome to your Matrix Client</h1>
      </div>
    </MatrixProvider>
  );
};

export default App;
