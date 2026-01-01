import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import axiosClient from '../../utils/axiosConfig';
import { StoreContext } from '../../context/StoreContext.jsx';
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
      
      const { accessToken, refreshToken, provider, name, email } = response.data.value || response.data; 

      if (accessToken) {
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        
        if (name) setName(name);
        if (email) setEmail(email);

        localStorage.setItem('provider', provider || payload.type);
        navigate('/main/boards'); 
      } else {
        alert('Đăng nhập thành công nhưng không tìm thấy Token!');
      }

    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      let errorMessage = 'Đăng nhập thất bại.';
      if (error.response && error.response.data) {
         errorMessage = error.response.data.message || JSON.stringify(error.response.data);
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalLogin = (e) => {
    e.preventDefault();
    const payload = {
        type: "Local",
        email: emailInput,
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
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Đăng nhập</h2>
        <p className="login-subtitle">Chào mừng bạn quay trở lại!</p>

        <form onSubmit={handleLocalLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              disabled={isLoading}
              placeholder="name@example.com"
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="••••••••"
            />
          </div>

          <div className="forgot-link">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="divider">
            <span>Hoặc tiếp tục với</span>
        </div>

        <div className="social-login">
            <div className="google-btn-wrapper">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => alert("Google Login Failed")}
                    theme="filled_blue" 
                    shape="rectangular"
                    text="continue_with"
                    width="340" 
                />
            </div>

            <FacebookLogin
                appId="1551117732875423"
                autoLoad={false}
                fields="name,email,picture"
                callback={handleFacebookResponse}
                render={renderProps => (
                    <button 
                        onClick={renderProps.onClick} 
                        className="btn-facebook"
                        disabled={isLoading}
                    >
                        <span style={{fontSize: '18px', fontWeight: 'bold'}}>f</span> 
                        <span>Tiếp tục với Facebook</span>
                    </button>
                )}
            />
        </div>

        <div className="register-link">
          <p>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;