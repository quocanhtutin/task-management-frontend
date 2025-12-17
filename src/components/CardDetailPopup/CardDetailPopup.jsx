import React, { useState, useRef, useEffect } from "react";
import "./CardDetailPopup.css";
import { ChevronDown, X, Pencil, PencilOff, Archive } from 'lucide-react';
import AutoResizeTextarea from "../AutoResizeTextarea/AutoResizeTextarea";
import ChecklistSection from "../CheckList/ChecklistSection";
import { DragDropContext } from "@hello-pangea/dnd";
import { label } from "framer-motion/client";

const MOCK_USERS = [
    { id: 1, name: "Nguyễn Văn A", avatarColor: "#F44336" },
    { id: 2, name: "Trần Thị B", avatarColor: "#9C27B0" },
    { id: 3, name: "Lê C", avatarColor: "#03A9F4" },
    { id: 4, name: "Phạm D", avatarColor: "#4CAF50" },
];

const LABEL_COLORS = [
    "#BAF3DB", "#F8E6A0", "#FFE2A8", "#FFD5D2", "#EBD9FF",
    "#4BCE97", "#E2B203", "#FF9F1A", "#FF7452", "#C77DFF",
    "#1F845A", "#946F00", "#C25100", "#C9372C", "#8F46C1",
    "#D6E4FF", "#C6EDFB", "#D3F1A7", "#FDD0EC", "#DFE1E6",
    "#6B9EFF", "#6CC3E0", "#94C748", "#E774BB", "#8C8F97",
    "#1D6CE0", "#227D9B", "#5B7F24", "#A64D79", "#6B6E76"
]

