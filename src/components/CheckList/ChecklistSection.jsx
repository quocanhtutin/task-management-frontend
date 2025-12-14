import { Plus, X, Clock, User } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import './ChecklistSection.css'

function ChecklistItems({ checklist, index, checklists, setChecklists }) {
    const toggleDone = (itemId) => {
        const updated = [...checklists];
        const item = updated[index].items.find(i => i.id === itemId);
        item.done = !item.done;
        setChecklists(updated);
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

                                    <span className={item.done ? "done" : ""}>
                                        {item.text}
                                    </span>

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
        return <button onClick={() => setOpen(true)}>Thêm một mục</button>;

    return (
        <div className="add-item-box">
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Thêm công việc..."
            />

            <div className="actions">
                <button
                    className="btn primary"
                    onClick={() => {
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
    const doneCount = checklist.items.filter(i => i.done).length;
    const percent = checklist.items.length
        ? Math.round((doneCount / checklist.items.length) * 100)
        : 0;

    const addItem = (text) => {
        const updated = [...checklists];
        updated[index].items.push({
            id: crypto.randomUUID(),
            text,
            done: false,
            members: [],
            deadline: null
        });
        setChecklists(updated);
    };

    return (
        <div className="checklist">
            <h3>{checklist.title}</h3>

            {/* Progress */}
            <div className="progress-row">
                <span>{percent}%</span>
                <div className="progress-bar">
                    <div style={{ width: `${percent}%` }} />
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
    const addChecklist = () => {
        setChecklists([
            ...checklists,
            { id: crypto.randomUUID(), title: "Việc cần làm", items: [] }
        ]);
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

            <button className="btn add-checklist" onClick={addChecklist}>
                + Thêm việc cần làm
            </button>
        </div>
    );
}

export default ChecklistSection
