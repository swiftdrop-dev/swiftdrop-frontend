import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Welcome to SwiftDrop</div>} />
      </Routes>
    </BrowserRouter>
  );
};
