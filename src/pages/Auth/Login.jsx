import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import axiosClient from '../../utils/axiosConfig';
import { StoreContext } from '../../context/StoreContext.jsx'
import './Login.css';

const Login = () => {
  const { setAccessToken, setRefreshToken, setName, setEmail } = useContext(StoreContext);
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const performLogin = async (payload) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post('/Auth/Login', payload);
      const data = response.data.value || response.data;

      if (data.accessToken) {
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);

        localStorage.setItem('provider', data.provider || payload.type);

        const returnUrl = localStorage.getItem("returnUrl");
        localStorage.removeItem("returnUrl");

        if (returnUrl && returnUrl.includes('/invite')) {
          navigate(returnUrl, { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Đăng nhập thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalLogin = (e) => {
    e.preventDefault();
    performLogin({ type: "Local", email: emailInput, password, token: "" });
  };

  const handleFacebookResponse = async (response) => {
      if (response.accessToken) {
          try {
              const token = response.accessToken;
              
              const graphRes = await fetch(
                  `https://graph.facebook.com/me?fields=name,email,picture&access_token=${token}`
              );
              const profile = await graphRes.json();

              console.log("FB Profile fetched:", profile);

              performLogin({ 
                  type: "Facebook", 
                  email: profile.email || "no-email",
                  name: profile.name, 
                  token: token
              });

          } catch (error) {
              console.error("Lỗi lấy thông tin Facebook:", error);
              alert("Không thể lấy thông tin từ Facebook.");
          }
      } else {
          alert("Đăng nhập Facebook thất bại (Không có token).");
      }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Đăng nhập</h2>
        <form className="login-form" onSubmit={handleLocalLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required disabled={isLoading} placeholder="name@example.com" />
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
            appId="1497769627987814"
            
            onSuccess={handleFacebookResponse}
            
            onFail={(error) => {
              console.log('Login Failed!', error);
            }}
            
            render={({ onClick }) => (
              <button onClick={onClick} className="btn-facebook" disabled={isLoading}>
                <span className="fb-icon">f</span> Tiếp tục với Facebook
              </button>
            )}
          />
        </div>
        <div className="register-link"><p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p></div>
      </div>
    </div>
  );
};

export default Login;