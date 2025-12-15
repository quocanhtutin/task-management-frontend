import React, { useState, useEffect } from 'react'
import './ManagementTable.css'
import { useSearchParams } from 'react-router-dom'
import Inbox from '../../components/Inbox/Inbox.jsx'
import Planner from '../../components/Planner/Planner.jsx'
import TaskBoard from '../../components/TaskBoard/TaskBoard.jsx'
import CardDetailPopup from '../../components/CardDetailPopup/CardDetailPopup.jsx'
import SharingPopup from '../../components/SharingPopup/SharingPopup.jsx'
import MenuBoardPopup from '../../components/MenuBoardPopup/MenuBoardPopup.jsx'

const ManagementTable = () => {

    const [showCardDetailPopup, setShowCardDetailPopup] = useState(false)
    const [cardDetail, setCardDetail] = useState({})

    const [showSharePopup, setShowSharePopup] = useState(false);

    const [showMenuBoardPopup, setShowMenuBoardPopup] = useState(false)

    const [columns, setColumns] = useState([
        { id: crypto.randomUUID(), title: 'Hướng dẫn', cards: ['Bắt đầu sử dụng Trello', 'Học cách dùng Trello'], addCard: false, storedDate: null },
        { id: crypto.randomUUID(), title: 'Hôm nay', cards: [], addCard: false, storedDate: null },
        { id: crypto.randomUUID(), title: 'Tuần này', cards: [], addCard: false, storedDate: null },
        { id: crypto.randomUUID(), title: 'Sau này', cards: [], addCard: false, storedDate: null },
    ]);

    const [cards, setCards] = useState([
        {
            id: null,
            title: null,
            columnId: null,
            label: [],
            members: [],
            deadline: null,
            checked: false,
            description: null,
            edit: false,
            storedDate: null
        }
    ])

    const [storedCards, setStoredCards] = useState([])
    const [storedColumns, setStoredColumns] = useState([])

    useEffect(() => {
        const updatedColumns = columns.map(column => ({
            ...column,
            cards: column.cards.map(card => ({
                id: crypto.randomUUID(),
                title: card,
                columnId: column.id,
                label: [],
                members: [],
                deadline: null,
                check: false,
                description: false,
                edit: false,
                storedDate: null
            }))
        }));

        setColumns(updatedColumns);
    }, []);

    useEffect(() => {
        const allCards = columns.flatMap(column => column.cards);
        setCards(allCards);
        console.log(columns)
    }, [columns]);

    const [showInbox, setShowInbox] = useState(false);
    const [showPlanner, setShowPlanner] = useState(false);

    const [searchParams] = useSearchParams()
    const [rawColor, setRawColor] = useState(decodeURIComponent(searchParams.get("color")))

    const [isStarred, setIsStarred] = useState(false)

    const [boardDes, setBoardDes] = useState("")

    const labelColors = ["#FF7043", "#FFA726", "#FFEB3B", "#66BB6A", "#42A5F5", "#AB47BC"];

    const [labels, setLabels] = useState([])

    useEffect(() => {
        setLabels(
            labelColors.map(color => ({
                id: crypto.randomUUID(),
                color,
                title: null
            }))
        )
    }, [])


    const updateCardInColumn = (columnId, cardId, field, value) => {
        setColumns(prev =>
            prev.map(col =>
                col.id === columnId
                    ? {
                        ...col,
                        cards: col.cards.map(card =>
                            card.id === cardId
                                ? { ...card, [field]: value }
                                : card
                        )
                    }
                    : col
            )
        );
        console.log(field, value)
    };

    const storeCard = (card) => {
        const now = new Date().toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
        const updated = [...columns]
        const col = updated.findIndex(c => c.id === card.columnId)
        const cardIndex = updated[col].cards.findIndex(c => c.id === card.id)
        const [movedCard] = updated[col].cards.splice(cardIndex, 1);
        const storedCard = { ...movedCard, storedDate: now }
        setStoredCards(prev => [...prev, storedCard])
        setColumns(updated)
    }

    const activateCard = (cardIdex) => {
        const store = [...storedCards]
        const [movedCard] = store.splice(cardIdex, 1)
        setStoredCards(store)
        const updated = [...columns]
        const col = updated.findIndex(c => c.id === movedCard.columnId)
        updated[col].cards.push({ ...movedCard, storedDate: null });
        setColumns(updated)
    }

    const storeColumn = (columnIdex) => {
        const now = new Date().toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
        const updated = [...columns]
        const [col] = updated.splice(columnIdex, 1)
        const storeCol = { ...col, storedDate: now }
        setStoredColumns(pre => [...pre, storeCol])
        setColumns(updated)
    }

    const activateColumn = (columnIdex) => {
        const store = [...storedColumns]
        const [col] = store.splice(columnIdex, 1)
        setStoredColumns(store)
        const updated = [...columns]
        updated.push({ ...col, storedDate: null })
        setColumns(updated)
    }

    useState(() => {
        console.log(storedColumns)
    }, [storedColumns])

    const addNewList = (listTitle) => {
        if (listTitle) setColumns([...columns, { id: crypto.randomUUID(), title: listTitle, cards: [], addCard: false, storedDate: null }]);
    }

    const addCard = (col, cardTitle) => {
        if (cardTitle.trim()) {
            const updated = [...columns];
            updated[col].cards.push({
                id: crypto.randomUUID(),
                title: cardTitle,
                columnId: updated[col].id,
                label: [],
                members: [],
                deadline: null,
                check: false,
                description: null,
                edit: false,
                storedDate: null
            });
            setColumns(updated);
        }
    }

    const updateTitleColumn = (colId, newTitle) => {
        setColumns(cols =>
            cols.map(c =>
                c.id === colId ? { ...c, title: newTitle } : c
            )
        );
    }

    const addLabel = (color, title) => {
        setLabels(pre => [...pre, { id: crypto.randomUUID(), color: color, title: title }])
    }

    const deleteLabel = (labelId) => {
        setLabels(labels.filter(label => label.id !== labelId))
    }

    const updateLabel = (labelId, labelColor, labelTitle) => {
        const newLabels = labels.map(l => l.id === labelId ? { ...l, color: labelColor, title: labelTitle } : l)
        setLabels(newLabels)
    }

    const boardWide = (!showInbox && !showPlanner) ? "full-board" : (!showInbox || !showPlanner) ? "wide-board" : "normal-board"

    return (
        <div className="man-table-container">
            {showCardDetailPopup &&
                <CardDetailPopup
                    card={cardDetail}
                    onClose={() => setShowCardDetailPopup(false)}
                    updateCardInColumn={updateCardInColumn}
                    columns={columns}
                    setColumns={setColumns}
                    storeCard={storeCard}
                    labels={labels}
                    setLabels={setLabels}
                    addLabel={addLabel}
                    updateLabel={updateLabel}
                />}
            {showSharePopup && <SharingPopup onClose={() => setShowSharePopup(false)} />}
            {showMenuBoardPopup &&
                <MenuBoardPopup
                    onClose={() => setShowMenuBoardPopup(false)}
                    setShowSharePopup={setShowSharePopup}
                    setRawColor={setRawColor}
                    rawColor={rawColor}
                    setIsStarred={setIsStarred}
                    isStarred={isStarred}
                    boardDes={boardDes}
                    setBoardDes={setBoardDes}
                    storedCards={storedCards}
                    setShowCardDetailPopup={setShowCardDetailPopup}
                    setCardDetail={setCardDetail}
                    activateCard={activateCard}
                    storedColumns={storedColumns}
                    activateColumn={activateColumn}
                    labels={labels}
                    addLabel={addLabel}
                    deleteLabel={deleteLabel}
                    updateLabel={updateLabel}
                />
            }

            <div className={`main-content ${boardWide}`}>
                {showInbox && (
                    <Inbox onClose={() => setShowInbox(false)} />
                )}

                {showPlanner && (
                    <Planner onClose={() => setShowPlanner(false)} />
                )}

                <TaskBoard
                    cards={cards}
                    setCards={setCards}
                    setShowCardDetailPopup={setShowCardDetailPopup}
                    setCardDetail={setCardDetail}
                    updateCardInColumn={updateCardInColumn}
                    columns={columns}
                    setColumns={setColumns}
                    addNewList={addNewList}
                    addCard={addCard}
                    setShowSharePopup={setShowSharePopup}
                    setShowMenuBoardPopup={setShowMenuBoardPopup}
                    rawColor={rawColor}
                    isStarred={isStarred}
                    setIsStarred={setIsStarred}
                    storeCard={storeCard}
                    storeColumn={storeColumn}
                    updateTitleColumn={updateTitleColumn}
                />
            </div>

            <div className="toggle-floating-panel">
                {!showInbox && (
                    <div className="toggle-icon" onClick={() => setShowInbox(true)}>
                        Inbox
                    </div>
                )}
                {!showPlanner && (
                    <div className="toggle-icon" onClick={() => setShowPlanner(true)}>
                        Planner
                    </div>
                )}
            </div>
        </div>
    )
}

export default ManagementTable
