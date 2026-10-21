import "./Section.scss";
import Box from "../box/Box";
import { getFpsStatus, getMemoryStatus, getCpuStatus } from "../../utils/performance";

const Section = ({ fps, cpuLoad, memory }) => {
    return (
        <div className="section">
            <Box label="FPS" value={fps} status={getFpsStatus(fps)} />
            <Box label="CPU (tab)" value={`${cpuLoad}%`} status={getCpuStatus(cpuLoad)} />
            <Box label="Memory" value={`${memory.toFixed(2)} MB`} status={getMemoryStatus(memory)} />
        </div>
    );
};

export default Section;