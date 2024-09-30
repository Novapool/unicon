import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Converter from './components/Converter';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Converter />} />
      </Routes>
    </Router>
  );
}