import React, { useState, useEffect } from 'react';
import './CreateWorkspaceModal.css';

const COVER_COLORS = [
    '#0079bf', '#d29034', '#519839', '#b04632', 
    '#89609e', '#cd5a91', '#4bbf6b', '#00aecc',
];

export const WORKSPACE_TYPES = {
    1: 'Nhân sự (HR)',
    2: 'Vận hành (Operations)',
    3: 'CRM & Kinh doanh',
    4: 'Doanh nghiệp nhỏ',
    5: 'Giáo dục',
    6: 'Marketing',
    7: 'Kỹ thuật & IT',
    8: 'Khác'
};

const CreateWorkspaceModal = ({ onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState(8);
    const [background, setBackground] = useState(COVER_COLORS[0]); 
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setType(initialData.type || 8); 
            setBackground(initialData.background || COVER_COLORS[0]);
        } else {
            setName('');
            setDescription('');
            setType(8);
            setBackground(COVER_COLORS[0]);
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        
        setIsLoading(true);
        await onSubmit({ name, description, type: Number(type), background });
        setIsLoading(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{initialData ? 'Chỉnh sửa Workspace' : 'Tạo Không gian làm việc mới'}</h3>
                
                <div style={{
                    height: '100px', 
                    background: background, 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '24px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {name || 'Tên Workspace'}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên Workspace</label>
                        <input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Nhập tên..." 
                            required 
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Mô tả</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            rows={2}
                            placeholder="Mô tả ngắn gọn về không gian làm việc này..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Lĩnh vực hoạt động (Type)</label>
                        <select 
                            value={type} 
                            onChange={(e) => setType(Number(e.target.value))}
                            style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}}
                        >
                            {Object.entries(WORKSPACE_TYPES).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Màu nền</label>
                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                            {COVER_COLORS.map((color) => (
                                <div 
                                    key={color}
                                    onClick={() => setBackground(color)}
                                    style={{
                                        width: '32px', height: '32px', background: color,
                                        borderRadius: '4px', cursor: 'pointer',
                                        border: background === color ? '3px solid #333' : '1px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>Hủy</button>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Đang xử lý...' : (initialData ? 'Lưu thay đổi' : 'Tạo Workspace')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkspaceModal;