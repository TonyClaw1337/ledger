import React, { useState, useEffect } from 'react'
import { Plus, Filter, Calendar, Search, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react'
import { motion } from 'framer-motion'
import Toast from '../components/Toast'

const Transactions = () => {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      amount: -45.50,
      description: 'REWE Supermarkt',
      category: 'Ernährung',
      category_color: '#06b6d4',
      date: '2026-02-19',
      type: 'expense'
    },
    {
      id: 2,
      amount: -12.00,
      description: 'Kfz-Steuer',
      category: 'Auto',
      category_color: '#10b981',
      date: '2026-02-18',
      type: 'expense'
    },
    {
      id: 3,
      amount: 1024.00,
      description: 'Gehalt',
      category: 'Einkommen',
      category_color: '#22c55e',
      date: '2026-02-15',
      type: 'income'
    },
    {
      id: 4,
      amount: -500.00,
      description: 'Miete Februar',
      category: 'Wohnen',
      category_color: '#ef4444',
      date: '2026-02-01',
      type: 'expense'
    },
    {
      id: 5,
      amount: -35.80,
      description: 'Restaurant Besuch',
      category: 'Lifestyle',
      category_color: '#f59e0b',
      date: '2026-01-28',
      type: 'expense'
    },
    {
      id: 6,
      amount: -89.99,
      description: 'Tankstelle',
      category: 'Auto',
      category_color: '#10b981',
      date: '2026-01-25',
      type: 'expense'
    }
  ])

  const [filteredTransactions, setFilteredTransactions] = useState(transactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [toast, setToast] = useState(null)

  const categories = [
    'Alle',
    'Einkommen',
    'Wohnen',
    'Auto',
    'Ernährung',
    'Lifestyle',
    'Versicherungen',
    'Abos',
    'Spenden',
    'Rücklagen'
  ]

  useEffect(() => {
    let filtered = transactions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'Alle') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'amount':
          aValue = Math.abs(a.amount)
          bValue = Math.abs(b.amount)
          break
        case 'description':
          aValue = a.description.toLowerCase()
          bValue = b.description.toLowerCase()
          break
        case 'category':
          aValue = a.category.toLowerCase()
          bValue = b.category.toLowerCase()
          break
        default: // date
          aValue = new Date(a.date)
          bValue = new Date(b.date)
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, selectedCategory, sortBy, sortOrder])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getMonthlyTotal = (type = null) => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date)
        const matchesMonth = transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
        const matchesType = type ? t.type === type : true
        return matchesMonth && matchesType
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const AddTransactionForm = () => {
    const [formData, setFormData] = useState({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense'
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      // TODO: Submit to API
      console.log('New transaction:', formData)
      
      // Show success toast
      setToast({
        type: 'success',
        title: 'Transaktion hinzugefügt',
        message: `${formData.type === 'expense' ? 'Ausgabe' : 'Einnahme'} "${formData.description}" wurde erfolgreich gespeichert.`
      })
      
      setShowAddTransaction(false)
      setFormData({
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
      })
    }

    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Neue Transaktion</h3>
          <button 
            onClick={() => setShowAddTransaction(false)}
            className="btn btn-ghost"
            style={{ marginLeft: 'auto' }}
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                Typ
              </label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="input"
                required
              >
                <option value="expense">Ausgabe</option>
                <option value="income">Einnahme</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                Betrag (€)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="input"
                step="0.01"
                placeholder="0,00"
                required
              />
            </div>
          </div>
          
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
              Beschreibung
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input"
              placeholder="z.B. Supermarkt Einkauf"
              required
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                Kategorie
              </label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="input"
                required
              >
                <option value="">Wählen...</option>
                {categories.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                Datum
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="input"
                required
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              Transaktion hinzufügen
            </button>
            <button 
              type="button" 
              onClick={() => setShowAddTransaction(false)}
              className="btn btn-secondary"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '2rem', 
            fontWeight: '700', 
            marginBottom: '0.5rem' 
          }}>
            Transaktionen
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Alle Ein- und Ausgaben im Überblick
          </p>
        </div>
        <button 
          onClick={() => setShowAddTransaction(true)}
          className="btn btn-primary desktop-add-btn"
        >
          <Plus size={16} />
          Transaktion hinzufügen
        </button>
      </div>

      {/* Floating Add Button for Mobile */}
      <button
        className="floating-add-btn"
        onClick={() => setShowAddTransaction(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--accent)',
          color: 'var(--bg)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(229, 160, 13, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)'
          e.target.style.boxShadow = '0 6px 25px rgba(229, 160, 13, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)'
          e.target.style.boxShadow = '0 4px 20px rgba(229, 160, 13, 0.3)'
        }}
      >
        <Plus size={24} />
      </button>

      {/* Monthly Summary */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Einnahmen (Februar)
            </p>
            <p className="currency positive" style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              {formatCurrency(getMonthlyTotal('income'))}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Ausgaben (Februar)
            </p>
            <p className="currency negative" style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              {formatCurrency(getMonthlyTotal('expense'))}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Saldo
            </p>
            <p className="currency positive" style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              {formatCurrency(getMonthlyTotal('income') - getMonthlyTotal('expense'))}
            </p>
          </div>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showAddTransaction && (
        <div style={{ marginBottom: '2rem' }}>
          <AddTransactionForm />
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
              <Search size={14} style={{ marginRight: '0.5rem' }} />
              Suchen
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              placeholder="Beschreibung oder Kategorie..."
            />
          </div>
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
              <Filter size={14} style={{ marginRight: '0.5rem' }} />
              Kategorie
            </label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              {categories.map(cat => (
                <option key={cat} value={cat === 'Alle' ? '' : cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
              }}
              className="btn btn-ghost"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">
            {filteredTransactions.length} Transaktionen
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Sortieren:</span>
            <button
              onClick={() => toggleSort('date')}
              className={`btn btn-ghost ${sortBy === 'date' ? 'active' : ''}`}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              Datum {sortBy === 'date' && <ArrowUpDown size={12} />}
            </button>
            <button
              onClick={() => toggleSort('amount')}
              className={`btn btn-ghost ${sortBy === 'amount' ? 'active' : ''}`}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              Betrag {sortBy === 'amount' && <ArrowUpDown size={12} />}
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <motion.div 
            className="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="empty-icon"
              style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'center'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              {searchTerm || selectedCategory ? '🔍' : '📝'}
            </motion.div>
            <h3 style={{ marginBottom: '0.5rem' }}>
              {searchTerm || selectedCategory ? 'Keine Transaktionen gefunden' : 'Noch keine Transaktionen'}
            </h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              {searchTerm || selectedCategory 
                ? 'Versuche andere Suchbegriffe oder Filter.'
                : 'Füge deine erste Transaktion hinzu und behalte den Überblick über deine Finanzen.'
              }
            </p>
            {!searchTerm && !selectedCategory && (
              <button 
                onClick={() => setShowAddTransaction(true)}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Erste Transaktion hinzufügen
              </button>
            )}
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {filteredTransactions.map(transaction => (
              <div 
                key={transaction.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto auto',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--border)'
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--surface)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                {/* Icon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '0.5rem',
                  background: `${transaction.category_color}20`,
                  border: `1px solid ${transaction.category_color}40`
                }}>
                  {transaction.type === 'income' ? 
                    <TrendingUp size={18} color={transaction.category_color} /> :
                    <TrendingDown size={18} color={transaction.category_color} />
                  }
                </div>

                {/* Description & Category */}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {transaction.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span 
                      style={{ 
                        fontSize: '0.75rem',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '1rem',
                        background: `${transaction.category_color}20`,
                        color: transaction.category_color,
                        border: `1px solid ${transaction.category_color}40`
                      }}
                    >
                      {transaction.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div style={{ textAlign: 'right' }}>
                  <span 
                    className={`currency ${transaction.amount > 0 ? 'positive' : 'negative'}`}
                    style={{ fontSize: '1rem', fontWeight: '700' }}
                  >
                    {transaction.amount > 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn btn-ghost" style={{ padding: '0.25rem' }}>
                    ✏️
                  </button>
                  <button className="btn btn-ghost" style={{ padding: '0.25rem' }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <Toast 
        toast={toast} 
        onClose={() => setToast(null)} 
      />
    </div>
  )
}

export default Transactions