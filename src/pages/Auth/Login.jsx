import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../../utils/firebaseConfig'; 
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

  const handleGoogleLogin = async (e) => {
      if (e) e.preventDefault();
      try {
          const result = await signInWithPopup(auth, googleProvider);
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.idToken;
          
          performLogin({ 
              type: "Google", 
              token: token
          });

      } catch (error) {
          console.error("Google Login Error:", error);
          alert("Đăng nhập Google thất bại.");
      }
  };

  const handleFacebookLogin = async (e) => {
      if (e) e.preventDefault();
      try {
          const result = await signInWithPopup(auth, facebookProvider);
          
          const credential = FacebookAuthProvider.credentialFromResult(result);
          const accessToken = credential.accessToken;
          
          performLogin({ 
              type: "Facebook", 
              token: accessToken 
          });

      } catch (error) {
          console.error("Facebook Login Error:", error);
          if (error.code === 'auth/account-exists-with-different-credential') {
              alert("Email đã tồn tại với phương thức đăng nhập khác.");
          } else {
              alert("Đăng nhập Facebook thất bại.");
          }
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
          <button onClick={handleGoogleLogin} className="btn-google" disabled={isLoading}>
            <span className="google-icon">G</span> Tiếp tục với Google
          </button>
          
          <button onClick={handleFacebookLogin} className="btn-facebook" disabled={isLoading}>
            <span className="fb-icon">f</span> Tiếp tục với Facebook
          </button>
        </div>
        <div className="register-link"><p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p></div>
      </div>
    </div>
  );
};

export default Login;