import React, { useState } from 'react'
import { Plus, Edit3, Trash2, ToggleLeft, ToggleRight, Briefcase, DollarSign, Calendar } from 'lucide-react'

const Income = () => {
  const [incomeItems, setIncomeItems] = useState([
    {
      id: 1,
      name: 'Hauptgehalt',
      amount: 1024.00,
      frequency: 'monthly',
      is_active: true,
      icon: '💼',
      color: '#22c55e'
    },
    {
      id: 2,
      name: 'Freelance Projekte',
      amount: 200.00,
      frequency: 'monthly',
      is_active: false,
      icon: '💻',
      color: '#8b5cf6'
    },
    {
      id: 3,
      name: 'Dividenden',
      amount: 15.00,
      frequency: 'monthly',
      is_active: true,
      icon: '📈',
      color: '#06b6d4'
    }
  ])

  const [editingItem, setEditingItem] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    amount: '',
    frequency: 'monthly'
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getFrequencyLabel = (frequency) => {
    switch (frequency) {
      case 'weekly': return 'Wöchentlich'
      case 'monthly': return 'Monatlich'
      case 'yearly': return 'Jährlich'
      default: return frequency
    }
  }

  const getMonthlyEquivalent = (amount, frequency) => {
    switch (frequency) {
      case 'weekly': return amount * 4.33
      case 'yearly': return amount / 12
      case 'monthly':
      default: return amount
    }
  }

  const getTotalMonthlyIncome = () => {
    return incomeItems
      .filter(item => item.is_active)
      .reduce((sum, item) => sum + getMonthlyEquivalent(item.amount, item.frequency), 0)
  }

  const getTotalYearlyIncome = () => {
    return getTotalMonthlyIncome() * 12
  }

  const handleSaveEdit = () => {
    setIncomeItems(prev => prev.map(item => 
      item.id === editingItem.id 
        ? { 
            ...item, 
            name: editingItem.name, 
            amount: parseFloat(editingItem.amount),
            frequency: editingItem.frequency
          }
        : item
    ))
    setEditingItem(null)
  }

  const handleToggleActive = (id) => {
    setIncomeItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, is_active: !item.is_active }
        : item
    ))
  }

  const handleAddItem = (e) => {
    e.preventDefault()
    const newId = Math.max(...incomeItems.map(i => i.id)) + 1
    setIncomeItems(prev => [...prev, {
      ...newItem,
      id: newId,
      amount: parseFloat(newItem.amount),
      is_active: true,
      icon: '💰',
      color: '#f59e0b'
    }])
    setNewItem({ name: '', amount: '', frequency: 'monthly' })
    setShowAddForm(false)
  }

  const handleDeleteItem = (id) => {
    setIncomeItems(prev => prev.filter(item => item.id !== id))
  }

  const IncomeCard = ({ item }) => (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '0.75rem',
            background: `${item.color}20`,
            border: `1px solid ${item.color}40`
          }}>
            {item.icon}
          </div>
          <div style={{ opacity: item.is_active ? 1 : 0.6 }}>
            {editingItem && editingItem.id === item.id ? (
              <input
                type="text"
                value={editingItem.name}
                onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                className="input"
                style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem', padding: '0.25rem 0.5rem' }}
              />
            ) : (
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                {item.name}
              </h3>
            )}
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {getFrequencyLabel(item.frequency)}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => handleToggleActive(item.id)}
          className="btn btn-ghost"
          style={{ padding: '0.5rem' }}
        >
          {item.is_active ? 
            <ToggleRight size={20} color="var(--success)" /> : 
            <ToggleLeft size={20} color="var(--text-muted)" />
          }
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            {getFrequencyLabel(item.frequency)}er Betrag
          </p>
          {editingItem && editingItem.id === item.id ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                value={editingItem.amount}
                onChange={(e) => setEditingItem(prev => ({ ...prev, amount: e.target.value }))}
                className="input"
                style={{ fontSize: '1rem', padding: '0.25rem 0.5rem' }}
                step="0.01"
              />
              <select
                value={editingItem.frequency}
                onChange={(e) => setEditingItem(prev => ({ ...prev, frequency: e.target.value }))}
                className="input"
                style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', width: 'auto' }}
              >
                <option value="weekly">Wöchentlich</option>
                <option value="monthly">Monatlich</option>
                <option value="yearly">Jährlich</option>
              </select>
            </div>
          ) : (
            <p className="currency positive" style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              {formatCurrency(item.amount)}
            </p>
          )}
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Monatlich (umgerechnet)
          </p>
          <p className="currency" style={{ fontSize: '1rem', fontWeight: '600' }}>
            {formatCurrency(getMonthlyEquivalent(item.amount, item.frequency))}
          </p>
        </div>
      </div>

      {editingItem && editingItem.id === item.id ? (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleSaveEdit} className="btn btn-primary">
            Speichern
          </button>
          <button onClick={() => setEditingItem(null)} className="btn btn-secondary">
            Abbrechen
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setEditingItem({
              id: item.id,
              name: item.name,
              amount: item.amount,
              frequency: item.frequency
            })}
            className="btn btn-ghost"
            disabled={!item.is_active}
          >
            <Edit3 size={16} />
            Bearbeiten
          </button>
          <button
            onClick={() => handleDeleteItem(item.id)}
            className="btn btn-ghost"
            style={{ color: 'var(--danger)' }}
          >
            <Trash2 size={16} />
            Löschen
          </button>
        </div>
      )}
    </div>
  )

  const AddIncomeForm = () => (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Neue Einkommensquelle</h3>
        <button 
          onClick={() => setShowAddForm(false)}
          className="btn btn-ghost"
          style={{ marginLeft: 'auto' }}
        >
          ✕
        </button>
      </div>
      <form onSubmit={handleAddItem} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
            Bezeichnung
          </label>
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
            className="input"
            placeholder="z.B. Nebenjob, Dividenden..."
            required
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
              Betrag (€)
            </label>
            <input
              type="number"
              value={newItem.amount}
              onChange={(e) => setNewItem(prev => ({ ...prev, amount: e.target.value }))}
              className="input"
              step="0.01"
              placeholder="0,00"
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
              Häufigkeit
            </label>
            <select 
              value={newItem.frequency}
              onChange={(e) => setNewItem(prev => ({ ...prev, frequency: e.target.value }))}
              className="input"
            >
              <option value="weekly">Wöchentlich</option>
              <option value="monthly">Monatlich</option>
              <option value="yearly">Jährlich</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
          <button type="submit" className="btn btn-primary">
            Hinzufügen
          </button>
          <button 
            type="button" 
            onClick={() => setShowAddForm(false)}
            className="btn btn-secondary"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )

  const SummaryCards = () => (
    <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Monatliches Einkommen
            </p>
            <p className="currency positive" style={{ fontSize: '1.75rem', fontWeight: '700' }}>
              {formatCurrency(getTotalMonthlyIncome())}
            </p>
          </div>
          <div style={{ 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            background: 'var(--surface)',
            border: '1px solid var(--border)'
          }}>
            <Calendar size={20} color="var(--success)" />
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Alle aktiven Einkommensquellen
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Jährliches Einkommen
            </p>
            <p className="currency positive" style={{ fontSize: '1.75rem', fontWeight: '700' }}>
              {formatCurrency(getTotalYearlyIncome())}
            </p>
          </div>
          <div style={{ 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            background: 'var(--surface)',
            border: '1px solid var(--border)'
          }}>
            <Briefcase size={20} color="var(--success)" />
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Hochgerechnet auf 12 Monate
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Einkommensquellen
            </p>
            <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent)' }}>
              {incomeItems.filter(item => item.is_active).length}
            </p>
          </div>
          <div style={{ 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            background: 'var(--surface)',
            border: '1px solid var(--border)'
          }}>
            <DollarSign size={20} color="var(--accent)" />
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {incomeItems.length - incomeItems.filter(item => item.is_active).length} inaktiv
        </p>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '2rem', 
            fontWeight: '700', 
            marginBottom: '0.5rem' 
          }}>
            Einkommen
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Verwalte deine Einkommensquellen und behalte den Überblick
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
          disabled={showAddForm}
        >
          <Plus size={16} />
          Einkommen hinzufügen
        </button>
      </div>

      <SummaryCards />

      {showAddForm && (
        <div style={{ marginBottom: '2rem' }}>
          <AddIncomeForm />
        </div>
      )}

      {incomeItems.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-icon">💰</div>
            <h3>Noch keine Einkommensquellen</h3>
            <p style={{ marginBottom: '1rem' }}>
              Füge deine erste Einkommensquelle hinzu, um zu beginnen.
            </p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Erste Einkommensquelle hinzufügen
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
              Deine Einkommensquellen
            </h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {incomeItems.filter(item => item.is_active).length} von {incomeItems.length} aktiv
            </span>
          </div>
          
          <div className="grid grid-2">
            {incomeItems.map(item => (
              <IncomeCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="card" style={{ marginTop: '2rem', background: 'rgba(229, 160, 13, 0.1)', border: '1px solid rgba(229, 160, 13, 0.3)' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ color: 'var(--accent)' }}>💡 Tipp</h3>
        </div>
        <p style={{ fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1rem' }}>
          <strong>Verschiedene Einkommensarten erfassen:</strong> Denke auch an unregelmäßige Einkünfte wie Boni, Steuerrückerstattungen oder Verkaufserlöse. Du kannst diese als jährliche Beträge eingeben und das System rechnet automatisch den monatlichen Durchschnitt aus.
        </p>
        <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
          <strong>Netto vs. Brutto:</strong> Trage hier dein Nettoeinkommen ein – das ist der Betrag, der tatsächlich auf deinem Konto landet und für deine Budgetplanung relevant ist.
        </p>
      </div>
    </div>
  )
}

export default Income