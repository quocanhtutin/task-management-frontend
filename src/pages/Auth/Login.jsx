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
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Đăng nhập</h2>
        <p>Chào mừng trở lại! Vui lòng nhập thông tin của bạn.</p>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={data.email}
            onChange={onChangeHandler}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            value={data.password}
            onChange={onChangeHandler}
            required
          />
        </div>

        <button type="submit" className="login-button">Đăng nhập</button>

        <div className="form-links">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
          <p>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;