import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

const Dashboard = () => {
  const [data, setData] = useState({
    total_income: 1024.00,
    total_expenses: 966.00,
    total_savings: 58.00,
    budget_utilization: 94.3,
    categories: [
      { name: 'Wohnen', value: 500, color: '#ef4444', percentage: 51.8 },
      { name: 'Ernährung', value: 150, color: '#f59e0b', percentage: 15.5 },
      { name: 'Auto', value: 57, color: '#10b981', percentage: 5.9 },
      { name: 'Lifestyle', value: 95, color: '#8b5cf6', percentage: 9.8 },
      { name: 'Rücklagen', value: 90, color: '#06b6d4', percentage: 9.3 },
      { name: 'Sonstiges', value: 74, color: '#6b7280', percentage: 7.7 }
    ]
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // TODO: Fetch data from API
    // fetchDashboardData()
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, className = "", delay = 0 }) => (
    <motion.div 
      className={`card ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -4, 
        transition: { duration: 0.2 }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{title}</p>
          <motion.p 
            className={`currency ${className.includes('positive') ? 'positive' : className.includes('negative') ? 'negative' : 'neutral'}`} 
            style={{ fontSize: '1.5rem', fontWeight: '700' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
          >
            {formatCurrency(value)}
          </motion.p>
        </div>
        <motion.div 
          style={{ 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            background: 'var(--surface)',
            border: '1px solid var(--border)'
          }}
          whileHover={{ scale: 1.1, rotate: 10 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Icon size={20} color="var(--accent)" />
        </motion.div>
      </div>
      {trend && (
        <motion.div 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.3 }}
        >
          {trend === 'up' ? (
            <TrendingUp size={16} color="var(--success)" />
          ) : (
            <TrendingDown size={16} color="var(--danger)" />
          )}
          <span style={{ 
            fontSize: '0.75rem', 
            color: trend === 'up' ? 'var(--success)' : 'var(--danger)' 
          }}>
            {trendValue}% vs. letzter Monat
          </span>
        </motion.div>
      )}
    </motion.div>
  )

  const BudgetUtilizationCard = () => (
    <motion.div 
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="card-header">
        <h3 className="card-title">Budget-Auslastung</h3>
        <p className="card-description">
          {formatCurrency(data.total_expenses)} von {formatCurrency(data.total_income)} verwendet
        </p>
      </div>

      {/* Prominent Puffer Display */}
      <motion.div 
        style={{
          background: `linear-gradient(135deg, ${data.total_savings > 100 ? 'var(--success)' : 'var(--accent)'}20, ${data.total_savings > 100 ? 'var(--success)' : 'var(--accent)'}10)`,
          border: `1px solid ${data.total_savings > 100 ? 'var(--success)' : 'var(--accent)'}40`,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          textAlign: 'center',
          marginBottom: 'var(--space-6)'
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          💰 Verfügbarer Puffer
        </p>
        <motion.p 
          className="currency positive" 
          style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {formatCurrency(data.total_savings)}
        </motion.p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {((data.total_savings / data.total_income) * 100).toFixed(1)}% deines Einkommens
        </p>
      </motion.div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Ausgaben: {data.budget_utilization}%
          </span>
          <span className="currency neutral" style={{ fontSize: '0.875rem' }}>
            {formatCurrency(data.total_expenses)} verwendet
          </span>
        </div>
        <motion.div 
          className="progress"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ transformOrigin: 'left' }}
        >
          <motion.div 
            className="progress-bar" 
            style={{ 
              background: data.budget_utilization > 90 ? 'var(--danger)' : 'var(--accent)'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${data.budget_utilization}%` }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          />
        </motion.div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Fixkosten
          </p>
          <p className="currency" style={{ fontSize: '0.875rem' }}>
            {formatCurrency(645)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Variable Kosten
          </p>
          <p className="currency" style={{ fontSize: '0.875rem' }}>
            {formatCurrency(321)}
          </p>
        </motion.div>
      </div>
    </motion.div>
  )

  const ExpenseBreakdownCard = () => (
    <motion.div 
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="card-header">
        <h3 className="card-title">Ausgaben nach Kategorien</h3>
        <p className="card-description">Verteilung der monatlichen Ausgaben</p>
      </div>
      <div style={{ height: '400px', marginBottom: '1rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.categories}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              paddingAngle={3}
              dataKey="value"
              animationBegin={600}
              animationDuration={1000}
            >
              {data.categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [formatCurrency(value), 'Betrag']}
              contentStyle={{
                background: 'rgba(17, 17, 20, 0.95)',
                border: '1px solid var(--border)',
                borderRadius: '0.75rem',
                color: 'var(--text)',
                backdropFilter: 'blur(10px)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {data.categories.map((category, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div 
                style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: category.color 
                }}
              />
              <span style={{ fontSize: '0.875rem' }}>{category.name}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="currency" style={{ fontSize: '0.875rem' }}>
                {formatCurrency(category.value)}
              </span>
              <span style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-muted)', 
                marginLeft: '0.5rem' 
              }}>
                {category.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )

  const QuickActionsCard = () => (
    <motion.div 
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="card-header">
        <h3 className="card-title">Schnellaktionen</h3>
        <p className="card-description">Häufige Aktionen</p>
      </div>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {[
          { label: 'Ausgabe hinzufügen', className: 'btn-primary', icon: Plus },
          { label: 'Einnahme hinzufügen', className: 'btn-secondary', icon: Plus },
          { label: 'Budget anpassen', className: 'btn-ghost' },
          { label: 'Kategorien verwalten', className: 'btn-ghost' }
        ].map((action, index) => (
          <motion.button 
            key={action.label}
            className={`btn ${action.className}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {action.icon && <action.icon size={16} />}
            {action.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )

  const SkeletonCard = () => (
    <div className="card">
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ 
          height: '16px', 
          background: 'var(--border)', 
          borderRadius: '4px', 
          marginBottom: '8px',
          width: '60%'
        }} />
        <div style={{ 
          height: '24px', 
          background: 'var(--border)', 
          borderRadius: '4px',
          width: '40%'
        }} />
      </div>
      <div style={{ height: '40px', background: 'var(--border)', borderRadius: '8px' }} />
    </div>
  )

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            height: '32px', 
            background: 'var(--border)', 
            borderRadius: '8px', 
            marginBottom: '8px',
            width: '200px'
          }} />
          <div style={{ 
            height: '20px', 
            background: 'var(--border)', 
            borderRadius: '4px',
            width: '300px'
          }} />
        </div>
        
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        
        <div className="grid grid-2">
          <div>
            <SkeletonCard />
            <div style={{ marginTop: '1.5rem' }}>
              <SkeletonCard />
            </div>
          </div>
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '2rem', 
          fontWeight: '700', 
          marginBottom: '0.5rem' 
        }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Überblick über deine Finanzen im {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <StatCard 
          title="Gesamteinkommen" 
          value={data.total_income} 
          icon={Wallet}
          className="positive"
          delay={0}
        />
        <StatCard 
          title="Gesamtausgaben" 
          value={data.total_expenses} 
          icon={TrendingDown}
          className="negative"
          delay={0.1}
        />
        <StatCard 
          title="Übrig" 
          value={data.total_savings} 
          icon={TrendingUp}
          trend="up"
          trendValue={12}
          className="positive"
          delay={0.2}
        />
      </div>

      <div className="grid grid-2">
        <div>
          <BudgetUtilizationCard />
          <div style={{ marginTop: '1.5rem' }}>
            <QuickActionsCard />
          </div>
        </div>
        <ExpenseBreakdownCard />
      </div>
    </div>
  )
}

export default Dashboard