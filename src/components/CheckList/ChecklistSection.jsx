import { Plus, X, Clock, User, Trash2, Pencil, SquareCheckBig } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import './ChecklistSection.css'

function ChecklistItems({ checklist, index, checklists, setChecklists }) {
    const [editingId, setEditingId] = useState(null);
    const [tempText, setTempText] = useState("");

    const toggleDone = (itemId) => {
        setChecklists(prev =>
            prev.map((cl, i) =>
                i !== index
                    ? cl
                    : {
                        ...cl,
                        items: cl.items.map(it =>
                            it.id === itemId ? { ...it, done: !it.done } : it
                        )
                    }
            )
        );
    };

    const saveEdit = (itemId) => {
        setChecklists(prev =>
            prev.map((cl, i) =>
                i !== index
                    ? cl
                    : {
                        ...cl,
                        items: cl.items.map(it =>
                            it.id === itemId ? { ...it, text: tempText } : it
                        )
                    }
            )
        );
        setEditingId(null);
    };

    return (
        <Droppable droppableId={checklist.id} type="ITEM">
            {(p) => (
                <div ref={p.innerRef} {...p.droppableProps}>
                    {checklist.items.map((item, i) => (
                        <Draggable draggableId={item.id} index={i} key={item.id}>
                            {(p) => (
                                <div
                                    ref={p.innerRef}
                                    {...p.draggableProps}
                                    {...p.dragHandleProps}
                                    className="checklist-item"
                                >
                                    <input
                                        type="checkbox"
                                        checked={item.done}
                                        onChange={() => toggleDone(item.id)}
                                    />

                                    {editingId === item.id ? (
                                        <input
                                            className="edit-input"
                                            autoFocus
                                            value={tempText}
                                            onChange={(e) => setTempText(e.target.value)}
                                            onBlur={() => saveEdit(item.id)}
                                            onKeyDown={(e) => e.key === "Enter" && saveEdit(item.id)}
                                        />
                                    ) : (
                                        <span
                                            className={item.done ? "done" : ""}
                                            onDoubleClick={() => {
                                                setEditingId(item.id);
                                                setTempText(item.text);
                                            }}
                                        >
                                            {item.text}
                                        </span>
                                    )}

                                    <div className="item-actions">
                                        <Clock size={16} />
                                        <User size={16} />
                                    </div>
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

    if (!open)
        return <button className="btn-add-item" onClick={() => setOpen(true)}>+ Thêm mục</button>;

    return (
        <div className="add-item-box">
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Thêm một mục"
            />

            <div className="actions">
                <button
                    className="btn primary"
                    onClick={() => {
                        if (!text.trim()) return;
                        onAdd(text);
                        setText("");
                        setOpen(false);
                    }}
                >
                    Thêm
                </button>
                <button className="btn" onClick={() => setOpen(false)}>Hủy</button>
                <Clock size={18} />
                <User size={18} />
            </div>
        </div>
    );
}



function Checklist({ checklist, index, checklists, setChecklists }) {
    const [editing, setEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState(checklist.title);

    const doneCount = checklist.items.filter(i => i.done).length;
    const percent = checklist.items.length
        ? Math.round((doneCount / checklist.items.length) * 100)
        : 0;

    const saveTitle = () => {
        setChecklists(prev =>
            prev.map((cl, i) =>
                i === index ? { ...cl, title: tempTitle } : cl
            )
        );
        setEditing(false);
    };

    const removeChecklist = () => {
        setChecklists(prev => prev.filter(c => c.id !== checklist.id));
    };

    const addItem = (text) => {
        setChecklists(prev =>
            prev.map((cl, i) =>
                i === index
                    ? {
                        ...cl,
                        items: [
                            ...cl.items,
                            { id: crypto.randomUUID(), text, done: false }
                        ]
                    }
                    : cl
            )
        );
    };

    return (
        <div className="checklist">
            <div className="checklist-header">
                <SquareCheckBig size={18} />
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
                    <h3>{checklist.title}</h3>
                )}

                {!editing && (
                    <div className="header-actions">
                        <Pencil size={16} onClick={() => setEditing(true)} />
                        <Trash2 size={16} onClick={removeChecklist} />
                    </div>
                )}
            </div>

            <div className="progress-row">
                <span>{percent}%</span>
                <div className="progress-bar">
                    <div className="progress-bar-percent" style={{ width: `${percent}%` }} />
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



const ChecklistSection = ({ checklists, setChecklists }) => {
    const [adding, setAdding] = useState(false);
    const [title, setTitle] = useState("");

    const addChecklist = () => {
        if (!title.trim()) return;
        setChecklists([
            ...checklists,
            { id: crypto.randomUUID(), title, items: [] }
        ]);
        setTitle("");
        setAdding(false);
    };

    return (
        <div className="checklist-section">
            {checklists.map((cl, i) => (
                <Checklist
                    key={cl.id}
                    checklist={cl}
                    index={i}
                    setChecklists={setChecklists}
                    checklists={checklists}
                />
            ))}

            {adding ? (
                <input
                    className="edit-input"
                    autoFocus
                    placeholder="Tiêu đề việc cần làm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={addChecklist}
                    onKeyDown={(e) => e.key === "Enter" && addChecklist()}
                />
            ) : (
                <button className="btn add-checklist" onClick={() => setAdding(true)}>
                    + Thêm việc cần làm
                </button>
            )}
        </div>
    );
};


export default ChecklistSection
