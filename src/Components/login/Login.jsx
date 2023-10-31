import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/authContext';
import './Login.css'
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaResponse, setCaptchaResponse] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL;
  const CAPTCHAURL = process.env.REACT_APP_API_CAPTCHA_URL;


  const fetchCaptcha = async () => {
    try {
      const response = await fetch(`${apiUrl}/get-captcha/`);
      const data = await response.json();
      setCaptchaKey(data.captcha_key);
      setCaptchaImage(`${CAPTCHAURL}${data.captcha_image}`);
    } catch (error) {
      console.error("Error fetching captcha:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Check CAPTCHA response
      if (!captchaResponse) {
        // Handle CAPTCHA not filled error
        return;
      }
  
      const payload = {
        username,
        password,
        captcha_key: captchaKey,
        captcha_response: captchaResponse,
      };
      
  

      const loginSuccess = await loginUser(payload);
      if (loginSuccess) {
        navigate("/dashboard");
      } else {
        // Handle login error (e.g., display an error message)
      }
    } catch (error) {
      // Handle unexpected error
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="login-title">Login</h2>

        <TextField
          label="Username"
          variant="outlined"
          name="username"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          name="password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <img src={captchaImage} alt="CAPTCHA" onClick={fetchCaptcha} />
        <TextField
          label="Enter CAPTCHA"
          variant="outlined"
          value={captchaResponse}
          onChange={(e) => setCaptchaResponse(e.target.value)}
          className="login-input"
        />

        <Button variant="contained" type="submit" className="login-submit">
          Login
        </Button>
      </form>
    </div>
  );
}

export default LoginPage;
