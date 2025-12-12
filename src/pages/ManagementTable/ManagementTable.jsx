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
        { title: 'Hướng dẫn', cards: ['Bắt đầu sử dụng Trello', 'Học cách dùng Trello'], addCard: false },
        { title: 'Hôm nay', cards: [], addCard: false },
        { title: 'Tuần này', cards: [], addCard: false },
        { title: 'Sau này', cards: [], addCard: false },
    ]);

    const [cards, setCards] = useState([
        {
            id: null,
            title: null,
            column: null,
            label: null,
            members: [],
            deadline: null,
            checked: false,
            description: null,
            edit: false,
            storedDate: null
        }
    ])

    const [storedCards, setStoredCards] = useState([])

    useEffect(() => {
        const updatedColumns = columns.map(column => ({
            ...column,
            cards: column.cards.map(card => ({
                id: crypto.randomUUID(),
                title: card,
                column: column.title,
                label: null,
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
    }, [columns]);

    const [showInbox, setShowInbox] = useState(false);
    const [showPlanner, setShowPlanner] = useState(false);

    const [searchParams] = useSearchParams()
    const [rawColor, setRawColor] = useState(decodeURIComponent(searchParams.get("color")))

    const [isStarred, setIsStarred] = useState(false);

    const [boardDes, setBoardDes] = useState("")

    const updateCardInColumn = (columnTitle, cardId, field, value) => {
        setColumns(prev =>
            prev.map(col =>
                col.title === columnTitle
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
        const col = updated.findIndex(c => c.title === card.column)
        const cardIndex = updated[col].cards.findIndex(c => c.id === card.id)
        const [movedCard] = updated[col].cards.splice(cardIndex, 1);
        const storedCard = { ...movedCard, storedDate: now }
        setStoredCards(prev => [...prev, storedCard])
        setColumns(updated)
    }

    useState(() => {
        console.log(storedCards)
    }, [storedCards])

    const addNewList = (listTitle) => {
        if (listTitle) setColumns([...columns, { title: listTitle, cards: [] }]);
    }

    const addCard = (col, cardTitle) => {
        if (cardTitle.trim()) {
            const updated = [...columns];
            updated[col].cards.push({
                id: crypto.randomUUID(),
                title: cardTitle,
                column: updated[col].title,
                label: null,
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
