import React from 'react';
import './WorkspaceHeader.css';
import { Briefcase } from 'lucide-react';

export default function WorkspaceHeader() {
    return (
        <div className="workspace-header">
            <div className="wh-left">
                <div className="wh-icon"><Briefcase size={18} /></div>
                <div className="wh-titles">
                    <div className="wh-title">Workspaces</div>
                    <div className="wh-sub">Quản lý không gian làm việc của bạn</div>
                </div>
            </div>
            <div className="wh-right">
                <input className="wh-search" placeholder="Tìm kiếm workspace" />
            </div>
        </div>
    );
}