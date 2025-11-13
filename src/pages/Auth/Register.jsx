import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const navigate = useNavigate();

  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Mật khẩu nhập lại không khớp!');
      return;
    }

    //TODO: GỌI API BACKEND gửi { name, email, password }
    console.log('Gửi yêu cầu đăng ký:', { name, email, password });

    //Giả lập gọi API thành công
    setIsOtpSent(true);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();

    //TODO: GỌI API BACKEND để xác thực { email, otp } (2)
    console.log('Gửi yêu cầu xác thực OTP:', { email, otp });

    //Giả lập xác thực OTP thành công
    alert('Xác thực thành công! Đang chuyển đến trang đăng nhập...');
    navigate('/login');
  };

  return (
    <div className="register-container">
      
      {!isOtpSent ? (
        <form className="register-form" onSubmit={handleRegisterSubmit}>
          <h2>Đăng ký</h2>
          <p>Tạo tài khoản mới để bắt đầu hành trình của bạn.</p>

          <div className="input-group">
            <label htmlFor="name">Họ và tên</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={false}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="register-button">Đăng ký</button>

          <div className="form-links">
            <p>
              Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
            </p>
          </div>
        </form>
      ) : (
        <form className="register-form" onSubmit={handleOtpSubmit}>
          <h2>Xác thực Email</h2>
          <p>Một mã OTP đã được gửi đến <strong>{email}</strong>. Vui lòng nhập mã để hoàn tất.</p>
          <div className="input-group">
            <label htmlFor="otp">Mã OTP</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="Nhập 6 chữ số"
            />
          </div>

          <button type="submit" className="register-button">Xác nhận</button>

          <div className="form-links">
            <p>
              <a href="#" onClick={() => alert('TODO: Gọi API gửi lại OTP')}>Gửi lại mã?</a>
            </p>
          </div>
        </form>
      )}

    </div>
  );
};

export default Register;