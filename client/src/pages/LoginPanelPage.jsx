import React, { useState } from "react";

export default function LoginPanelPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Oturum bilgilerini dahil eder
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setMessage("Giriş başarılı!");
        console.log("Kullanıcı Bilgisi:", data.user);
        window.location.href = "http://localhost:5173/index"; // Başarılı giriş sonrası yönlendirme
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Hata:", error);
      setMessage("Bir hata oluştu.");
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      id="loginPageCSS"
      style={{ marginTop: "350px" }}
    >
      <div className="text-center w-50">
        <h1 style={{ userSelect: "none" }}>Login Page</h1>
        <div className="login-form mt-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <input
                placeholder="Username..."
                type="text"
                className="form-control fw-semibold"
                id="exampleInputUsername1"
                aria-describedby="usernameHelp"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <input
                placeholder="Password..."
                type="password"
                className="form-control fw-semibold"
                id="exampleInputPassword1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-success fw-medium w-100">
              Login
            </button>
          </form>
          {message && <p className="mt-3 text-danger">{message}</p>}
        </div>
      </div>
    </div>
  );
}
