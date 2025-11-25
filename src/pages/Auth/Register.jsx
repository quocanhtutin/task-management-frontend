import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axiosConfig'; // Import cấu hình axios của bạn
import './Register.css';

const Register = () => {
  // --- STATE ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State OTP
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // --- BƯỚC 1: ĐĂNG KÝ (Đã xong) ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate Mật khẩu
    if (password.length < 8) {
        alert("Mật khẩu phải có ít nhất 8 ký tự!");
        return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
        alert("Mật khẩu yếu! Cần: 8 ký tự, 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt.");
        return;
    }
    if (password !== confirmPassword) {
      alert('Mật khẩu nhập lại không khớp!');
      return;
    }

    setIsLoading(true);

    try {
      // API Đăng ký: Có bọc { data: ... }
      await axiosClient.post('/Auth/Register', {
        data: {
          name: name,
          email: email,
          password: password
        }
      });

      alert('Đăng ký thành công! Hãy kiểm tra email để lấy mã OTP.');
      setIsOtpSent(true); // Chuyển sang màn hình OTP

    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- BƯỚC 2: XÁC THỰC OTP (MỚI) ---
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // API Xác thực: Có bọc { data: ... } (Theo hình VerifyRegisterOtp)
      await axiosClient.post('/Auth/VerifyRegisterOtp', {
        data: {
          email: email,
          otp: otp
        }
      });

      // Nếu không lỗi -> Thành công
      alert('Xác thực tài khoản thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
      navigate('/login'); 

    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- CHỨC NĂNG: GỬI LẠI OTP (MỚI) ---
  const handleResendOtp = async () => {
    if(isLoading) return;
    setIsLoading(true);
    
    try {
      // API Gửi lại: KHÔNG bọc { data } (Theo hình ResendRegisterOtp)
      // Nếu API này báo lỗi 400, bạn hãy thử thêm bọc data vào nhé.
      await axiosClient.post('/Auth/ResendRegisterOtp', { 
        email: email 
      });

      alert(`Đã gửi lại mã OTP mới tới ${email}!`);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }

  // --- HÀM XỬ LÝ LỖI CHUNG ---
  const handleError = (error) => {
    console.error('Lỗi chi tiết:', error);
    let errorMessage = 'Đã xảy ra lỗi.';

    if (error.response && error.response.data) {
        const serverData = error.response.data;
        // Ưu tiên hiển thị message trực tiếp nếu có
        if (serverData.message) {
            errorMessage = serverData.message;
        } 
        // Nếu server trả về danh sách errors validation
        else if (serverData.errors) {
            const errorKeys = Object.keys(serverData.errors);
            if (errorKeys.length > 0) {
                errorMessage = serverData.errors[errorKeys[0]][0]; // Lấy lỗi đầu tiên
            }
        } else if (typeof serverData === 'string') {
            errorMessage = serverData;
        }
    } else if (error.request) {
        errorMessage = 'Không thể kết nối đến Server.';
    }
    alert(`Thông báo: ${errorMessage}`);
  };

  return (
    <div className="register-container">
      
      {!isOtpSent ? (
        // FORM ĐĂNG KÝ
        <form className="register-form" onSubmit={handleRegisterSubmit}>
          <h2>Đăng ký</h2>
          <p>Tạo tài khoản mới</p>

          <div className="input-group">
            <label>Họ và tên</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading}/>
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}/>
          </div>
          <div className="input-group">
            <label>Mật khẩu</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading}/>
          </div>
          <div className="input-group">
            <label>Nhập lại mật khẩu</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading}/>
          </div>

          <button type="submit" className="register-button" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
          <div className="form-links">
            <p>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
          </div>
        </form>
      ) : (
        // FORM NHẬP OTP
        <form className="register-form" onSubmit={handleOtpSubmit}>
          <h2>Xác thực OTP</h2>
          <p>Mã xác thực đã được gửi tới <strong>{email}</strong></p>

          <div className="input-group">
            <label>Mã OTP</label>
            <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
                placeholder="Nhập mã OTP"
                disabled={isLoading}
            />
          </div>

          <button type="submit" className="register-button" disabled={isLoading}>
             {isLoading ? 'Đang xác thực...' : 'Xác nhận'}
          </button>

          <div className="form-links" style={{marginTop: '20px'}}>
            <p>
              Không nhận được mã? <br/>
              <span 
                style={{
                    color: isLoading ? '#ccc' : '#007bff', 
                    cursor: isLoading ? 'default' : 'pointer', 
                    fontWeight: 'bold',
                    textDecoration: 'underline'
                }} 
                onClick={handleResendOtp}
              >
                Gửi lại mã mới
              </span>
            </p>
            <p style={{marginTop: '10px'}}>
               <span style={{cursor: 'pointer', color: '#666'}} onClick={() => setIsOtpSent(false)}>
                 ← Quay lại nhập thông tin
               </span>
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default Register;