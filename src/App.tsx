import { useState, useEffect } from "react";
import { MatrixProvider } from "./context/MatrixContext";
import { Login } from "./components/Login";
import AuthenticatedLayout from "./components/AuthenticatedLayout";

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

  return (
    <div className="min-h-screen w-full flex flex-col bg-linear-to-tr from-blue-50 via-indigo-50 to-rose-50 font-sans text-slate-900 transition-colors duration-500">
      {!creds ? (
        <Login onLoginSuccess={(newCreds) => setCreds(newCreds)} />
      ) : (
        <MatrixProvider credentials={creds}>
          <AuthenticatedLayout logout={logout} />
        </MatrixProvider>
      )}
    </div>
  );
};

export default App;
