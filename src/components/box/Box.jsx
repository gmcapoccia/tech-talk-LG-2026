import React from 'react';
import './Box.scss';

const Box = ({ label, value, status }) => {
    return (
        <div className="box">
            <p className="label">{label}</p>
            <p className={`value ${status ? `status-${status}` : ''}`}>{value}</p>
        </div>
    );
}

export default Box;