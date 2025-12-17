import React, { useState, useEffect } from 'react';
import axiosClient from '../../utils/axiosConfig';
import './SettingsPage.css';

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=random";

const SettingsPage = () => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        avatarUrl: ''
    });

    const [originalData, setOriginalData] = useState({});
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
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

            } catch (error) {
                console.error("Lỗi lấy thông tin:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        const promises = [];

        try {
            if (userData.name && userData.name !== originalData.name) {
                promises.push(
                    axiosClient.put('/User/Me/Name', { name: userData.name })
                );
            }
            
            if (userData.phoneNumber !== originalData.phoneNumber) {
                promises.push(
                    axiosClient.put('/User/Me/Phone', { phoneNumber: userData.phoneNumber })
                );
            }

            if (userData.dateOfBirth !== originalData.dateOfBirth) {
                const isoDate = new Date(userData.dateOfBirth).toISOString();
                promises.push(
                    axiosClient.put('/User/Me/DateOfBirth', { dateOfBirth: isoDate })
                );
            }

             if (userData.avatarUrl && userData.avatarUrl !== originalData.avatarUrl) {
                promises.push(
                    axiosClient.put('/User/Me/Avatar', { avatarUrl: userData.avatarUrl })
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
            console.error("Lỗi lưu thông tin:", error);
            
            let msg = "Có lỗi xảy ra khi lưu thông tin.";
            if(error.response) {
                console.log("Server Error Detail:", error.response.data);
                
                if(error.response.data && error.response.data.message) {
                    msg = error.response.data.message;
                } else if (typeof error.response.data === 'string') {
                     msg = error.response.data;
                }
            }
            alert(`Lỗi: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="settings-container">Đang tải...</div>;

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
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = DEFAULT_AVATAR;
                                }} 
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
                                <small style={{color:'#666', fontStyle: 'italic'}}>
                                </small>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            value={userData.email} 
                            disabled 
                            style={{backgroundColor: '#f4f5f7', color: '#6b778c'}}
                        />
                    </div>

                    <div className="form-group">
                        <label>Họ và tên</label>
                        <input 
                            type="text" 
                            name="name"
                            className="form-control" 
                            value={userData.name} 
                            onChange={handleInputChange}
                        />
                         <small style={{color:'#ae2a19', fontSize: '12px'}}>
                             *Lưu ý: Hệ thống giới hạn tần suất đổi tên (1836 ngày).
                         </small>
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input 
                            type="text" 
                            name="phoneNumber"
                            className="form-control" 
                            value={userData.phoneNumber} 
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Ngày sinh</label>
                        <input 
                            type="date" 
                            name="dateOfBirth"
                            className="form-control" 
                            value={userData.dateOfBirth} 
                            onChange={handleInputChange}
                        />
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