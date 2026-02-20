import React, { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Calendar, Target, PiggyBank, Download } from 'lucide-react'

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  
  // Mock data for the last 6 months
  const monthlyData = [
    { month: 'Sep 2025', income: 1024, expenses: 980, savings: 44, savings_rate: 4.3 },
    { month: 'Okt 2025', income: 1024, expenses: 1050, savings: -26, savings_rate: -2.5 },
    { month: 'Nov 2025', income: 1200, expenses: 945, savings: 255, savings_rate: 21.3 },
    { month: 'Dez 2025', income: 1400, expenses: 1200, savings: 200, savings_rate: 14.3 },
    { month: 'Jan 2026', income: 1024, expenses: 890, savings: 134, savings_rate: 13.1 },
    { month: 'Feb 2026', income: 1024, expenses: 966, savings: 58, savings_rate: 5.7 }
  ]

  const categoryTrends = [
    { category: 'Wohnen', current: 500, previous: 500, change: 0, color: '#ef4444' },
    { category: 'Ernährung', current: 150, previous: 180, change: -16.7, color: '#06b6d4' },
    { category: 'Auto', current: 57, previous: 45, change: 26.7, color: '#10b981' },
    { category: 'Lifestyle', current: 95, previous: 120, change: -20.8, color: '#f59e0b' },
    { category: 'Rücklagen', current: 90, previous: 75, change: 20.0, color: '#8b5cf6' },
    { category: 'Sonstiges', current: 74, previous: 90, change: -17.8, color: '#6b7280' }
  ]

  const savingsGoal = {
    target: 1000,
    current: 644,
    monthly_target: 84,
    monthly_average: 58
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatPercent = (value) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getAverageValues = () => {
    const avgIncome = monthlyData.reduce((sum, month) => sum + month.income, 0) / monthlyData.length
    const avgExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0) / monthlyData.length
    const avgSavings = monthlyData.reduce((sum, month) => sum + month.savings, 0) / monthlyData.length
    const avgSavingsRate = monthlyData.reduce((sum, month) => sum + month.savings_rate, 0) / monthlyData.length

    return { avgIncome, avgExpenses, avgSavings, avgSavingsRate }
  }

  const { avgIncome, avgExpenses, avgSavings, avgSavingsRate } = getAverageValues()

  const SummaryCard = ({ title, current, average, icon: Icon, type = "currency" }) => {
    const isPositive = type === "currency" ? current > 0 : current >= 0
    const changeFromAvg = ((current - average) / average * 100)
    
    return (
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              {title}
            </p>
            <p className={`currency ${isPositive ? 'positive' : 'negative'}`} style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {type === "currency" ? formatCurrency(current) : formatPercent(current)}
            </p>
          </div>
          <div style={{ 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            background: 'var(--surface)',
            border: '1px solid var(--border)'
          }}>
            <Icon size={20} color="var(--accent)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {Math.abs(changeFromAvg) > 1 && (
            <>
              {changeFromAvg > 0 ? (
                <TrendingUp size={16} color="var(--success)" />
              ) : (
                <TrendingDown size={16} color="var(--danger)" />
              )}
              <span style={{ 
                fontSize: '0.75rem', 
                color: changeFromAvg > 0 ? 'var(--success)' : 'var(--danger)' 
              }}>
                {formatPercent(changeFromAvg)} vs. Durchschnitt
              </span>
            </>
          )}
        </div>
      </div>
    )
  }

  const MonthlyComparisonChart = () => (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title">Monatliche Entwicklung</h3>
            <p className="card-description">Einnahmen, Ausgaben und Ersparnisse über die Zeit</p>
          </div>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input"
            style={{ width: 'auto' }}
          >
            <option value="3months">Letzte 3 Monate</option>
            <option value="6months">Letzte 6 Monate</option>
            <option value="12months">Letzte 12 Monate</option>
          </select>
        </div>
      </div>
      <div style={{ height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--text-muted)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--text-muted)"
              fontSize={12}
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip 
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                color: 'var(--text)'
              }}
              formatter={(value, name) => [
                formatCurrency(value),
                name === 'income' ? 'Einnahmen' : 
                name === 'expenses' ? 'Ausgaben' : 'Ersparnisse'
              ]}
            />
            <Bar dataKey="income" fill="var(--success)" name="income" radius={[2, 2, 0, 0]} />
            <Bar dataKey="expenses" fill="var(--danger)" name="expenses" radius={[2, 2, 0, 0]} />
            <Bar dataKey="savings" fill="var(--accent)" name="savings" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const SavingsRateChart = () => (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Sparquote Entwicklung</h3>
        <p className="card-description">Anteil der Ersparnisse am Einkommen in %</p>
      </div>
      <div style={{ height: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--text-muted)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--text-muted)"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                color: 'var(--text)'
              }}
              formatter={(value) => [`${value.toFixed(1)}%`, 'Sparquote']}
            />
            <Line 
              type="monotone" 
              dataKey="savings_rate" 
              stroke="var(--accent)" 
              strokeWidth={3}
              dot={{ fill: 'var(--accent)', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: 'var(--accent)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const CategoryTrendsCard = () => (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Kategorie Trends</h3>
        <p className="card-description">Veränderung zum Vormonat</p>
      </div>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {categoryTrends.map((category, index) => (
          <div 
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div 
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: category.color
                }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {category.category}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="currency" style={{ fontSize: '0.875rem' }}>
                {formatCurrency(category.current)}
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: '60px', justifyContent: 'flex-end' }}>
                {category.change !== 0 && (
                  <>
                    {category.change > 0 ? (
                      <TrendingUp size={14} color="var(--danger)" />
                    ) : (
                      <TrendingDown size={14} color="var(--success)" />
                    )}
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: category.change > 0 ? 'var(--danger)' : 'var(--success)',
                      fontWeight: '500'
                    }}>
                      {formatPercent(Math.abs(category.change))}
                    </span>
                  </>
                )}
                {category.change === 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ±0%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const SavingsGoalCard = () => {
    const progress = (savingsGoal.current / savingsGoal.target) * 100
    const monthsToGoal = Math.ceil((savingsGoal.target - savingsGoal.current) / savingsGoal.monthly_average)
    
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Sparziel</h3>
          <p className="card-description">Fortschritt zu deinem Jahresziel</p>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Fortschritt: {progress.toFixed(1)}%
            </span>
            <span className="currency positive" style={{ fontSize: '0.875rem' }}>
              {formatCurrency(savingsGoal.current)} von {formatCurrency(savingsGoal.target)}
            </span>
          </div>
          <div className="progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${Math.min(progress, 100)}%`,
                background: progress >= 100 ? 'var(--success)' : 'var(--accent)'
              }}
            />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Monatsziel
            </p>
            <p className="currency" style={{ fontSize: '1rem', fontWeight: '600' }}>
              {formatCurrency(savingsGoal.monthly_target)}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Aktueller Schnitt
            </p>
            <p className={`currency ${savingsGoal.monthly_average >= savingsGoal.monthly_target ? 'positive' : 'negative'}`} style={{ fontSize: '1rem', fontWeight: '600' }}>
              {formatCurrency(savingsGoal.monthly_average)}
            </p>
          </div>
        </div>
        
        {progress < 100 && (
          <div style={{ 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            background: 'rgba(229, 160, 13, 0.1)', 
            border: '1px solid rgba(229, 160, 13, 0.3)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--accent)' }}>
              <strong>{monthsToGoal} Monate</strong> bis zum Ziel bei aktueller Sparrate
            </p>
          </div>
        )}
      </div>
    )
  }

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
            Übersicht & Berichte
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Analysiere deine Finanztrends und verfolge deine Ziele
          </p>
        </div>
        <button className="btn btn-secondary">
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <SummaryCard 
          title="Aktueller Monat" 
          current={monthlyData[monthlyData.length - 1].savings} 
          average={avgSavings}
          icon={PiggyBank}
        />
        <SummaryCard 
          title="Sparquote" 
          current={monthlyData[monthlyData.length - 1].savings_rate} 
          average={avgSavingsRate}
          icon={Target}
          type="percent"
        />
        <SummaryCard 
          title="Ø Einkommen" 
          current={avgIncome} 
          average={avgIncome}
          icon={TrendingUp}
        />
        <SummaryCard 
          title="Ø Ausgaben" 
          current={avgExpenses} 
          average={avgExpenses}
          icon={TrendingDown}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
        <MonthlyComparisonChart />
        <div>
          <SavingsRateChart />
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-2">
        <CategoryTrendsCard />
        <SavingsGoalCard />
      </div>

      {/* Insights Section */}
      <div className="card" style={{ marginTop: '2rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ color: 'var(--success)' }}>📊 Erkenntnisse</h3>
        </div>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '0.5rem' }}>
              <strong>Positive Entwicklung:</strong> Deine Sparquote hat sich in den letzten Monaten verbessert. 
              Der Durchschnitt liegt bei {avgSavingsRate.toFixed(1)}%.
            </p>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
              <strong>Optimierungspotential:</strong> Die Kategorie "Auto" zeigt den größten Anstieg ({formatPercent(categoryTrends.find(c => c.category === 'Auto')?.change || 0)}). 
              Überprüfe hier deine Ausgaben.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports