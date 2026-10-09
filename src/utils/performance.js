export const getFpsStatus = (fps) => {
    if (fps >= 50) return 'green';
    if (fps >= 30) return 'yellow';
    return 'red';
};

export const getMemoryStatus = (memoryMb) => {
    const numericValue = parseFloat(memoryMb);
    if (isNaN(numericValue)) return null;
    
    if (numericValue < 150) return 'green';
    if (numericValue <= 300) return 'yellow';
    return 'red';
};