export default function CardDetailPopup({
    card = {},
    onClose,
    updateCardInColumn,
    columns,
    setColumns,
    labels,
    setLabels,
    addLabel,
    updateLabel
}) {
    const [completed, setCompleted] = useState(card.check || false);
    const [title, setTitle] = useState(card.title);
    const [editTitle, setEditTitle] = useState(false)

    // Column
    const active_index = columns.findIndex(col => col.id === card.columnId)
    const [column, setColumn] = useState(columns[active_index].title)
    const [showColumns, setShowColumns] = useState(false)

    // Labels
    // const [label, setLabel] = useState(card.label || null);
    const [showLabelSelect, setShowLabelSelect] = useState(false);

    const [selectedLabels, setSelectedLabels] = useState(card.label || []);

    const [showAddLabel, setShowAddLabel] = useState(false);
    const [editingLabel, setEditingLabel] = useState(null);

    const [newLabelTitle, setNewLabelTitle] = useState("");
    const [newLabelColor, setNewLabelColor] = useState("");


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
    const [showAssignedMembers, setShowAssignedMembers] = useState(false)
    const hoverTimer = useRef(null);

    // Description
    const [desc, setDesc] = useState(card.description || "");
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const descRef = useRef(null);

    // Comments
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState(card.comments || []);
    const [editingCommentId, setEditingCommentId] = useState(null);

    //task
    const [checklists, setChecklists] = useState(card.checklists || []);


    useEffect(() => {
        function onDocClick(e) {
            if (
                !e.target.closest(".label-select") &&
                !e.target.closest(".label-btn") &&
                !e.target.closest(".add-label-popup")
            ) {
                setShowLabelSelect(false);
                setShowAddLabel(false);
                setEditingLabel(null);
            }

            if (!e.target.closest(".member-search") && !e.target.closest(".member-btn"))
                setShowMemberSearch(false);

            if (!e.target.closest(".date-popup") && !e.target.closest(".date-btn"))
                setShowDatePicker(false);
        }

        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);


    const toggleMember = (user) => {
        const exists = members.find(m => m.id === user.id);
        if (exists) setMembers(members.filter(m => m.id !== user.id));
        else setMembers([...members, user]);
    }

    const toggleLabel = (labelId) => {
        setSelectedLabels(prev =>
            prev.includes(labelId)
                ? prev.filter(id => id !== labelId)
                : [...prev, labelId]
        );
    };


    const saveDate = () => {
        if (!dateInput) return;
        const iso = `${dateInput}T${timeInput || "00:00"}`;
        setDeadline(iso);
        setShowDatePicker(false);
    }

    const saveDescription = () => {
        setIsEditingDesc(false);
        updateCardInColumn(card.columnId, card.id, "description", desc)
    }

    const saveTitle = () => {
        setEditTitle(false);
        if (title) {
            updateCardInColumn(card.columnId, card.id, "title", title)
        }
    }

    const addComment = () => {
        if (!commentText.trim()) return;
        const newC = { id: Date.now(), text: commentText, author: "Bạn", time: new Date().toISOString() };
        setComments([newC, ...comments]);
        setCommentText("");
    }

    const saveEditComment = (id, newText) => {
        setComments(comments.map(c => c.id === id ? { ...c, text: newText } : c));
        setEditingCommentId(null);
    }

    // useEffect(() => {
    //     updateCardInColumn(card.columnId, card.id, "label", label)
    // }, [label])

    useEffect(() => {
        updateCardInColumn(card.columnId, card.id, "label", selectedLabels);
    }, [selectedLabels]);


    useEffect(() => {
        updateCardInColumn(card.columnId, card.id, "deadline", deadline)
    }, [deadline])

    useEffect(() => {
        updateCardInColumn(card.columnId, card.id, "members", members)
    }, [members])

    useEffect(() => {
        updateCardInColumn(card.columnId, card.id, "check", completed)
    }, [completed])

    useEffect(() => {
        updateCardInColumn(card.columnId, card.id, "reminder", reminder)
    }, [reminder])

    useEffect(() => {
        updateCardInColumn(card.columnId, card.id, "checklists", checklists);
    }, [checklists]);


    const handleChangeColumn = (toCol) => {
        const updated = [...columns]
        const cardIndex = updated[active_index].cards.findIndex(c => c.id === card.id)
        const [movedCard] = updated[active_index].cards.splice(cardIndex, 1);
        updated[toCol].cards.push({ ...movedCard, columnId: updated[toCol].id });
        setColumns(updated)
        setShowColumns(false)
    }

    const handleDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        setChecklists(prev => {
            const sourceIdx = prev.findIndex(c => c.id === source.droppableId);
            const destIdx = prev.findIndex(c => c.id === destination.droppableId);

            const sourceCl = prev[sourceIdx];
            const destCl = prev[destIdx];

            const sourceItems = [...sourceCl.items];
            const [moved] = sourceItems.splice(source.index, 1);

            if (sourceIdx === destIdx) {
                sourceItems.splice(destination.index, 0, moved);
                return prev.map((c, i) =>
                    i === sourceIdx ? { ...c, items: sourceItems } : c
                );
            }

            const destItems = [...destCl.items];
            destItems.splice(destination.index, 0, moved);

            return prev.map((c, i) => {
                if (i === sourceIdx) return { ...c, items: sourceItems };
                if (i === destIdx) return { ...c, items: destItems };
                return c;
            });
        });
    };

    const saveLabel = () => {
        if (!newLabelColor) return;

        if (editingLabel) {
            updateLabel(editingLabel.id, newLabelColor, newLabelTitle)
        } else {
            addLabel(newLabelColor, newLabelTitle)
        }

        setShowAddLabel(false);
        setEditingLabel(null);
        setNewLabelTitle("");
        setNewLabelColor("");
    };



    return (
        <div className="cdp-overlay">
            <div className="cdp-main">
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
                    {/* Left column */}
                    <div className="cdp-left">
                        <div className="cdp-header">
                            <label className="cdp-checkbox">
                                <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
                            </label>
                            {!editTitle ?
                                <h1 className="cdp-title">{title}</h1>
                                :
                                <textarea className="cdp-title" value={title} onChange={(e) => setTitle(e.target.value)} />}
                            {!editTitle ?
                                <Pencil className="edit-title" onClick={() => setEditTitle(true)} />
                                :
                                <PencilOff className="edit-title" onClick={() => { setEditTitle(false); saveTitle() }} />
                            }
                            {completed && <Archive className="store-card" size={22} onClick={() => updateCardInColumn(card.columnId, card.id, "stored", true)} />}

                        </div>

                        {/* Actions */}
                        <div className="cdp-actions">
                            {/* Label */}
                            <div className="action-row">
                                <button className="action-btn label-btn" onClick={() => setShowLabelSelect(!showLabelSelect)}>
                                    Nhãn
                                </button>
                                {selectedLabels &&
                                    <div className="preview-labels">
                                        {selectedLabels.map((labelId, i) => {
                                            const label = labels.find(l => l.id === labelId);
                                            if (!label) return null;

                                            return (
                                                <span
                                                    key={label.id}
                                                    className="label-preview-item"
                                                    style={{ backgroundColor: label.color }}
                                                >
                                                    {label.title}
                                                </span>
                                            );
                                        }
                                        )}
                                    </div>
                                }
                                {showLabelSelect && !showAddLabel && (
                                    <div className="label-select">
                                        <div className="label-list-cdp">
                                            {labels.map(label => {
                                                const checked = selectedLabels.includes(label.id);

                                                return (
                                                    <div className="card-label-item" key={label.id}>
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleLabel(label.id)}
                                                        />

                                                        <div
                                                            className="label-color"
                                                            style={{ background: label.color }}
                                                            onClick={() => toggleLabel(label.id)}
                                                        >
                                                            {label.title}
                                                        </div>

                                                        <Pencil
                                                            size={14}
                                                            className="edit-icon"
                                                            onClick={() => {
                                                                setEditingLabel(label);
                                                                setNewLabelTitle(label.title);
                                                                setNewLabelColor(label.color);
                                                                setShowAddLabel(true);
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            })}

                                            <button
                                                className="add-card white"
                                                onClick={() => {
                                                    setEditingLabel(null);
                                                    setNewLabelTitle("");
                                                    setNewLabelColor("");
                                                    setShowAddLabel(true);
                                                }}
                                            >
                                                Tạo nhãn mới
                                            </button>
                                        </div>

                                    </div>
                                )}
                                {showAddLabel && (
                                    <div className="label-select">
                                        <input
                                            className="new-label-title"
                                            placeholder="Tên nhãn"
                                            value={newLabelTitle}
                                            onChange={(e) => setNewLabelTitle(e.target.value)}
                                        />

                                        <div className="new-label-grid">
                                            {LABEL_COLORS.map((color, i) => (
                                                <div
                                                    key={i}
                                                    className={`new-label-item ${newLabelColor === color ? "active" : ""
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => setNewLabelColor(color)}
                                                />
                                            ))}
                                        </div>

                                        <div className="add-label-btns">
                                            <button className="add-card blue" onClick={saveLabel}>
                                                Lưu
                                            </button>

                                            <button
                                                className="add-card white"
                                                onClick={() => {
                                                    setShowAddLabel(false);
                                                    setEditingLabel(null);
                                                    setShowLabelSelect(true)
                                                }}
                                            >
                                                Hủy
                                            </button>
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
                                    <div
                                        className="members-stack"
                                        onMouseEnter={() => {
                                            hoverTimer.current = setTimeout(() => {
                                                setShowAssignedMembers(true);
                                            }, 1000);
                                        }}
                                        onMouseLeave={() => {
                                            clearTimeout(hoverTimer.current);
                                            setShowAssignedMembers(false);
                                        }}
                                    >
                                        {members.slice(0, 3).map((m, idx) => (
                                            <div key={m.id} className={`avatar overlap idx-${idx}`} style={{ background: m.avatarColor }}>
                                                {m.name[0]}
                                            </div>
                                        ))}
                                        {showAssignedMembers &&
                                            <div className="member-assigned">
                                                <div className="member-results">
                                                    {members.map(u => (
                                                        <div key={u.id} className={`member-item`}>
                                                            <div className="avatar small" style={{ background: u.avatarColor }}>{u.name[0]}</div>
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
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <ChecklistSection
                                checklists={checklists}
                                setChecklists={setChecklists}
                            />
                        </DragDropContext>


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
                <X size={14} className="cdp-close" onClick={onClose} />
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