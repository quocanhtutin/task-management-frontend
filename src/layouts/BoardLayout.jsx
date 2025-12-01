import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/SideBar/SideBar';
import './BoardLayout.css'

const BoardLayout = () => {
    return (
        <div className="app">
            <Navbar />
            <Outlet />
        </div>
    );
};

export default BoardLayout;