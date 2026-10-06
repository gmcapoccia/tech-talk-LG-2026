import React from 'react';
import './Box.scss';

const Box = ({label, value}) => {
    return (
        <div className="box">
            <p className="label">{label}</p>
            <p className="value">{value}</p>
        </div>
    );
}

export default Box;