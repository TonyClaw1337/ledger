import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  PieChart, 
  Menu, 
  X 
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Budget from './pages/Budget'
import Transactions from './pages/Transactions'
import Income from './pages/Income'
import Reports from './pages/Reports'

const Navigation = () => {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/budget', label: 'Budget', icon: DollarSign },
    { path: '/transactions', label: 'Transaktionen', icon: Receipt },
    { path: '/income', label: 'Einkommen', icon: TrendingUp },
    { path: '/reports', label: 'Übersicht', icon: PieChart }
  ]

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <nav className="nav">
      <Link to="/" className="nav-brand" onClick={closeMenu}>
        LEDGER
      </Link>
      
      {/* Desktop Navigation */}
      <ul className="nav-links desktop-nav">
        {navItems.map(item => {
          const IconComponent = item.icon
          return (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <IconComponent size={16} />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mobile-nav"
          >
            <ul className="mobile-nav-links">
              {navItems.map(item => {
                const IconComponent = item.icon
                return (
                  <li key={item.path}>
                    <Link 
                      to={item.path} 
                      className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                      onClick={closeMenu}
                    >
                      <IconComponent size={16} />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="main"
  >
    {children}
  </motion.div>
)

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={
              <PageWrapper>
                <Dashboard />
              </PageWrapper>
            } />
            <Route path="/budget" element={
              <PageWrapper>
                <Budget />
              </PageWrapper>
            } />
            <Route path="/transactions" element={
              <PageWrapper>
                <Transactions />
              </PageWrapper>
            } />
            <Route path="/income" element={
              <PageWrapper>
                <Income />
              </PageWrapper>
            } />
            <Route path="/reports" element={
              <PageWrapper>
                <Reports />
              </PageWrapper>
            } />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  )
}

export default App