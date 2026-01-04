import React, { useState, useEffect } from 'react';
import inviteService from '../../services/inviteService';
import { Copy, Trash2, Check, Link as LinkIcon, Clock } from 'lucide-react';

const InviteLinkManager = ({ type, targetId }) => {
    const [links, setLinks] = useState([]);
    const [copiedId, setCopiedId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [expireChoice, setExpireChoice] = useState("0"); 

    useEffect(() => {
        if (targetId) loadLinks();
    }, [targetId, type]);

    const loadLinks = async () => {
        try {
            const res = await inviteService.getInviteLinks(type, targetId);
            const data = res.data?.value || res.data || [];
            const activeLinks = Array.isArray(data) ? data.filter(l => l.status === 1) : [];
            setLinks(activeLinks);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async () => {
        if (isProcessing) return;
        try {
            setIsProcessing(true);
            const params = { 
                type, 
                targetId, 
                hours: expireChoice === "0" ? null : expireChoice 
            };
            const res = await inviteService.createInviteLink(params);
            if (res.data.isSuccess) {
                await loadLinks();
            }
        } catch (e) {
            alert("Lỗi khi tạo link");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRevoke = async (id) => {
        if (!window.confirm("Hủy liên kết này?")) return;
        try {
            setIsProcessing(true);
            await inviteService.revokeInviteLink(id);
            await loadLinks();
        } catch (e) {
            alert("Lỗi khi hủy");
        } finally {
            setIsProcessing(false);
        }
    };

    const copyToClipboard = (token, id) => {
        const url = `${window.location.origin}/invite?token=${token}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <div style={{ marginBottom: '12px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#172b4d' }}>Liên kết mời trực tiếp</h4>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select 
                        value={expireChoice} 
                        onChange={(e) => setExpireChoice(e.target.value)}
                        style={{ fontSize: '12px', padding: '4px', borderRadius: '3px', border: '1px solid #ddd', flex: 1 }}
                    >
                        <option value="0">Không bao giờ hết hạn</option>
                        <option value="1">Hết hạn sau 1 giờ</option>
                        <option value="24">Hết hạn sau 1 ngày</option>
                        <option value="168">Hết hạn sau 7 ngày</option>
                    </select>
                    
                    <button 
                        onClick={handleCreate} 
                        disabled={isProcessing}
                        style={{ fontSize: '12px', padding: '5px 12px', cursor: 'pointer', background: '#0079bf', color: 'white', border: 'none', borderRadius: '3px', whiteSpace: 'nowrap' }}
                    >
                        {isProcessing ? '...' : 'Tạo link'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {links.length === 0 ? (
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Chưa có link nào.</p>
                ) : (
                    links.map(link => (
                        <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f4f5f7', padding: '8px', borderRadius: '4px' }}>
                            <LinkIcon size={14} color="#6b778c" />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '12px', fontWeight: '500' }}>Link (...{link.token.slice(-6)})</span>
                                {link.expiredAt && (
                                    <span style={{ fontSize: '10px', color: '#eb5a46', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <Clock size={10} /> Hết hạn: {new Date(link.expiredAt).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <button onClick={() => copyToClipboard(link.token, link.id)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                                {copiedId === link.id ? <Check size={14} color="green" /> : <Copy size={14} />}
                            </button>
                            <button onClick={() => handleRevoke(link.id)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                                <Trash2 size={14} color="#eb5a46" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InviteLinkManager;