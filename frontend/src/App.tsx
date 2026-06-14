import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Segments from './pages/Segments'
import Campaigns from './pages/Campaigns'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import Assistant from './pages/Assistant'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="orders" element={<Orders />} />
          <Route path="segments" element={<Segments />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
