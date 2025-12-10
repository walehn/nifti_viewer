import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { LocalViewerPage } from '@/pages/LocalViewerPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/local" element={<LocalViewerPage />} />
        <Route path="/research" element={<div className="p-8 text-center">Research Mode - Coming Soon</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
