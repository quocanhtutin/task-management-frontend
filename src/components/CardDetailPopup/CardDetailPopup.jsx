import React, { useState, useRef, useEffect } from "react";
import { useParams } from 'react-router-dom';
import "./CardDetailPopup.css";
import { ChevronDown, X, Pencil, PencilOff, Trash2, Paperclip, Download } from 'lucide-react';
import AutoResizeTextarea from "../AutoResizeTextarea/AutoResizeTextarea";
import ChecklistSection from "../CheckList/ChecklistSection";
import { DragDropContext } from "@hello-pangea/dnd";
import cardService from "../../services/cardService";
import boardMemberService from "../../services/boardMemberService";
import taskService from "../../services/taskService";
import subTaskService from "../../services/subTaskService";
import commentService from "../../services/commentService";
import attachmentService from "../../services/attachmentService";

function CommentEditor({ initial, onSave, onCancel }) {
    const [val, setVal] = useState(initial);
    return (
        <div>
            <AutoResizeTextarea
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onFocus={() => { }}
            />
            <div className="desc-actions">
                <button onClick={onCancel} className="btn">Hủy</button>
                <button onClick={() => onSave(val)} className="btn primary">Lưu</button>
            </div>
        </div>
    );
}

export default function CardDetailPopup({
    card = {},
    onClose,
    onSoftDelete,
    updateCardInColumn,
    columns,
    setColumns,
    boardLabelColors = [],
    activeLabelIndices = [],
}) {
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(card.check || false);
    const [title, setTitle] = useState(card.title);
    const [editTitle, setEditTitle] = useState(false)
    const { boardId } = useParams();

    // Column
    const active_index = columns.findIndex(col => col.id === card.columnId)
    const [column, setColumn] = useState(active_index !== -1 ? columns[active_index].title : "")
    const [showColumns, setShowColumns] = useState(false)

    // Labels
    const [showLabelSelect, setShowLabelSelect] = useState(false);
    const [selectedLabels, setSelectedLabels] = useState(Array.isArray(card.label) ? card.label : []);

    // Due date & Start date
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [deadline, setDeadline] = useState(card.deadline || null);
    const [dateInput, setDateInput] = useState(() => (card.deadline ? card.deadline.split("T")[0] : ""));
    const [timeInput, setTimeInput] = useState(() => (card.deadline ? card.deadline.split("T")[1].slice(0, 5) : ""));
    const [reminder, setReminder] = useState("none");

    // Members
    const [showMemberSearch, setShowMemberSearch] = useState(false);
    const [memberQuery, setMemberQuery] = useState("");
    const [members, setMembers] = useState(card.members || []);
    const [showAssignedMembers, setShowAssignedMembers] = useState(false)
    const hoverTimer = useRef(null);
    const [boardMembers, setBoardMembers] = useState([]);

    // Description
    const [desc, setDesc] = useState(card.description || "");
    const [isEditingDesc, setIsEditingDesc] = useState(false);

    // Comments
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [editingCommentId, setEditingCommentId] = useState(null);

    // Attachments
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);

    // Checklists
    const [checklists, setChecklists] = useState(card.checklists || []);

    useEffect(() => {
        if (!boardId) return;
        const fetchBoardMembers = async () => {
            try {
                const response = await boardMemberService.getAllMembers(boardId);
                const data = response.data.value || response.data || [];

                const formattedMembers = data.map(m => ({
                    id: m.userId || m.id,
                    name: m.name || m.user?.name || "No Name",
                    avatarColor: m.avatarColor || "#2196F3",
                    email: m.email || m.user?.email,
                    avatarUrl: m.avatarUrl
                }));
                setBoardMembers(formattedMembers);
            } catch (error) {
                console.error("Lỗi tải thành viên board:", error);
            }
        };
        fetchBoardMembers();
    }, [boardId]);

    useEffect(() => {
        if (!card?.id) return;

        const fetchCardDetail = async () => {
            setLoading(true);
            try {
                const [detailResponse, assigneesResponse, tasksResponse, commentsResponse, attachmentsResponse] = await Promise.all([
                    cardService.getDetail(card.id),
                    cardService.getAssignees(card.id),
                    taskService.getTasks(card.id),
                    commentService.getComments(card.id),
                    attachmentService.getAttachments(card.id)
                ]);

                const tasksData = tasksResponse.data.value || tasksResponse.data || [];
                const formattedChecklists = tasksData.map(task => ({
                    ...task,
                    items: (task.subTasks || []).map(sub => ({
                        ...sub,
                        done: sub.status === 2,
                        status: sub.status
                    }))
                }));
                setChecklists(formattedChecklists);

                const data = detailResponse.data.value || detailResponse.data;
                const assigneesData = assigneesResponse.data.value || assigneesResponse.data;

                setTitle(data.title || card.title);
                setDesc(data.description || "");
                setCompleted(data.isCompleted ?? data.check ?? false);

                if (Array.isArray(data.label)) {
                    setSelectedLabels(data.label);
                } else {
                    setSelectedLabels([]);
                }

                setStartDate(data.startDate || null);
                setDeadline(data.dueDate || data.deadline || null);

                if (data.dueDate) {
                    const d = new Date(data.dueDate);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    setDateInput(`${year}-${month}-${day}`);

                    const hh = String(d.getHours()).padStart(2, '0');
                    const mm = String(d.getMinutes()).padStart(2, '0');
                    setTimeInput(`${hh}:${mm}`);
                }

                if (data.reminderEnabled === false) {
                    setReminder("none");
                } else {
                    if (data.reminderBeforeMinutes === 0) setReminder("at");
                    else setReminder(String(data.reminderBeforeMinutes));
                }

                const mappedMembers = assigneesData.map(u => ({
                    id: u.userId,
                    name: u.userName,
                    avatarColor: "#2196F3"
                }));
                setMembers(mappedMembers);

                // Xử lý comments (có Avatar)
                const commentsData = commentsResponse.data.value || commentsResponse.data || [];
                const formattedComments = commentsData.map(c => ({
                    id: c.id,
                    text: c.content,
                    author: c.userName || c.user?.name || "Người dùng",
                    avatar: c.userAvatar, // Lấy avatar từ GET API
                    time: c.createdAt || c.createdTime || new Date().toISOString(),
                    userId: c.userId
                }));
                formattedComments.sort((a, b) => new Date(b.time) - new Date(a.time));
                setComments(formattedComments);

                // Xử lý Attachments
                const attachData = attachmentsResponse.data.value || attachmentsResponse.data || [];
                setAttachments(attachData);

            } catch (error) {
                console.error("Lỗi tải chi tiết card:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCardDetail();
    }, [card.id]);

    useEffect(() => {
        function onDocClick(e) {
            if (!e.target.closest(".label-select") && !e.target.closest(".label-btn")) setShowLabelSelect(false);
            if (!e.target.closest(".member-search") && !e.target.closest(".member-btn")) setShowMemberSearch(false);
            if (!e.target.closest(".date-popup") && !e.target.closest(".date-btn")) setShowDatePicker(false);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const toggleLabel = async (labelIndex) => {
        let newLabels;
        const currentLabels = Array.isArray(selectedLabels) ? selectedLabels : [];
        if (currentLabels.includes(labelIndex)) {
            newLabels = currentLabels.filter(id => id !== labelIndex);
        } else {
            newLabels = [...currentLabels, labelIndex];
        }
        const oldLabels = [...currentLabels];
        setSelectedLabels(newLabels);
        updateCardInColumn(card.columnId, card.id, "label", newLabels);
        try {
            await cardService.updateLabels(card.id, newLabels);
        } catch (error) {
            console.error("Lỗi API Label:", error);
            setSelectedLabels(oldLabels);
            updateCardInColumn(card.columnId, card.id, "label", oldLabels);
            alert("Không thể cập nhật nhãn!");
        }
    };

    const saveDescription = async () => {
        if (desc === (card.description || "")) {
            setIsEditingDesc(false);
            return;
        }
        const oldDesc = card.description;
        setIsEditingDesc(false);
        updateCardInColumn(card.columnId, card.id, "description", desc);
        try {
            await cardService.updateDescription(card.id, desc);
        } catch (error) {
            console.error("Lỗi API Mô tả:", error);
            setDesc(oldDesc || "");
            updateCardInColumn(card.columnId, card.id, "description", oldDesc);
            alert("Lỗi lưu mô tả!");
            setIsEditingDesc(true);
        }
    }

    const saveDate = async () => {
        if (!dateInput) return;
        const dateTimeString = `${dateInput}T${timeInput || "00:00"}`;
        const newDueDate = new Date(dateTimeString).toISOString();
        let isReminderEnabled = true;
        let reminderMinutes = 0;
        if (reminder === "none") {
            isReminderEnabled = false;
        } else if (reminder === "at") {
            reminderMinutes = 0;
        } else {
            reminderMinutes = parseInt(reminder, 10);
        }
        const payload = {
            startDate: startDate,
            dueDate: newDueDate,
            reminderEnabled: isReminderEnabled,
            reminderBeforeMinutes: reminderMinutes
        };
        setDeadline(newDueDate);
        setShowDatePicker(false);
        try {
            await cardService.updateDates(card.id, payload);
        } catch (error) {
            console.error("Lỗi cập nhật ngày:", error);
            alert("Cập nhật ngày thất bại!");
        }
    }

    const saveTitle = async () => {
        if (!title.trim() || title === card.title) {
            setTitle(card.title);
            setEditTitle(false);
            return;
        }
        try {
            await cardService.updateTitle(card.id, title);
            updateCardInColumn(card.columnId, card.id, "title", title);
            setEditTitle(false);
        } catch (error) {
            console.error(error);
            alert("Lỗi đổi tên!");
            setTitle(card.title);
        }
    }

    const toggleMember = async (user) => {
        const isAssigned = members.find(m => m.id === user.id);
        if (isAssigned) {
            setMembers(members.filter(m => m.id !== user.id));
        } else {
            setMembers([...members, user]);
        }
        try {
            if (isAssigned) {
                await cardService.removeAssignee(card.id, user.id);
            } else {
                await cardService.addAssignee(card.id, user.id);
            }
        } catch (error) {
            console.error("Lỗi cập nhật thành viên:", error);
            alert("Có lỗi xảy ra, vui lòng thử lại!");
            if (isAssigned) {
                setMembers([...members, user]);
            } else {
                setMembers(members.filter(m => m.id !== user.id));
            }
        }
    }

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = null;
        try {
            const response = await attachmentService.upload(card.id, file);
            const newAttachment = response.data.value || response.data;
            setAttachments([...attachments, newAttachment]);
        } catch (error) {
            console.error("Lỗi upload file:", error);
            alert("Tải tệp lên thất bại!");
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (!window.confirm("Bạn có chắc muốn xóa tệp đính kèm này?")) return;
        const oldAttachments = [...attachments];
        setAttachments(attachments.filter(a => a.id !== attachmentId));
        try {
            await attachmentService.delete(attachmentId);
        } catch (error) {
            console.error("Lỗi xóa file:", error);
            alert("Không thể xóa tệp!");
            setAttachments(oldAttachments);
        }
    };

    // --- COMMENT LOGIC ---
    const addComment = async () => {
        if (!commentText.trim()) return;

        const contentToDisplay = commentText;
        const tempId = "temp-" + Date.now();

        // Optimistic UI update
        const newCommentOptimistic = {
            id: tempId,
            text: contentToDisplay,
            author: "Bạn",
            avatar: null, // Mới tạo chưa có avatar
            time: new Date().toISOString()
        };

        setComments([newCommentOptimistic, ...comments]);
        setCommentText("");

        try {
            const response = await commentService.create(card.id, contentToDisplay);

            // Dữ liệu API trả về: { userName, userAvatar, id, createdAt, ... }
            const apiData = response.data.value;

            setComments(prevComments =>
                prevComments.map(c =>
                    c.id === tempId ? {
                        ...c,
                        id: apiData.id,
                        time: apiData.createdAt,
                        author: apiData.userName,   // Cập nhật tên thật từ server
                        avatar: apiData.userAvatar  // Cập nhật link avatar từ server
                    } : c
                )
            );
        } catch (error) {
            console.error("Lỗi thêm comment:", error);
            alert("Không thể gửi bình luận!");
            setComments(prev => prev.filter(c => c.id !== tempId));
        }
    }

    const saveEditComment = async (id, newText) => {
        const oldComments = [...comments];
        const updatedComments = comments.map(c => c.id === id ? { ...c, text: newText } : c);
        setComments(updatedComments);
        setEditingCommentId(null);
        try {
            await commentService.update(id, newText);
        } catch (error) {
            console.error("Lỗi sửa comment:", error);
            alert("Lỗi cập nhật bình luận!");
            setComments(oldComments);
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
        const oldComments = [...comments];
        setComments(comments.filter(x => x.id !== commentId));
        try {
            await commentService.delete(commentId);
        } catch (error) {
            console.error("Lỗi xóa comment:", error);
            alert("Không thể xóa bình luận!");
            setComments(oldComments);
        }
    }

    useEffect(() => { updateCardInColumn(card.columnId, card.id, "deadline", deadline) }, [deadline])
    useEffect(() => { updateCardInColumn(card.columnId, card.id, "members", members) }, [members])
    useEffect(() => { updateCardInColumn(card.columnId, card.id, "check", completed) }, [completed])
    useEffect(() => { updateCardInColumn(card.columnId, card.id, "checklists", checklists) }, [checklists]);

    const handleChangeColumn = (toCol) => {
        const updated = [...columns]
        const cardIndex = updated[active_index].cards.findIndex(c => c.id === card.id)
        if (cardIndex === -1) return;
        const [movedCard] = updated[active_index].cards.splice(cardIndex, 1);
        updated[toCol].cards.push({ ...movedCard, columnId: updated[toCol].id });
        setColumns(updated)
        setShowColumns(false)
    }

    const handleDragEnd = async (result) => {
        const { source, destination, type } = result;
        if (!destination) return;

        if (type === "CHECKLIST_GROUP") {
            if (source.index === destination.index) return;
            const newChecklists = [...checklists];
            const [movedChecklist] = newChecklists.splice(source.index, 1);
            newChecklists.splice(destination.index, 0, movedChecklist);
            setChecklists(newChecklists);
            try {
                await taskService.updatePosition(movedChecklist.id, destination.index);
            } catch (error) {
                console.error("Lỗi di chuyển Task Group:", error);
            }
            return;
        }

        if (type === "ITEM" || !type) {
            if (source.droppableId !== destination.droppableId) return;
            if (source.index === destination.index) return;
            setChecklists(prev => {
                const listIndex = prev.findIndex(c => c.id === source.droppableId);
                if (listIndex === -1) return prev;
                const newList = { ...prev[listIndex] };
                const newItems = [...newList.items];
                const [movedItem] = newItems.splice(source.index, 1);
                newItems.splice(destination.index, 0, movedItem);
                newList.items = newItems;
                return prev.map((c, i) => i === listIndex ? newList : c);
            });
            try {
                await subTaskService.updatePosition(result.draggableId, destination.index);
            } catch (error) {
                console.error("Lỗi di chuyển SubTask:", error);
            }
        }
    };

    return (
        <div className="cdp-overlay">
            <div className="cdp-main">
                {loading && (
                    <div style={{
                        height: '3px', width: '100%',
                        background: 'linear-gradient(90deg, #0079bf, #5aac44)',
                        backgroundSize: '200% 100%',
                        animation: 'loadingGradient 1.5s infinite',
                        position: 'absolute', top: 0, left: 0,
                        borderTopLeftRadius: '8px', borderTopRightRadius: '8px', zIndex: 10
                    }}>
                        <style>{`@keyframes loadingGradient { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }`}</style>
                    </div>
                )}

                <div className="cdp-top">
                    <h2>{column}</h2>
                    <ChevronDown size={14} className="down-icon" onClick={() => setShowColumns(true)} />
                    {showColumns && (
                        <ul className="view-columns">
                            {columns.map((col, i) => (
                                <li className={col.id === card.columnId ? "active-column" : ""} key={i} onClick={() => { setColumn(col.title); handleChangeColumn(i) }}>{col.title}</li>
                            ))}
                        </ul>
                    )}
                    {card.storedDate && <h2>Thẻ được lưu trữ vào {card.storedDate}</h2>}
                </div>

                <div className="cdp-under">
                    <div className="cdp-left">
                        <div className="cdp-header">
                            <label className="cdp-checkbox">
                                <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
                            </label>
                            {!editTitle ?
                                <h1 className="cdp-title">{title}</h1> :
                                <textarea className="cdp-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                            }
                            {!editTitle ?
                                <Pencil className="edit-title" onClick={() => setEditTitle(true)} /> :
                                <PencilOff className="edit-title" onClick={() => { setEditTitle(false); saveTitle() }} />
                            }

                            <div
                                className="store-card delete-hover"
                                title="Xóa thẻ"
                                style={{ cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', marginLeft: '10px' }}
                                onClick={() => onSoftDelete(card)}
                            >
                                <Trash2 size={22} />
                            </div>
                        </div>

                        <div className="cdp-actions">
                            <div className="action-row">
                                <button className="action-btn label-btn" onClick={() => setShowLabelSelect(!showLabelSelect)}>
                                    Nhãn
                                </button>

                                {selectedLabels && Array.isArray(selectedLabels) && selectedLabels.length > 0 && (
                                    <div className="preview-labels">
                                        {selectedLabels.map((labelIdx) => {
                                            const color = boardLabelColors[labelIdx];
                                            if (!color) return null;
                                            return (
                                                <span key={labelIdx} className="label-preview-item" style={{ backgroundColor: color }}></span>
                                            );
                                        })}
                                    </div>
                                )}

                                {showLabelSelect && (
                                    <div className="label-select">
                                        <div className="label-list-cdp">
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#5e6c84' }}>Nhãn dán</h4>

                                            {boardLabelColors.map((colorHex, index) => {
                                                if (!activeLabelIndices.includes(index)) return null;

                                                const isChecked = Array.isArray(selectedLabels) && selectedLabels.includes(index);
                                                return (
                                                    <div className="card-label-item" key={index} onClick={() => toggleLabel(index)}>
                                                        <input type="checkbox" checked={isChecked} readOnly style={{ cursor: 'pointer' }} />
                                                        <div className="label-color" style={{ background: colorHex, cursor: 'pointer' }}></div>
                                                    </div>
                                                );
                                            })}
                                            {activeLabelIndices.length === 0 && (
                                                <div style={{ color: '#ef4444', fontSize: '13px', padding: '10px 0' }}>Chưa có nhãn nào được kích hoạt.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="action-row">
                                <button className="action-btn date-btn" onClick={() => setShowDatePicker(!showDatePicker)}>Ngày</button>
                                {showDatePicker && (
                                    <div className="date-popup">
                                        <label>Chọn ngày hết hạn</label>
                                        <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
                                        <div className="time-row">
                                            <input type="number" min="0" max="23" placeholder="HH" value={timeInput ? timeInput.split(":")[0] : ""} onChange={(e) => { let val = e.target.value; if (val.length > 2) val = val.slice(0, 2); if (parseInt(val) > 23) val = "23"; if (parseInt(val) < 0) val = "0"; const mm = timeInput ? timeInput.split(":")[1] : "00"; setTimeInput(`${val}:${mm}`); }} onBlur={(e) => { let val = e.target.value; if (!val) val = "00"; else val = val.padStart(2, '0'); const mm = timeInput ? timeInput.split(":")[1] : "00"; setTimeInput(`${val}:${mm}`); }} />
                                            <span>:</span>
                                            <input type="number" min="0" max="59" placeholder="MM" value={timeInput ? timeInput.split(":")[1] : ""} onChange={(e) => { let val = e.target.value; if (val.length > 2) val = val.slice(0, 2); if (parseInt(val) > 59) val = "59"; if (parseInt(val) < 0) val = "0"; const hh = timeInput ? timeInput.split(":")[0] : "00"; setTimeInput(`${hh}:${val}`); }} onBlur={(e) => { let val = e.target.value; if (!val) val = "00"; else val = val.padStart(2, '0'); const hh = timeInput ? timeInput.split(":")[0] : "00"; setTimeInput(`${hh}:${val}`); }} />
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
                                {deadline && <div className="due-preview">Hạn: {new Date(deadline).toLocaleString('vi-VN')}</div>}
                            </div>

                            <div className="action-row">
                                <div className="members-row">
                                    <div className="members-stack"
                                        onMouseEnter={() => { hoverTimer.current = setTimeout(() => { setShowAssignedMembers(true); }, 1000); }}
                                        onMouseLeave={() => { clearTimeout(hoverTimer.current); setShowAssignedMembers(false); }}
                                    >
                                        {members.slice(0, 3).map((m, idx) => (
                                            <div key={m.id} className={`avatar overlap idx-${idx}`} style={{ background: m.avatarColor }}>
                                                {m.avatarUrl ? (
                                                    <img
                                                        src={m.avatarUrl}
                                                        alt={m.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    m.name[0]
                                                )}
                                            </div>
                                        ))}
                                        {showAssignedMembers &&
                                            <div className="member-assigned">
                                                <div className="member-results">
                                                    {members.map(u => (
                                                        <div key={u.id} className={`member-item`}>
                                                            <div className="avatar small" style={{ background: u.avatarColor }}>
                                                                {m.avatarUrl ? (
                                                                    <img
                                                                        src={m.avatarUrl}
                                                                        alt={m.name}
                                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    />
                                                                ) : (
                                                                    m.name[0]
                                                                )}

                                                            </div>
                                                            <div className="member-name">{u.name}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>}
                                    </div>
                                    <button className="avatar add member-btn" onClick={() => setShowMemberSearch(true)}>+</button>
                                    {showMemberSearch && (
                                        <div className="member-search">
                                            <input placeholder="Tìm thành viên..." value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} />
                                            <div className="member-results">
                                                {boardMembers
                                                    .filter(u => u.name.toLowerCase().includes(memberQuery.toLowerCase()))
                                                    .map(u => {
                                                        const isSelected = members.find(m => m.id === u.id);
                                                        return (
                                                            <div
                                                                key={u.id}
                                                                className={`member-item ${isSelected ? 'selected' : ''}`}
                                                                onClick={() => toggleMember(u)}
                                                            >
                                                                <div className="avatar small" style={{ background: u.avatarColor }}>
                                                                    {u.name[0]?.toUpperCase()}
                                                                </div>
                                                                <div className="member-name">
                                                                    {u.name}
                                                                    <div style={{ fontSize: '11px', color: '#888' }}>{u.email}</div>
                                                                </div>
                                                                {isSelected && <button className="remove-member member-btn">x</button>}
                                                            </div>
                                                        );
                                                    })}
                                                {boardMembers.length === 0 && (
                                                    <div style={{ padding: '10px', textAlign: 'center', color: '#888' }}>
                                                        Không có thành viên nào trong Board.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* [FIXED] Nút Đính kèm nhỏ gọn */}
                            <div className="action-row" style={{ flex: '0 0 auto' }}>
                                <button
                                    className="action-btn attachment-btn"
                                    onClick={handleUploadClick}
                                    title="Đính kèm tệp"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '6px 10px',
                                        height: '32px',
                                        minWidth: '32px'
                                    }}
                                >
                                    <Paperclip size={16} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                            </div>

                        </div>

                        {attachments.length > 0 && (
                            <div className="section">
                                <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Paperclip size={16} /> Tệp đính kèm ({attachments.length})
                                </div>
                                <div className="attachments-list" style={{ marginTop: '10px' }}>
                                    {attachments.map(att => (
                                        <div key={att.id} className="attachment-item" style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '8px',
                                            border: '1px solid #dfe1e6',
                                            borderRadius: '4px',
                                            marginBottom: '8px',
                                            background: '#fff'
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '30px',
                                                background: '#dfe1e6',
                                                borderRadius: '3px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '10px',
                                                fontSize: '10px',
                                                color: '#5e6c84',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase'
                                            }}>
                                                {att.fileName ? att.fileName.split('.').pop() : 'FILE'}
                                            </div>

                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {att.fileName}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#5e6c84' }}>
                                                    Đã thêm {new Date(att.uploadDate || Date.now()).toLocaleDateString('vi-VN')}
                                                    <span style={{ margin: '0 6px' }}>•</span>
                                                    <span
                                                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                        onClick={() => handleDeleteAttachment(att.id)}
                                                    >
                                                        Xóa
                                                    </span>
                                                </div>
                                            </div>

                                            <a href={att.fileUrl} target="_blank" rel="noreferrer" className="btn-icon" style={{ color: '#5e6c84', padding: '6px' }} title="Tải xuống">
                                                <Download size={16} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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

                        <DragDropContext onDragEnd={handleDragEnd}>
                            <ChecklistSection
                                checklists={checklists}
                                setChecklists={setChecklists}
                                cardId={card.id}
                            />
                        </DragDropContext>
                    </div>

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
                                        {/* [FIXED] Hiển thị Avatar */}
                                        {c.avatar ? (
                                            <img
                                                src={c.avatar}
                                                alt={c.author}
                                                className="avatar small"
                                                style={{ objectFit: 'cover', border: '1px solid #dfe1e6' }}
                                            />
                                        ) : (
                                            <div className="avatar small">
                                                {c.author ? c.author[0].toUpperCase() : "?"}
                                            </div>
                                        )}
                                        <div className="meta-text"><div className="name">{c.author}</div><div className="time">{new Date(c.time).toLocaleString('vi-VN')}</div></div>
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
                                            <button className="comment-action-btn" onClick={() => setEditingCommentId(c.id)}>Chỉnh sửa</button>
                                            <span className="action-separator">•</span>
                                            <button className="comment-action-btn delete" onClick={() => handleDeleteComment(c.id)}>Xóa</button>
                                        </div>
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <X size={14} className="cdp-close" onClick={onClose} />
            </div>
        </div>
    );
}