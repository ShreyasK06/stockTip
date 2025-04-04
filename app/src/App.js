import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import StockList from './StockList';
import StockDetail from './StockDetail';
import './App.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <StockList />,
  },
  {
    path: "/stock/:symbol",
    element: <StockDetail />,  // Remove stockNames prop
  },
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
