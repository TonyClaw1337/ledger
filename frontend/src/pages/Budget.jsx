import React, { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, ToggleLeft, ToggleRight, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Budget = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Wohnen',
      icon: '🏠',
      color: '#ef4444',
      items: [
        { id: 1, name: 'Miete', amount: 500.00, is_fixed: true, is_active: true }
      ]
    },
    {
      id: 2,
      name: 'Auto',
      icon: '🚗',
      color: '#10b981',
      items: [
        { id: 2, name: 'Steuer', amount: 12.00, is_fixed: true, is_active: true },
        { id: 3, name: 'Versicherung', amount: 45.00, is_fixed: true, is_active: true }
      ]
    },
    {
      id: 3,
      name: 'Versicherungen',
      icon: '🛡️',
      color: '#8b5cf6',
      items: [
        { id: 4, name: 'Hausrat', amount: 8.00, is_fixed: true, is_active: true },
        { id: 5, name: 'Gewerbe', amount: 15.00, is_fixed: true, is_active: true }
      ]
    },
    {
      id: 4,
      name: 'Lifestyle',
      icon: '🎨',
      color: '#f59e0b',
      items: [
        { id: 6, name: 'IQOS', amount: 40.00, is_fixed: false, is_active: true },
        { id: 7, name: 'Kosmetik', amount: 10.00, is_fixed: false, is_active: true },
        { id: 8, name: 'Friseur', amount: 15.00, is_fixed: false, is_active: true },
        { id: 9, name: 'Ausgehen', amount: 30.00, is_fixed: false, is_active: true }
      ]
    },
    {
      id: 5,
      name: 'Ernährung',
      icon: '🍽️',
      color: '#06b6d4',
      items: [
        { id: 10, name: 'Essen & Trinken', amount: 150.00, is_fixed: false, is_active: true }
      ]
    },
    {
      id: 6,
      name: 'Abos',
      icon: '📱',
      color: '#ec4899',
      items: [
        { id: 11, name: 'Adobe', amount: 12.00, is_fixed: true, is_active: true },
        { id: 12, name: 'Amazon', amount: 9.00, is_fixed: true, is_active: true },
        { id: 13, name: 'Handy', amount: 15.00, is_fixed: true, is_active: true }
      ]
    },
    {
      id: 7,
      name: 'Spenden',
      icon: '❤️',
      color: '#84cc16',
      items: [
        { id: 14, name: 'Save the Children', amount: 15.00, is_fixed: true, is_active: true }
      ]
    },
    {
      id: 8,
      name: 'Rücklagen',
      icon: '💰',
      color: '#64748b',
      items: [
        { id: 15, name: 'Sparen', amount: 30.00, is_fixed: false, is_active: true },
        { id: 16, name: 'Urlaub', amount: 25.00, is_fixed: false, is_active: true },
        { id: 17, name: 'Notfälle', amount: 20.00, is_fixed: false, is_active: true },
        { id: 18, name: 'Haushaltskasse', amount: 15.00, is_fixed: false, is_active: true }
      ]
    }
  ])

  const [editingItem, setEditingItem] = useState(null)
  const [newItemCategory, setNewItemCategory] = useState(null)
  const [collapsedCategories, setCollapsedCategories] = useState({})

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getTotalByCategory = (category) => {
    return category.items
      .filter(item => item.is_active)
      .reduce((sum, item) => sum + item.amount, 0)
  }

  const getGrandTotal = () => {
    return categories
      .flatMap(cat => cat.items)
      .filter(item => item.is_active)
      .reduce((sum, item) => sum + item.amount, 0)
  }

  const getFixedTotal = () => {
    return categories
      .flatMap(cat => cat.items)
      .filter(item => item.is_active && item.is_fixed)
      .reduce((sum, item) => sum + item.amount, 0)
  }

  const getVariableTotal = () => {
    return categories
      .flatMap(cat => cat.items)
      .filter(item => item.is_active && !item.is_fixed)
      .reduce((sum, item) => sum + item.amount, 0)
  }

  const toggleCategory = (categoryId) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const getBudgetUtilization = (categoryTotal, totalIncome = 1024) => {
    return Math.min((categoryTotal / totalIncome) * 100, 100)
  }

  const handleEditItem = (categoryId, item) => {
    setEditingItem({ categoryId, ...item })
  }

  const handleSaveItem = () => {
    setCategories(prev => prev.map(cat => 
      cat.id === editingItem.categoryId 
        ? {
            ...cat,
            items: cat.items.map(item => 
              item.id === editingItem.id 
                ? { ...item, name: editingItem.name, amount: parseFloat(editingItem.amount) }
                : item
            )
          }
        : cat
    ))
    setEditingItem(null)
  }

  const handleToggleItem = (categoryId, itemId) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            items: cat.items.map(item => 
              item.id === itemId 
                ? { ...item, is_active: !item.is_active }
                : item
            )
          }
        : cat
    ))
  }

  const CategoryCard = ({ category }) => {
    const isCollapsed = collapsedCategories[category.id]
    const categoryTotal = getTotalByCategory(category)
    const utilization = getBudgetUtilization(categoryTotal)
    const fixedItems = category.items.filter(item => item.is_active && item.is_fixed)
    const variableItems = category.items.filter(item => item.is_active && !item.is_fixed)
    
    return (
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Category Header - Clickable */}
        <div 
          className="card-header" 
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => toggleCategory(category.id)}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div 
                style={{ 
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '0.5rem',
                  background: `${category.color}20`,
                  border: `1px solid ${category.color}40`
                }}
              >
                {category.icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 className="card-title" style={{ margin: 0 }}>{category.name}</h3>
                  {fixedItems.length > 0 && (
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '1rem',
                      background: 'var(--border)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Lock size={10} />
                      Fixkosten
                    </span>
                  )}
                  {variableItems.length > 0 && (
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '1rem',
                      background: `${category.color}20`,
                      color: category.color,
                      border: `1px solid ${category.color}40`
                    }}>
                      Variabel
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="currency neutral" style={{ fontSize: '0.875rem' }}>
                    {formatCurrency(categoryTotal)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {category.items.filter(item => item.is_active).length} Posten
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {utilization.toFixed(1)}% des Budgets
                </span>
              </div>
              <motion.div
                animate={{ rotate: isCollapsed ? 0 : 180 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} color="var(--text-muted)" />
              </motion.div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{ marginTop: '1rem' }}>
            <div className="progress">
              <motion.div 
                className="progress-bar" 
                style={{ 
                  background: utilization > 80 ? 'var(--danger)' : utilization > 60 ? 'var(--warning)' : category.color
                }}
                initial={{ width: 0 }}
                animate={{ width: `${utilization}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
        
        {/* Collapsible Content */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
                {/* Fixed Items Section */}
                {fixedItems.length > 0 && (
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      marginBottom: '0.5rem',
                      padding: '0.5rem 0'
                    }}>
                      <Lock size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        FIXKOSTEN ({fixedItems.length})
                      </span>
                    </div>
                    {fixedItems.map(item => renderBudgetItem(item, category))}
                  </div>
                )}

                {/* Variable Items Section */}
                {variableItems.length > 0 && (
                  <div>
                    {fixedItems.length > 0 && <div style={{ height: '1rem' }} />}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      marginBottom: '0.5rem',
                      padding: '0.5rem 0'
                    }}>
                      <div style={{ 
                        width: '14px', 
                        height: '14px', 
                        borderRadius: '3px', 
                        background: category.color 
                      }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        VARIABLE KOSTEN ({variableItems.length})
                      </span>
                    </div>
                    {variableItems.map(item => renderBudgetItem(item, category))}
                  </div>
                )}
                
                {/* Add New Item */}
                {newItemCategory === category.id ? (
                  <motion.div 
                    style={{ 
                      display: 'flex', 
                      gap: '0.5rem',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      background: 'var(--surface)',
                      border: '1px solid var(--accent)'
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <input
                      type="text"
                      placeholder="Name des Postens"
                      className="input"
                      style={{ flex: 1, fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                    />
                    <input
                      type="number"
                      placeholder="Betrag"
                      className="input"
                      style={{ width: '80px', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                      step="0.01"
                    />
                    <button 
                      className="btn btn-primary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      ✓
                    </button>
                    <button 
                      onClick={() => setNewItemCategory(null)}
                      className="btn btn-ghost"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      ✕
                    </button>
                  </motion.div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setNewItemCategory(category.id)
                    }}
                    className="btn btn-ghost"
                    style={{ 
                      justifyContent: 'flex-start', 
                      padding: '0.75rem',
                      border: '1px dashed var(--border)',
                      fontSize: '0.875rem',
                      marginTop: '0.5rem'
                    }}
                  >
                    <Plus size={16} />
                    Posten hinzufügen
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  const renderBudgetItem = (item, category) => (
    <div 
      key={item.id}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        background: item.is_active ? 'var(--surface)' : 'var(--border)',
        border: '1px solid var(--border)',
        opacity: item.is_active ? 1 : 0.6,
        marginBottom: '0.25rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        {editingItem && editingItem.id === item.id ? (
          <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
            <input
              type="text"
              value={editingItem.name}
              onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              style={{ flex: 1, fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
            />
            <input
              type="number"
              value={editingItem.amount}
              onChange={(e) => setEditingItem(prev => ({ ...prev, amount: e.target.value }))}
              className="input"
              style={{ width: '80px', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
              step="0.01"
            />
            <button 
              onClick={handleSaveItem}
              className="btn btn-primary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              ✓
            </button>
            <button 
              onClick={() => setEditingItem(null)}
              className="btn btn-ghost"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <span style={{ fontSize: '0.875rem', flex: 1 }}>{item.name}</span>
            <span className="currency" style={{ fontSize: '0.875rem' }}>
              {formatCurrency(item.amount)}
            </span>
          </>
        )}
      </div>
      
      {!editingItem || editingItem.id !== item.id ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '0.75rem' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggleItem(category.id, item.id)
            }}
            className="btn btn-ghost"
            style={{ padding: '0.25rem' }}
          >
            {item.is_active ? <ToggleRight size={16} color="var(--success)" /> : <ToggleLeft size={16} color="var(--text-muted)" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEditItem(category.id, item)
            }}
            className="btn btn-ghost"
            style={{ padding: '0.25rem' }}
          >
            <Edit3 size={14} />
          </button>
        </div>
      ) : null}
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
            Budget
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Verwalte deine monatlichen Ausgaben und Budget-Posten
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          Kategorie hinzufügen
        </button>
      </div>

      {/* Budget Summary */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '2rem', textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Gesamtausgaben
            </p>
            <p className="currency neutral" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {formatCurrency(getGrandTotal())}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Fixkosten
            </p>
            <p className="currency" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {formatCurrency(getFixedTotal())}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Variable Kosten
            </p>
            <p className="currency" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {formatCurrency(getVariableTotal())}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Übrig (von 1.024€)
            </p>
            <p className="currency positive" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {formatCurrency(1024 - getGrandTotal())}
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-2">
        {categories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}

export default Budget