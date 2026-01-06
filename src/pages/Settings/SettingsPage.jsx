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

    const [selectedFile, setSelectedFile] = useState(null);
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
            
            setSelectedFile(null);

            const providersList = [];
            if (data.isGoogleLinked) providersList.push(PROVIDERS.GOOGLE);
            if (data.isFacebookLinked) providersList.push(PROVIDERS.FACEBOOK);
            setLinkedProviders(providersList);

        } catch (error) {
            console.error("Error fetching data:", error);
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file);
            setUserData(prev => ({ ...prev, avatarUrl: previewUrl }));
        }
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
            const msg = error.response?.data?.message || "Liên kết thất bại.";
            alert(msg);
        }
    };

    const handleUnlinkAccount = async (provider) => {
        if (!window.confirm(`Bạn có chắc muốn hủy liên kết ${provider}?`)) return;
        try {
            await axiosClient.post('/Auth/UnlinkOAuth', { provider: provider });
            alert(`Đã hủy liên kết ${provider}.`);
            fetchUserData();
        } catch (error) {
            alert(error.response?.data?.message || "Hủy liên kết thất bại.");
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

            if (selectedFile) {
                const formData = new FormData();
                formData.append('File', selectedFile); 

                promises.push(
                    axiosClient.put('/User/Me/Avatar', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    })
                );
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
            console.error("Save error: ", error);
            let msg = "Có lỗi xảy ra";
            if (error.response?.data?.errors?.File) {
                 msg = "Lỗi file: " + error.response.data.errors.File[0];
            } else if (error.response?.data?.message) {
                 msg = error.response.data.message;
            }
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
            <div className="settings-header">
                <h2>Cài đặt tài khoản</h2>
            </div>
            <form onSubmit={handleSaveChanges}>
                <div className="settings-section">
                    <div className="avatar-section">
                        <img
                            src={userData.avatarUrl || DEFAULT_AVATAR}
                            alt="User Avatar"
                            className="current-avatar"
                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
                            style={{ objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                            <label style={{ marginBottom: '5px', display: 'block', fontWeight: '600' }}>Ảnh đại diện</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="form-control"
                                onChange={handleFileChange}
                                style={{ padding: '6px' }}
                            />
                            <div style={{marginTop: '5px', fontSize: '12px', color: '#666'}}>
                                Chấp nhận: .jpg, .png, .jpeg
                            </div>
                        </div>
                    </div>
                </div>

                <h4 style={{ marginBottom: '10px', color: '#172b4d' }}>Liên kết mạng xã hội</h4>
                <div className="settings-section linking" style={{ marginTop: '20px' }}>
                    <div className="social-link-item">
                        <div className="social-info">
                            <span className="social-icon google-icon">G</span>
                            <div>
                                <div style={{ fontWeight: '500' }}>Google</div>
                                <div style={{ fontSize: '12px', color: isGoogleLinked ? 'green' : '#666' }}>
                                    {isGoogleLinked ? 'Đã liên kết' : 'Chưa liên kết'}
                                </div>
                            </div>
                        </div>
                        {isGoogleLinked ? (
                            <button type="button" className="btn-unlink" onClick={() => handleUnlinkAccount(PROVIDERS.GOOGLE)}>
                                Hủy liên kết
                            </button>
                        ) : (
                            <div style={{ width: 'fit-content' }}>
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => alert("Google Link Failed")}
                                    text="signin"
                                    shape="pill"
                                    size="big"
                                    width="150"
                                />
                            </div>
                        )}
                    </div>

                    <div className="social-link-item">
                        <div className="social-info">
                            <span className="social-icon fb-icon">f</span>
                            <div>
                                <div style={{ fontWeight: '500' }}>Facebook</div>
                                <div style={{ fontSize: '12px', color: isFacebookLinked ? 'green' : '#666' }}>
                                    {isFacebookLinked ? 'Đã liên kết' : 'Chưa liên kết'}
                                </div>
                            </div>
                        </div>
                        {isFacebookLinked ? (
                            <button type="button" className="btn-unlink" onClick={() => handleUnlinkAccount(PROVIDERS.FACEBOOK)}>
                                Hủy liên kết
                            </button>
                        ) : (
                            <FacebookLogin
                                appId="1497769627987814"
                                
                                onSuccess={(response) => {
                                    console.log('Facebook Link Success:', response);
                                    handleLinkAccount(PROVIDERS.FACEBOOK, response.accessToken);
                                }}
                                
                                onFail={(error) => {
                                    console.log('Facebook Link Failed:', error);
                                    alert("Kết nối Facebook thất bại!");
                                }}

                                render={({ onClick }) => (
                                    <button 
                                        type="button" 
                                        onClick={onClick} 
                                        className="btn-connect-fb"
                                    >
                                        Kết nối Facebook
                                    </button>
                                )}
                            />
                        )}
                    </div>
                </div>

                <h4 style={{ marginBottom: '10px', marginTop: '20px', color: '#172b4d' }}>Thông tin cá nhân</h4>
                <div className="form-group-pf">
                    <label>Email</label>
                    <input type="email" className="form-control" value={userData.email} disabled style={{ backgroundColor: '#f4f5f7', color: '#6b778c' }} />
                </div>

                <div className="form-group-pf">
                    <label>Họ và tên</label>
                    <input type="text" name="name" className="form-control" value={userData.name} onChange={handleInputChange} />
                </div>

                <div className="form-group-pf">
                    <label>Số điện thoại</label>
                    <input type="text" name="phoneNumber" className="form-control" value={userData.phoneNumber} onChange={handleInputChange} />
                </div>

                <div className="form-group-pf">
                    <label>Ngày sinh</label>
                    <input type="date" name="dateOfBirth" className="form-control" value={userData.dateOfBirth} onChange={handleInputChange} />
                </div>

                <button type="submit" className="btn-save-pf" disabled={isSaving}>
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </form>
        </div>
    );
};

export default SettingsPage;