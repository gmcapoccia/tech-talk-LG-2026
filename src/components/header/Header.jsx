import React from 'react';
import './Header.scss';

const Header = ({
    datasetSize, 
    setDatasetSize, 
    updateRate, 
    setUpdateRate, 
    mode, 
    setMode}) => {
  
  const datasetOptions = [100, 500, 1000, 5000, 10000];
  const rateOptions = [
    { label: '10/s', value: 10 },
    { label: '100/s', value: 100 },
    { label: '500/s', value: 500 },
    { label: '1.000/s', value: 1000 }
  ];

  return (
    <header className="dashboard-header">
      <div className="header-top">
        <div className="brand">
          <div className="logo-container">
            <svg className="react-logo" viewBox="-11.5 -10.23174 23 20.46348">
              <circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
              <g stroke="#61dafb" strokeWidth="1" fill="none">
                <ellipse rx="11" ry="4.2"/>
                <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
                <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
              </g>
            </svg>
          </div>
          <div className="brand-info">
            <div className="title-row">
              <h1>Tech Talk LG - 2026</h1>
              <span className="badge">Virtual DOM</span>
            </div>
            <div className="subtitle-row">
              <span className="subtitle">Market Dashboard</span>
              <span className="description">Component re-rendering</span>
            </div>
          </div>
        </div>

        <div className="mode-toggle">
          <button
            className={`toggle-btn ${mode === 'live' ? 'active' : ''}`}
            onClick={() => setMode('live')}
          >
            Live Data
          </button>
          <button
            className={`toggle-btn ${mode === 'benchmark' ? 'active' : ''}`}
            onClick={() => setMode('benchmark')}
          >
            Benchmark
          </button>
        </div>
      </div>

      <div className="controls-bar">
        <div className="control-group">
          <span className="group-label">Dataset size</span>
          <div className="btn-group">
            {datasetOptions.map((size) => (
              <button
                key={size}
                className={`control-btn ${datasetSize === size ? 'active' : ''}`}
                onClick={() => setDatasetSize(size)}
              >
                {size.toLocaleString('it-IT')}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <span className="group-label">Update rate</span>
          <div className="btn-group">
            {rateOptions.map((option) => (
              <button
                key={option.value}
                className={`control-btn ${updateRate === option.value ? 'active' : ''}`}
                onClick={() => setUpdateRate(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;