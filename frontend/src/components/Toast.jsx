import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react'

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toast, onClose])

  if (!toast) return null

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={18} color="var(--success)" />
      case 'error':
        return <AlertCircle size={18} color="var(--danger)" />
      case 'info':
      default:
        return <Info size={18} color="var(--accent)" />
    }
  }

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'var(--success)'
      case 'error':
        return 'var(--danger)'
      case 'info':
      default:
        return 'var(--accent)'
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.8 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          background: 'rgba(17, 17, 20, 0.95)',
          border: `1px solid ${getBorderColor()}`,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 1000,
          minWidth: '300px',
          maxWidth: '400px',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}
      >
        {getIcon()}
        <div style={{ flex: 1 }}>
          {toast.title && (
            <p style={{ 
              fontWeight: '600', 
              marginBottom: '0.25rem',
              fontSize: '0.875rem'
            }}>
              {toast.title}
            </p>
          )}
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text-muted)',
            margin: 0 
          }}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: 'var(--radius)',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

export default Toast