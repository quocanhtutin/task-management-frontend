import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import axiosClient from '../../utils/axiosConfig';
import { StoreContext } from '../../context/StoreContext.jsx'
import './Login.css';

const Login = () => {
<<<<<<< Updated upstream
  const [email, setEmail] = useState('');
=======
  const { setAccessToken, setRefreshToken, setName, setEmail } = useContext(StoreContext);
  const [emailInput, setEmailInput] = useState('');
>>>>>>> Stashed changes
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const performLogin = async (payload) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post('/Auth/Login', payload);
<<<<<<< Updated upstream
      
      const { accessToken, refreshToken, provider } = response.data.value || response.data; 

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('provider', provider || payload.type);
        navigate('/main/boards'); 
      } else {
        alert('Đăng nhập thành công nhưng không tìm thấy Token!');
=======
      const data = response.data.value || response.data;

      if (data.accessToken) {
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);

        localStorage.setItem('provider', data.provider || payload.type);

        const returnUrl = localStorage.getItem("returnUrl");
        if (returnUrl) {
          localStorage.removeItem("returnUrl");
          navigate(returnUrl, { replace: true });
        } else {
          navigate('/main/boards', { replace: true });
        }
>>>>>>> Stashed changes
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Đăng nhập thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalLogin = (e) => {
    e.preventDefault();
<<<<<<< Updated upstream
    const payload = {
        type: "Local",
        email: email,
        password: password,
        token: ""
    };
    performLogin(payload);
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
        const payload = {
            type: "Google", 
            token: credentialResponse.credential 
        };
        performLogin(payload);
    } catch (error) {
        console.error("Lỗi giải mã:", error);
    }
  };

  const handleFacebookResponse = (response) => {
    if (response.accessToken) {
        const payload = {
            type: "Facebook",
            email: response.email || "facebook_user", 
            password: "no_password",
            token: response.accessToken
        };
        performLogin(payload);
    }
=======
    performLogin({ type: "Local", email: emailInput, password, token: "" });
>>>>>>> Stashed changes
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Đăng nhập</h2>
        <form className="login-form" onSubmit={handleLocalLogin}>
          <div className="input-group">
<<<<<<< Updated upstream
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="name@example.com"
            />
=======
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required disabled={isLoading} placeholder="name@example.com" />
>>>>>>> Stashed changes
          </div>
          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} placeholder="••••••••" />
          </div>
          <div className="forgot-link"><Link to="/forgot-password">Quên mật khẩu?</Link></div>
          <button type="submit" className="btn-submit" disabled={isLoading}>{isLoading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
        </form>
        <div className="divider"><span>Hoặc</span></div>
        <div className="social-login">
          <GoogleOAuthProvider clientId="1079952925292-374ad5i80lfacs983o0apitqaib68k38.apps.googleusercontent.com">
            <GoogleLogin onSuccess={(res) => performLogin({ type: "Google", token: res.credential })} theme="filled_blue" width="340" />
          </GoogleOAuthProvider>
          <FacebookLogin
            appId="1551117732875423"
            fields="name,email,picture"
            callback={(res) => res.accessToken && performLogin({ type: "Facebook", email: res.email || "fb", token: res.accessToken })}
            render={p => <button onClick={p.onClick} className="btn-facebook" disabled={isLoading}><span className="fb-icon">f</span> Tiếp tục với Facebook</button>}
          />
        </div>
        <div className="register-link"><p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p></div>
      </div>
    </div>
  );
};

export default Login;