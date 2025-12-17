import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axiosConfig';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await axiosClient.post('/Auth/ForgotPasswordSendOtp', { email });
      
      alert(`Mã OTP đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư.`);
      setStep(2); 
    } catch (error) {
      console.error("Lỗi gửi OTP:", error);
      const msg = error.response?.data?.message || "Không thể gửi OTP. Vui lòng kiểm tra lại email.";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
        return "Mật khẩu phải có ít nhất 8 ký tự!";
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(pwd)) {
        return "Mật khẩu yếu! Cần: 8 ký tự, 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt.";
    }
    return null;
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
        alert("Vui lòng nhập mã OTP.");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("Mật khẩu nhập lại không khớp!");
        return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
        alert(passwordError);
        return;
    }

    setIsLoading(true);
    try {
      await axiosClient.post('/Auth/ForgotPasswordVerify', {
        email: email,
        otp: otp,
        newPassword: newPassword
      });

      alert("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.");
      navigate('/login'); 
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      
      let msg = "Đã có lỗi xảy ra.";
      if (error.response && error.response.data) {
          if (error.response.data.message) {
              msg = error.response.data.message;
          } else if (error.response.data.errors) {
              const errorValues = Object.values(error.response.data.errors);
              msg = errorValues.flat().join('\n');
          } else if (typeof error.response.data === 'string') {
              msg = error.response.data;
          }
      }
      alert(`Lỗi: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-form">
        <h2>{step === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu"}</h2>
        <p>
            {step === 1 
                ? "Nhập email của bạn để nhận mã OTP xác thực." 
                : `Nhập mã OTP và mật khẩu mới cho ${email}.`
            }
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="forgot-button" disabled={isLoading}>
              {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="input-group">
              <label htmlFor="otp">Mã OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Nhập mã OTP..."
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="newPass">Mật khẩu mới</label>
              <input
                type="password"
                id="newPass"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={isLoading}
              />
               <small style={{color: '#666', fontSize: '11px', display: 'block', marginTop: '4px'}}>
                *YC: 8 ký tự, 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt.
              </small>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPass">Nhập lại mật khẩu mới</label>
              <input
                type="password"
                id="confirmPass"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="forgot-button" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
            </button>
            
            <div style={{textAlign: 'center', marginTop: '10px'}}>
                <span 
                    style={{fontSize: '13px', color: '#0079bf', cursor: 'pointer', textDecoration: 'underline'}}
                    onClick={() => {
                        setStep(1);
                        setOtp('');
                        setNewPassword('');
                        setConfirmPassword('');
                    }}
                >
                    Gửi lại mã / Nhập lại Email
                </span>
            </div>
          </form>
        )}

        <div className="form-links">
          <p>
            <Link to="/login">← Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;