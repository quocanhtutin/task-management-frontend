import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext.jsx'
import axios from 'axios';
import './Login.css';

const Login = () => {

  const { setAccessToken, setRefreshToken, setEmail, setName, url } = useContext(StoreContext)
  const navigate = useNavigate()
  const [data, setData] = useState({
    email: "",
    password: ""
  })

  const onChangeHandler = (event) => {
    const name = event.target.id;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newUrl = url + "/Auth/Login"

    const response = await axios.post(newUrl, { email: data.email, password: data.password });

    if (response.data.isSuccess) {
      setAccessToken(response.data.value.accessToken);
      setRefreshToken(response.data.value.refreshToken);
      setEmail(data.email);
      navigate('/home');
    }
    else {
      alert(response.data.message)
    }

  };

  return (
    <div className="login-container" style={{ maxWidth: '400px', margin: '50px auto', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', background: 'white' }}>
      <form className="login-form" onSubmit={handleLogin}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Đăng nhập</h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>Chào mừng bạn quay trở lại!</p>

        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '600' }}>Email</label>
          <input
            type="email"
<<<<<<< HEAD
            value={email}
            onChange={(e) => setEmail(e.target.value)}
=======
            id="email"
            value={data.email}
            onChange={onChangeHandler}
>>>>>>> page
            required
            style={{ width: '100%', padding: '.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            disabled={isLoading}
          />
        </div>

        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '600' }}>Mật khẩu</label>
          <input
            type="password"
<<<<<<< HEAD
            value={password}
            onChange={(e) => setPassword(e.target.value)}
=======
            id="password"
            value={data.password}
            onChange={onChangeHandler}
>>>>>>> page
            required
            style={{ width: '100%', padding: '.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            disabled={isLoading}
          />
        </div>

        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
          <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.9rem' }}>Quên mật khẩu?</Link>
        </div>

        <button
          type="submit"
          style={{ width: '100%', padding: '.75rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: isLoading ? 'default' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
          disabled={isLoading}
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <p>
            Chưa có tài khoản? <Link to="/register" style={{ color: '#28a745', fontWeight: 'bold' }}>Đăng ký ngay</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;