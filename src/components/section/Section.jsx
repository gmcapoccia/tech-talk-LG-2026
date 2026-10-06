import React from "react";
import "./Section.scss";
import Box from "../box/Box";

const Section = (props) => {
    const { datasetSize, updateRate, fps, updateTime,memory } = props;

    return (
        <div className="section">
            <Box label="Dataset Size" value={datasetSize} />
            <Box label="Update Rate" value={updateRate} />
            <Box label="FPS" value={fps} />
            <Box label="Update Time" value={`${updateTime.toFixed(2)} ms`} />
            <Box label="Memory" value={`${memory.toFixed(2)} MB`} />

        </div>
    );
};

export default Section;