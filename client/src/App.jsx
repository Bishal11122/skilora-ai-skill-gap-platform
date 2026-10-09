import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SetupCheck from './pages/SetupCheck';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SetupCheck />} />
      </Routes>
    </BrowserRouter>
  );
}
