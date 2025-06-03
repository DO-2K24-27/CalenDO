import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import CalendarPage from './pages/CalendarPage';
import CountdownPage from './pages/CountdownPage';
import { CalendarProvider } from './contexts/CalendarContext';

function App() {
  return (
    <Router>
      <CalendarProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<CalendarPage />} />
            <Route path="countdown" element={<CountdownPage />} />
          </Route>
        </Routes>
      </CalendarProvider>
    </Router>
  );
}

export default App;