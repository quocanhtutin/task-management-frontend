import { Plus, X, Clock, User, Trash2, Pencil, SquareCheckBig } from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import './ChecklistSection.css';
import taskService from "../../services/taskService";
import subTaskService from "../../services/subTaskService";

function ChecklistItems({ checklist, index, checklists, setChecklists }) {
    const [editingId, setEditingId] = useState(null);
    const [tempText, setTempText] = useState("");

    const [datePopupId, setDatePopupId] = useState(null);
    const [dateInput, setDateInput] = useState("");
    const [timeInput, setTimeInput] = useState("");
    const [reminder, setReminder] = useState("none");
    const [popupPos, setPopupPos] = useState("bottom");

    useEffect(() => {
        function onClickOutside(e) {
            if (datePopupId && !e.target.closest(".date-popup-subtask") && !e.target.closest(".clock-icon-btn")) {
                setDatePopupId(null);
            }
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [datePopupId]);

    const openDatePopup = (item, e) => {
        if (datePopupId === item.id) {
            setDatePopupId(null);
            return;
        }

        if (e && e.currentTarget) {
            const parentRow = e.currentTarget.closest('.checklist-item');
            
            if (parentRow) {
                const rect = parentRow.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const spaceBelow = windowHeight - rect.bottom;
                const estimatedPopupHeight = 350;

                if (spaceBelow < estimatedPopupHeight) {
                    setPopupPos("top");
                } else {
                    setPopupPos("bottom");
                }
            }
        }

        if (item.dueDate) {
            const d = new Date(item.dueDate);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            setDateInput(`${year}-${month}-${day}`);

            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            setTimeInput(`${hh}:${mm}`);

            if (item.reminderEnabled === false) setReminder("none");
            else {
                if (item.reminderBeforeMinutes === 0) setReminder("at");
                else setReminder(String(item.reminderBeforeMinutes));
            }
        } else {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setDateInput(tomorrow.toISOString().split('T')[0]);
            setTimeInput("09:00");
            setReminder("none");
        }

        setDatePopupId(item.id);
    };

    const saveDate = async (itemId) => {
        if (!dateInput) return;
        const dateTimeString = `${dateInput}T${timeInput || "00:00"}`;
        const newDueDate = new Date(dateTimeString).toISOString();

        let isReminderEnabled = true;
        let reminderMinutes = 0;

        if (reminder === "none") isReminderEnabled = false;
        else if (reminder === "at") reminderMinutes = 0;
        else reminderMinutes = parseInt(reminder, 10);

        const payload = {
            dueDate: newDueDate,
            reminderEnabled: isReminderEnabled,
            reminderBeforeMinutes: reminderMinutes
        };

        setChecklists(prev =>
            prev.map((cl, i) =>
                i !== index ? cl : {
                    ...cl,
                    items: cl.items.map(it => it.id === itemId ? { 
                        ...it, 
                        dueDate: newDueDate, 
                        reminderEnabled: isReminderEnabled, 
                        reminderBeforeMinutes: reminderMinutes 
                    } : it)
                }
            )
        );
        setDatePopupId(null);

        try {
            await subTaskService.updateDates(itemId, payload);
        } catch (error) {
            console.error("Lỗi cập nhật ngày subtask:", error);
            alert("Cập nhật ngày thất bại!");
        }
    };

    const removeDate = async (itemId) => {
        const payload = {
            dueDate: null,
            reminderEnabled: false,
            reminderBeforeMinutes: 0
        };

        setChecklists(prev =>
            prev.map((cl, i) =>
                i !== index ? cl : {
                    ...cl,
                    items: cl.items.map(it => it.id === itemId ? { 
                        ...it, dueDate: null, reminderEnabled: false, reminderBeforeMinutes: 0 
                    } : it)
                }
            )
        );
        setDatePopupId(null);

        try {
            await subTaskService.updateDates(itemId, payload);
        } catch (error) {
            console.error("Lỗi xóa ngày subtask:", error);
        }
    };

    const toggleDone = async (item) => {
        const newDoneState = !item.done;
        const newStatusInt = newDoneState ? 2 : 1;

        setChecklists(prev =>
            prev.map((cl, i) =>
                i !== index ? cl : {
                    ...cl,
                    items: cl.items.map(it => it.id === item.id ? { ...it, done: newDoneState } : it)
                }
            )
        );

        try {
            await subTaskService.updateStatus(item.id, newStatusInt);
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            const oldStatusInt = !newDoneState ? 2 : 1;
            setChecklists(prev =>
                prev.map((cl, i) =>
                    i !== index ? cl : {
                        ...cl,
                        items: cl.items.map(it => it.id === item.id ? { ...it, done: !newDoneState } : it)
                    }
                )
            );
        }
    };

    const saveEdit = async (itemId) => {
        if (!tempText.trim()) {
            setEditingId(null);
            return;
        }
        const oldText = checklist.items.find(i => i.id === itemId)?.text || "";
        
        setChecklists(prev =>
            prev.map((cl, i) =>
                i !== index ? cl : {
                    ...cl,
                    items: cl.items.map(it => it.id === itemId ? { ...it, text: tempText, title: tempText } : it)
                }
            )
        );
        setEditingId(null);

        try {
            await subTaskService.updateTitle(itemId, tempText);
        } catch (error) {
            console.error("Lỗi đổi tên subtask:", error);
            setChecklists(prev =>
                prev.map((cl, i) =>
                    i !== index ? cl : {
                        ...cl,
                        items: cl.items.map(it => it.id === itemId ? { ...it, text: oldText, title: oldText } : it)
                    }
                )
            );
        }
    };

    const deleteSubTask = async (itemId) => {

        const oldChecklists = [...checklists];
        
        setChecklists(prev =>
            prev.map((cl, i) =>
                i !== index ? cl : {
                    ...cl,
                    items: cl.items.filter(it => it.id !== itemId)
                }
            )
        );

        try {
            await subTaskService.delete(itemId);
        } catch (error) {
            console.error("Lỗi xóa subtask:", error);
            setChecklists(oldChecklists);
            alert("Không thể xóa mục này!");
        }
    };

    return (
        <Droppable droppableId={checklist.id} type="ITEM">
            {(p) => (
                <div ref={p.innerRef} {...p.droppableProps}>
                    {checklist.items.map((item, i) => (
                        <Draggable draggableId={item.id} index={i} key={item.id}>
                            {(p, snapshot) => (
                                <div
                                    ref={p.innerRef}
                                    {...p.draggableProps}
                                    {...p.dragHandleProps}
                                    className="checklist-item"
                                    style={{ 
                                        position: 'relative', 
                                        ...p.draggableProps.style,
                                        background: snapshot.isDragging ? "white" : p.draggableProps.style?.background,
                                        boxShadow: snapshot.isDragging ? "0 5px 10px rgba(0,0,0,0.15)" : "none",
                                        opacity: snapshot.isDragging ? 0.9 : 1
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!item.done}
                                        onChange={() => toggleDone(item)}
                                        style={{cursor: 'pointer'}}
                                    />

                                    <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                                        {editingId === item.id ? (
                                            <input
                                                className="edit-input"
                                                autoFocus
                                                value={tempText}
                                                onChange={(e) => setTempText(e.target.value)}
                                                onBlur={() => saveEdit(item.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") saveEdit(item.id);
                                                    if (e.key === "Escape") setEditingId(null);
                                                }}
                                            />
                                        ) : (
                                            <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
                                                <span
                                                    className={item.done ? "done" : ""}
                                                    style={{marginLeft: '8px', cursor: 'text', marginRight: '8px'}}
                                                    onClick={() => {
                                                        setEditingId(item.id);
                                                        setTempText(item.text || item.title);
                                                    }}
                                                >
                                                    {item.text || item.title}
                                                </span>
                                                {item.dueDate && (
                                                    <div className="subtask-date-badge" style={{fontSize: '11px', padding: '2px 6px', background: '#f4f5f7', borderRadius: '3px', color: '#5e6c84', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                                        <Clock size={10}/>
                                                        {new Date(item.dueDate).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="item-actions">
                                        <Clock 
                                            size={14} 
                                            className="icon-hover clock-icon-btn" 
                                            style={{cursor: 'pointer', color: datePopupId === item.id ? '#0079bf' : ''}}
                                            onClick={(e) => openDatePopup(item, e)}
                                        />
                                        <User size={14} className="icon-hover" />
                                        <Trash2 
                                            size={14} 
                                            className="icon-hover delete-icon" 
                                            onClick={() => deleteSubTask(item.id)} 
                                        />
                                    </div>

                                    {datePopupId === item.id && (
                                        <div className="date-popup date-popup-subtask" style={{
                                            position: 'absolute', 
                                            top: popupPos === 'top' ? 'auto' : '100%', 
                                            bottom: popupPos === 'top' ? '100%' : 'auto',
                                            marginBottom: popupPos === 'top' ? '8px' : '0',
                                            marginTop: popupPos === 'bottom' ? '8px' : '0',
                                            right: 0, 
                                            zIndex: 100, 
                                            width: '280px',
                                            background: 'white',
                                            boxShadow: '0 8px 16px -4px rgba(9,30,66,0.25), 0 0 0 1px rgba(9,30,66,0.08)',
                                            borderRadius: '3px',
                                            padding: '12px'
                                        }}>
                                            <div style={{textAlign: 'center', marginBottom: '8px', color: '#5e6c84', fontWeight: 600}}>Ngày hết hạn</div>
                                            <label style={{display: 'block', marginBottom: '4px', fontSize: '12px', color: '#5e6c84'}}>Ngày</label>
                                            <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} style={{width: '100%', marginBottom: '8px', padding: '4px'}} />
                                            
                                            <label style={{display: 'block', marginBottom: '4px', fontSize: '12px', color: '#5e6c84'}}>Thời gian</label>
                                            <input type="time" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} style={{width: '100%', marginBottom: '8px', padding: '4px'}} />

                                            <label style={{display: 'block', marginBottom: '4px', fontSize: '12px', color: '#5e6c84'}}>Nhắc nhở</label>
                                            <select value={reminder} onChange={(e) => setReminder(e.target.value)} style={{width: '100%', marginBottom: '12px', padding: '4px'}}>
                                                <option value="none">Không có</option>
                                                <option value="at">Vào thời điểm hết hạn</option>
                                                <option value="5">5 phút trước</option>
                                                <option value="10">10 phút trước</option>
                                                <option value="15">15 phút trước</option>
                                                <option value="60">1 giờ trước</option>
                                                <option value="120">2 giờ trước</option>
                                            </select>

                                            <div style={{display: 'flex', justifyContent: 'space-between', gap: '8px'}}>
                                                <button className="btn primary small" style={{flex: 1}} onClick={() => saveDate(item.id)}>Lưu</button>
                                                <button className="btn small" style={{flex: 1}} onClick={() => removeDate(item.id)}>Gỡ bỏ</button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            )}
                        </Draggable>
                    ))}
                    {p.placeholder}
                </div>
            )}
        </Droppable>
    );
}


function AddChecklistItem({ onAdd }) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");

    if (!open) return <button className="btn-add-item" onClick={() => setOpen(true)}>+ Thêm một mục</button>;

    const handleSubmit = () => {
        if (!text.trim()) return;
        onAdd(text);
        setText("");
    };

    return (
        <div className="add-item-box">
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Thêm một mục..."
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                    if (e.key === "Escape") setOpen(false);
                }}
            />
            <div className="actions">
                <button className="btn primary" onClick={handleSubmit}>Thêm</button>
                <button className="btn" onClick={() => setOpen(false)}>Hủy</button>
            </div>
        </div>
    );
}

function Checklist({ checklist, index, checklists, setChecklists, dragHandleProps }) {
    const [editing, setEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState(checklist.title);

    const doneCount = checklist.items ? checklist.items.filter(i => i.done).length : 0;
    const totalCount = checklist.items ? checklist.items.length : 0;
    const percent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

    const saveTitle = async () => {
        if (!tempTitle.trim() || tempTitle === checklist.title) {
            setEditing(false);
            setTempTitle(checklist.title);
            return;
        }

        const oldTitle = checklist.title;
        const newChecklists = [...checklists];
        newChecklists[index].title = tempTitle;
        setChecklists(newChecklists);
        setEditing(false);

        try {
            await taskService.updateTitle(checklist.id, tempTitle);
        } catch (error) {
            console.error(error);
            newChecklists[index].title = oldTitle;
            setChecklists([...newChecklists]);
            setTempTitle(oldTitle);
        }
    };

    const removeChecklist = async () => {
        if (!window.confirm(`Bạn có chắc muốn xóa nhóm "${checklist.title}"?`)) return;

        const oldChecklists = [...checklists];
        setChecklists(prev => prev.filter(c => c.id !== checklist.id));

        try {
            await taskService.delete(checklist.id);
        } catch (error) {
            console.error(error);
            setChecklists(oldChecklists);
            alert("Lỗi khi xóa nhóm việc!");
        }
    };

    const addItem = async (text) => {
        try {
            const response = await subTaskService.create({
                taskId: checklist.id,
                title: text
            });

            const newSubTask = response.data.value || response.data;
            
            const itemToAdd = {
                id: newSubTask.id,
                title: newSubTask.title,
                text: newSubTask.title,
                done: false,
                status: 1,
                position: newSubTask.position || 0,
                dueDate: null,
                reminderEnabled: false,
                reminderBeforeMinutes: 0
            };

            setChecklists(prev =>
                prev.map((cl, i) =>
                    i === index
                        ? { ...cl, items: [...(cl.items || []), itemToAdd] }
                        : cl
                )
            );
        } catch (error) {
            console.error("Lỗi tạo subtask:", error);
            alert("Tạo mục mới thất bại!");
        }
    };

    return (
        <div className="checklist">
            <div className="checklist-header">
                <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div {...dragHandleProps} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: '#42526e' }}>
                        <SquareCheckBig size={20} />
                    </div>
                    
                    {editing ? (
                        <input
                            className="edit-input"
                            autoFocus
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={saveTitle}
                            onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                        />
                    ) : (
                        <h3 
                            onClick={() => setEditing(true)} 
                            style={{ margin: 0, cursor: 'pointer', flex: 1, fontSize: '16px', fontWeight: 600 }}
                        >
                            {checklist.title}
                        </h3>
                    )}
                </div>

                {!editing && (
                    <div className="header-actions">
                        <button className="btn-icon" onClick={removeChecklist} title="Xóa danh sách">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div className="progress-row">
                <span style={{fontSize: '11px', color: '#5e6c84', minWidth: '35px'}}>{percent}%</span>
                <div className="progress-bar">
                    <div 
                        className="progress-bar-percent" 
                        style={{ 
                            width: `${percent}%`,
                            backgroundColor: percent === 100 ? '#61bd4f' : '#5ba4cf',
                            transition: 'width 0.2s ease-in'
                        }} 
                    />
                </div>
            </div>

            <ChecklistItems 
                checklist={checklist} 
                index={index} 
                checklists={checklists} 
                setChecklists={setChecklists} 
            />
            
            <AddChecklistItem onAdd={addItem} />
        </div>
    );
}

const ChecklistSection = ({ checklists, setChecklists, cardId }) => {
    const [adding, setAdding] = useState(false);
    const [title, setTitle] = useState("");

    const addChecklist = async () => {
        if (!title.trim()) return;

        try {
            const response = await taskService.create({
                cardId: cardId,
                title: title
            });

            const newTask = response.data.value || response.data;

            setChecklists([
                ...checklists,
                { 
                    id: newTask.id, 
                    title: newTask.title, 
                    items: [],
                    position: newTask.position || checklists.length
                }
            ]);
            
            setTitle("");
            setAdding(false);
        } catch (error) {
            console.error("Lỗi tạo checklist:", error);
            alert("Không thể tạo danh sách việc cần làm!");
        }
    };

    return (
        <div className="checklist-section">
            <Droppable droppableId="checklist-section-drop" type="CHECKLIST_GROUP">
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        {checklists.map((cl, i) => (
                            <Draggable key={cl.id} draggableId={cl.id} index={i}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        style={{ 
                                            marginBottom: '24px', 
                                            ...provided.draggableProps.style 
                                        }}
                                    >
                                        <Checklist
                                            checklist={cl}
                                            index={i}
                                            setChecklists={setChecklists}
                                            checklists={checklists}
                                            dragHandleProps={provided.dragHandleProps} 
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

            {adding ? (
                <div className="add-checklist-form" style={{ marginTop: '12px' }}>
                    <input
                        className="edit-input"
                        autoFocus
                        placeholder="Tiêu đề việc cần làm"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") addChecklist();
                            if (e.key === "Escape") setAdding(false);
                        }}
                    />
                    <div className="add-actions" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <button className="btn primary" onClick={addChecklist}>Thêm</button>
                        <button className="btn" onClick={() => setAdding(false)}>Hủy</button>
                    </div>
                </div>
            ) : (
                <button 
                    className="btn add-checklist" 
                    onClick={() => setAdding(true)}
                    style={{ background: '#091e420f', color: '#172b4d', marginTop: '12px', width: '100%', justifyContent: 'flex-start' }}
                >
                    Thêm việc cần làm
                </button>
            )}
        </div>
    );
};

export default ChecklistSection;