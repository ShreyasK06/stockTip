import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StockList from './StockList';
import StockDetail from './StockDetail';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<StockList />} />
        <Route path="/stock/:symbol" element={<StockDetail />} />
      </Routes>
    </div>
  );
}

export default App;