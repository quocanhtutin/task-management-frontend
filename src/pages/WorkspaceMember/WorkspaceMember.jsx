import React, { useState, useContext } from 'react'
import './WorkspaceMember.css'
import { X, Search, Copy, Shield, Eye, UserMinus } from "lucide-react";

const ALL_USERS = [
    { id: 1, name: "Nguyen Van A", email: "a@gmail.com" },
    { id: 2, name: "Tran Thi B", email: "b@gmail.com" },
    { id: 3, name: "Le Van C", email: "c@gmail.com" },
    { id: 4, name: "Pham Thi D", email: "d@gmail.com" }
];

const MEMBERS = [
    { id: 1, name: "Nguyen Van A", email: "a@gmail.com", role: "Admin" },
    { id: 2, name: "Tran Thi B", email: "b@gmail.com", role: "Member" }
];

const WorkspaceMember = () => {
    const [showInvite, setShowInvite] = useState(false);
    const [searchUser, setSearchUser] = useState("");
    const [pickedUsers, setPickedUsers] = useState([]);
    const [copied, setCopied] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");


    const filteredUsers = ALL_USERS.filter(
        u =>
            searchUser &&
            (u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
                u.name.toLowerCase().includes(searchUser.toLowerCase()))
    );


    const addUser = (user) => {
        if (!pickedUsers.find(u => u.id === user.id)) {
            setPickedUsers([...pickedUsers, user]);
        }
        setSearchUser("");
    };


    const invite = () => {
        // call API invite here
        setPickedUsers([]);
        setShowInvite(false);
    };


    const copyLink = () => {
        navigator.clipboard.writeText("https://invite-workspace-link");
        setCopied(true);
    };


    const filteredMembers = MEMBERS.filter(
        m =>
            m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
            m.email.toLowerCase().includes(memberSearch.toLowerCase())
    );

    return (
        <div className="wm-page">
            <h1>Thành viên không gian làm việc</h1>


            {/* Stats */}
            <div className="wm-stats">
                <div><b>2</b><span>Người cộng tác</span></div>
                <div><b>2</b><span>Thành viên</span></div>
                <div><b>0</b><span>Yêu cầu tham gia</span></div>
            </div>


            {/* Invite */}
            <div className="wm-invite">
                <button onClick={() => setShowInvite(true)}>Mời thành viên</button>
                <button className="link-btn" onClick={copyLink}>
                    {copied ? "Đã sao chép liên kết" : "Tạo liên kết mời"}
                </button>
                {copied && <span className="disable-link">Tắt liên kết</span>}
            </div>
            {/* Members list */}
            <div className="wm-members">
                <input
                    placeholder="Tìm thành viên"
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                />


                {filteredMembers.map(m => (
                    <div key={m.id} className="wm-member-item">
                        <div className="info">
                            <div className="avatar">{m.name[0]}</div>
                            <div>
                                <b>{m.name}</b>
                                <p>{m.email}</p>
                            </div>
                        </div>
                        <div className="actions">
                            <Eye size={18} />
                            <Shield size={18} />
                            <UserMinus size={18} />
                        </div>
                    </div>
                ))}
            </div>


            {/* Invite popup */}
            {showInvite && (
                <div className="wm-popup-overlay">
                    <div className="wm-popup">
                        <div className="popup-header">
                            <h3>Mời vào không gian làm việc</h3>
                            <X onClick={() => setShowInvite(false)} />
                        </div>


                        <input
                            placeholder="Nhập email để tìm"
                            value={searchUser}
                            onChange={e => setSearchUser(e.target.value)}
                        />


                        {filteredUsers.length > 0 && (
                            <div className="user-search-popup">
                                {filteredUsers.map(u => (
                                    <div key={u.id} onClick={() => addUser(u)}>
                                        {u.name} - {u.email}
                                    </div>
                                ))}
                            </div>
                        )}


                        <div className="picked-users">
                            {pickedUsers.map(u => (
                                <span key={u.id}>{u.email}</span>
                            ))}
                        </div>
                        <button className="confirm-btn" onClick={invite}>Mời</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default WorkspaceMember
