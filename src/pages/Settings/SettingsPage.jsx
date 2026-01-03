import React, { useState, useEffect } from 'react';
import axiosClient from '../../utils/axiosConfig';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import './SettingsPage.css';

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=random";

const PROVIDERS = {
    LOCAL: 'Local',
    GOOGLE: 'Google',
    FACEBOOK: 'Facebook'
};

const SettingsPage = () => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        avatarUrl: ''
    });

    const [linkedProviders, setLinkedProviders] = useState([]);
    const [originalData, setOriginalData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get('/User/Me');
            const data = response.data.value || response.data;
            
            let formattedDate = '';
            if (data.dateOfBirth) {
                const date = new Date(data.dateOfBirth);
                if (!isNaN(date)) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0'); 
                    const day = String(date.getDate()).padStart(2, '0');
                    formattedDate = `${year}-${month}-${day}`;
                }
            }

            const mappedData = {
                name: data.name || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || data.phone || '',
                dateOfBirth: formattedDate,
                avatarUrl: data.avatar || data.avatarUrl || DEFAULT_AVATAR
            };

            setUserData(mappedData);
            setOriginalData(mappedData);

            const providersList = [];
            if (data.isGoogleLinked) {
                providersList.push(PROVIDERS.GOOGLE);
            }
            if (data.isFacebookLinked) {
                providersList.push(PROVIDERS.FACEBOOK);
            }
            setLinkedProviders(providersList);

        } catch (error) {
            console.error("Lỗi lấy thông tin:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleLinkAccount = async (provider, token) => {
        try {
            await axiosClient.post('/Auth/LinkOAuth', {
                provider: provider,
                token: token
            });
            alert(`Liên kết ${provider} thành công!`);
            fetchUserData(); 
        } catch (error) {
            console.error(`Lỗi liên kết ${provider}:`, error);
            const msg = error.response?.data?.message || "Liên kết thất bại (Có thể tài khoản này đã được sử dụng).";
            alert(msg);
        }
    };

    const handleUnlinkAccount = async (provider) => {
        
        if (!window.confirm(`Bạn có chắc muốn hủy liên kết ${provider}?`)) return;

        try {
            await axiosClient.post('/Auth/UnlinkOAuth', {
                provider: provider
            });
            alert(`Đã hủy liên kết ${provider}.`);
            fetchUserData();
        } catch (error) {
            console.error(`Lỗi hủy liên kết ${provider}:`, error);
            let msg = "Hủy liên kết thất bại.";
            if (error.response?.data?.message) msg = error.response.data.message;
            alert(msg);
        }
    };

    const handleGoogleSuccess = (credentialResponse) => {
        handleLinkAccount(PROVIDERS.GOOGLE, credentialResponse.credential);
    };

    const handleFacebookResponse = (response) => {
        if (response.accessToken) {
            handleLinkAccount(PROVIDERS.FACEBOOK, response.accessToken);
        }
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const promises = [];
        try {
            if (userData.name && userData.name !== originalData.name) {
                promises.push(axiosClient.put('/User/Me/Name', { name: userData.name }));
            }
            if (userData.phoneNumber !== originalData.phoneNumber) {
                promises.push(axiosClient.put('/User/Me/Phone', { phoneNumber: userData.phoneNumber }));
            }
            if (userData.dateOfBirth !== originalData.dateOfBirth) {
                const isoDate = new Date(userData.dateOfBirth).toISOString();
                promises.push(axiosClient.put('/User/Me/DateOfBirth', { dateOfBirth: isoDate }));
            }
             if (userData.avatarUrl && userData.avatarUrl !== originalData.avatarUrl) {
                promises.push(axiosClient.put('/User/Me/Avatar', { avatarUrl: userData.avatarUrl }));
            }

            if (promises.length === 0) {
                alert("Bạn chưa thay đổi thông tin nào!");
                setIsSaving(false);
                return;
            }

            await Promise.all(promises);
            alert("Cập nhật thông tin thành công!");
            window.location.reload();
        } catch (error) {
            console.error("Lỗi lưu thông tin:", error);
            let msg = "Có lỗi xảy ra.";
            if(error.response?.data?.message) msg = error.response.data.message;
            alert(`Lỗi: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="settings-container">Đang tải...</div>;

    const isGoogleLinked = linkedProviders.includes(PROVIDERS.GOOGLE);
    const isFacebookLinked = linkedProviders.includes(PROVIDERS.FACEBOOK);

    return (
        <div className="settings-container">
            <div className="settings-card">
                <div className="settings-header">
                    <h2>Cài đặt tài khoản</h2>
                </div>

                <form onSubmit={handleSaveChanges}>
                    <div className="settings-section">
                        <div className="avatar-section">
                            <img 
                                src={userData.avatarUrl} 
                                alt="User Avatar" 
                                className="current-avatar"
                                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }} 
                            />
                            <div style={{flex: 1}}>
                                <label style={{marginBottom:'5px', display:'block', fontWeight:'600'}}>Link ảnh đại diện (URL)</label>
                                <input 
                                    type="text" 
                                    name="avatarUrl"
                                    className="form-control"
                                    value={userData.avatarUrl}
                                    onChange={handleInputChange}
                                    placeholder="Nhập đường dẫn ảnh..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="settings-section" style={{marginTop: '20px'}}>
                        <h4 style={{marginBottom: '15px', color: '#172b4d'}}>Liên kết mạng xã hội</h4>
                        
                        <div className="social-link-item">
                            <div className="social-info">
                                <span className="social-icon google-icon">G</span>
                                <div>
                                    <div style={{fontWeight: '500'}}>Google</div>
                                    <div style={{fontSize: '12px', color: isGoogleLinked ? 'green' : '#666'}}>
                                        {isGoogleLinked ? 'Đã liên kết' : 'Chưa liên kết'}
                                    </div>
                                </div>
                            </div>
                            {isGoogleLinked ? (
                                <button 
                                    type="button" 
                                    className="btn-unlink"
                                    onClick={() => handleUnlinkAccount(PROVIDERS.GOOGLE)}
                                >
                                    Hủy liên kết
                                </button>
                            ) : (
                                <div style={{width: 'fit-content'}}> 
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => alert("Google Link Failed")}
                                        text="signin"
                                        shape="pill"
                                        size="small"
                                        width="150"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="social-link-item">
                            <div className="social-info">
                                <span className="social-icon fb-icon">f</span>
                                <div>
                                    <div style={{fontWeight: '500'}}>Facebook</div>
                                    <div style={{fontSize: '12px', color: isFacebookLinked ? 'green' : '#666'}}>
                                        {isFacebookLinked ? 'Đã liên kết' : 'Chưa liên kết'}
                                    </div>
                                </div>
                            </div>
                            {isFacebookLinked ? (
                                <button 
                                    type="button" 
                                    className="btn-unlink"
                                    onClick={() => handleUnlinkAccount(PROVIDERS.FACEBOOK)}
                                >
                                    Hủy liên kết
                                </button>
                            ) : (
                                <FacebookLogin
                                    appId="1551117732875423"
                                    autoLoad={false}
                                    fields="name,email,picture"
                                    callback={handleFacebookResponse}
                                    render={renderProps => (
                                        <button 
                                            type="button"
                                            onClick={renderProps.onClick} 
                                            className="btn-connect-fb"
                                        >
                                            Kết nối Facebook
                                        </button>
                                    )}
                                />
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="form-control" value={userData.email} disabled style={{backgroundColor: '#f4f5f7', color: '#6b778c'}} />
                    </div>

                    <div className="form-group">
                        <label>Họ và tên</label>
                        <input type="text" name="name" className="form-control" value={userData.name} onChange={handleInputChange} />
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input type="text" name="phoneNumber" className="form-control" value={userData.phoneNumber} onChange={handleInputChange} />
                    </div>

                    <div className="form-group">
                        <label>Ngày sinh</label>
                        <input type="date" name="dateOfBirth" className="form-control" value={userData.dateOfBirth} onChange={handleInputChange} />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-save" disabled={isSaving}>
                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;