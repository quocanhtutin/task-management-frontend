import React, { useState, useRef, useEffect } from "react";
import "./CardDetailPopup.css";
import AutoResizeTextarea from "../AutoResizeTextarea/AutoResizeTextarea";

const MOCK_USERS = [
    { id: 1, name: "Nguyễn Văn A", avatarColor: "#F44336" },
    { id: 2, name: "Trần Thị B", avatarColor: "#9C27B0" },
    { id: 3, name: "Lê C", avatarColor: "#03A9F4" },
    { id: 4, name: "Phạm D", avatarColor: "#4CAF50" },
];

export default function CardDetailPopup({ card = {}, onClose, updateCardInColumn }) {
    const [completed, setCompleted] = useState(card.completed || false);
    const [title] = useState(card.title || "Học cách dùng Trello");

    // Labels
    const labelColors = ["#FF7043", "#FFA726", "#FFEB3B", "#66BB6A", "#42A5F5", "#AB47BC"];
    const [label, setLabel] = useState(card.label || null);
    const [showLabelSelect, setShowLabelSelect] = useState(false);

    // Due date
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [deadline, setDeadline] = useState(card.deadline || null);
    const [dateInput, setDateInput] = useState(() => (card.deadline ? card.deadline.split("T")[0] : ""));
    const [timeInput, setTimeInput] = useState(() => (card.deadline ? card.deadline.split("T")[1].slice(0, 5) : ""));
    const [reminder, setReminder] = useState(card.reminder || "none");

    // Members
    const [showMemberSearch, setShowMemberSearch] = useState(false);
    const [memberQuery, setMemberQuery] = useState("");
    const [members, setMembers] = useState(card.members || []);

    // Description
    const [desc, setDesc] = useState(card.description || "");
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const descRef = useRef(null);

    // Comments
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState(card.comments || []);
    const [editingCommentId, setEditingCommentId] = useState(null);

    useEffect(() => {
        function onDocClick(e) {
            if (!e.target.closest(".label-select") && !e.target.closest(".label-btn")) setShowLabelSelect(false);
            if (!e.target.closest(".member-search") && !e.target.closest(".member-btn")) setShowMemberSearch(false);
            if (!e.target.closest(".date-popup") && !e.target.closest(".date-btn")) setShowDatePicker(false);
        }
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    function toggleMember(user) {
        const exists = members.find(m => m.id === user.id);
        if (exists) setMembers(members.filter(m => m.id !== user.id));
        else setMembers([...members, user]);
    }

    function saveDate() {
        if (!dateInput) return;
        const iso = `${dateInput}T${timeInput || "00:00"}`;
        setDeadline(iso);
        setShowDatePicker(false);
    }

    function saveDescription() {
        setIsEditingDesc(false);
        updateCardInColumn(card.column, card.id, "description", desc)
    }

    function addComment() {
        if (!commentText.trim()) return;
        const newC = { id: Date.now(), text: commentText, author: "Bạn", time: new Date().toISOString() };
        setComments([newC, ...comments]);
        setCommentText("");
    }

    function saveEditComment(id, newText) {
        setComments(comments.map(c => c.id === id ? { ...c, text: newText } : c));
        setEditingCommentId(null);
    }

    useEffect(() => {
        updateCardInColumn(card.column, card.id, "label", label)
    }, [label])

    useEffect(() => {
        updateCardInColumn(card.column, card.id, "deadline", deadline)
    }, [deadline])

    useEffect(() => {
        updateCardInColumn(card.column, card.id, "members", members)
    }, [members])

    return (
        <div className="cdp-overlay">
            <div className="cdp-main">
                <div className="cdp-top">
                    <h2>{card.column}</h2>
                </div>
                <div className="cdp-under">
                    {/* Left column */}
                    <div className="cdp-left">
                        <div className="cdp-header">
                            <label className="cdp-checkbox">
                                <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
                            </label>
                            <h1 className="cdp-title">{title}</h1>
                        </div>

                        {/* Actions */}
                        <div className="cdp-actions">
                            {/* Label */}
                            <div className="action-row">
                                <button className="action-btn label-btn" onClick={() => setShowLabelSelect(!showLabelSelect)}>
                                    Nhãn
                                </button>
                                {label && <span className="label-preview" style={{ background: label }} />}
                                {showLabelSelect && (
                                    <div className="label-select">
                                        <div className="label-grid">
                                            {labelColors.map((c) => (
                                                <button
                                                    key={c}
                                                    className="color-item"
                                                    style={{ background: c }}
                                                    onClick={() => setLabel(c)}
                                                />
                                            ))}
                                            <button className="color-item clear" onClick={() => setLabel(null)}>Xóa</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Due date */}
                            <div className="action-row">
                                <button className="action-btn date-btn" onClick={() => setShowDatePicker(!showDatePicker)}>Ngày</button>

                                {showDatePicker && (
                                    <div className="date-popup">
                                        <label>Chọn ngày</label>
                                        <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
                                        <div className="time-row">
                                            <input type="number" min="0" max="23" placeholder="HH" value={timeInput ? timeInput.split(":")[0] : ""} onChange={(e) => {
                                                const hh = (e.target.value || "").padStart(2, '0');
                                                const mm = timeInput ? timeInput.split(":")[1] : "00";
                                                setTimeInput(hh + ":" + mm);
                                            }} />
                                            <span>:</span>
                                            <input type="number" min="0" max="59" placeholder="MM" value={timeInput ? timeInput.split(":")[1] : ""} onChange={(e) => {
                                                const mm = (e.target.value || "").padStart(2, '0');
                                                const hh = timeInput ? timeInput.split(":")[0] : "00";
                                                setTimeInput(hh + ":" + mm);
                                            }} />
                                        </div>

                                        <label>Thiết lập lời nhắc</label>
                                        <select value={reminder} onChange={(e) => setReminder(e.target.value)}>
                                            <option value="none">Không có</option>
                                            <option value="at">Vào thời điểm hết hạn</option>
                                            <option value="5">5 phút trước</option>
                                            <option value="10">10 phút trước</option>
                                            <option value="15">15 phút trước</option>
                                            <option value="60">1 giờ trước</option>
                                            <option value="120">2 giờ trước</option>
                                        </select>

                                        <div className="date-actions">
                                            <button onClick={() => setShowDatePicker(false)} className="btn small">Hủy</button>
                                            <button onClick={saveDate} className="btn small primary">Lưu</button>
                                        </div>
                                    </div>
                                )}

                                {deadline && <div className="due-preview">Hạn: {new Date(deadline).toLocaleString()}</div>}
                            </div>

                            {/* Members */}
                            <div className="action-row">
                                <div className="members-row">
                                    <div className="members-stack">
                                        {members.slice(0, 3).map((m, idx) => (
                                            <div key={m.id} className={`avatar overlap idx-${idx}`} style={{ background: m.avatarColor }}>{m.name[0]}</div>
                                        ))}
                                        <button className="avatar add member-btn" onClick={() => { setShowMemberSearch(true) }}>+</button>
                                    </div>

                                    {showMemberSearch && (
                                        <div className="member-search">
                                            <input placeholder="Tìm thành viên..." value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} />
                                            <div className="member-results">
                                                {MOCK_USERS.filter(u => u.name.toLowerCase().includes(memberQuery.toLowerCase())).map(u => (
                                                    <div key={u.id} className={`member-item ${members.find(m => m.id === u.id) ? 'selected' : ''}`} onClick={() => toggleMember(u)}>
                                                        <div className="avatar small" style={{ background: u.avatarColor }}>{u.name[0]}</div>
                                                        <div className="member-name">{u.name}</div>
                                                        {members.find(m => m.id === u.id) && <button className="remove-member member-btn">x</button>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                        {/* Description */}
                        <div className="section">
                            <div className="label">Mô tả</div>
                            <AutoResizeTextarea
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                onFocus={() => setIsEditingDesc(true)}
                            />

                            {isEditingDesc && (
                                <div className="desc-actions">
                                    <button onClick={() => { setDesc(card.description || ""); setIsEditingDesc(false); }} className="btn">Hủy</button>
                                    <button onClick={saveDescription} className="btn primary">Lưu</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="cdp-right">
                        <div className="comments-header">Nhận xét và hoạt động</div>

                        <div className="comment-input">
                            <textarea placeholder="Viết bình luận..." value={commentText} onChange={(e) => setCommentText(e.target.value)} rows={3}></textarea>
                            <div className="comment-actions">
                                <button className="btn" onClick={() => setCommentText("")}>Hủy</button>
                                <button className="btn primary" onClick={addComment} disabled={!commentText.trim()}>Lưu</button>
                            </div>
                        </div>

                        <div className="comments-list">
                            {comments.map(c => (
                                <div className="comment-card" key={c.id}>
                                    <div className="comment-meta">
                                        <div className="avatar small">{c.author[0]}</div>
                                        <div className="meta-text"><div className="name">{c.author}</div><div className="time">{new Date(c.time).toLocaleString()}</div></div>
                                    </div>

                                    <div className="comment-body">
                                        {editingCommentId === c.id ? (
                                            <CommentEditor initial={c.text} onSave={(t) => saveEditComment(c.id, t)} onCancel={() => setEditingCommentId(null)} />
                                        ) : (
                                            <p className="comment-text">{c.text}</p>
                                        )}
                                    </div>
                                    {editingCommentId !== c.id &&
                                        <div className="comment-footer">
                                            <div className="comment-actions-row">
                                                <button className="icon-btn">👍</button>
                                                <button className="icon-btn" onClick={() => setEditingCommentId(c.id)}>Chỉnh sửa</button>
                                                <button className="icon-btn" onClick={() => setComments(comments.filter(x => x.id !== c.id))}>Xóa</button>
                                            </div>
                                        </div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <button className="cdp-close" onClick={onClose}>✕</button>
            </div>
        </div>
    );
}

function CommentEditor({ initial, onSave, onCancel }) {
    const [val, setVal] = useState(initial);
    return (
        <div>
            <AutoResizeTextarea value={val} onChange={(e) => setVal(e.target.value)} ></AutoResizeTextarea>
            <div className="desc-actions">
                <button onClick={onCancel} className="btn">Hủy</button>
                <button onClick={() => onSave(val)} className="btn primary">Lưu</button>
            </div>
        </div>
    );
}
