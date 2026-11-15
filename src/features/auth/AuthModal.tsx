/**
 * Sign-in / registration dialog for the private area (journal, reminders, check-ins).
 */

import { useState, useTransition } from 'react'
import { useBackend } from '../../services/backend/BackendContext'
import type { PrivateDashboardData } from '../../services/backend/contract'
import { Icon } from '../../shared/components/Icon'

/**
 * Sign-in / registration dialog.
 *
 * @param onAuthenticated Receives the user's private data after a successful sign-in.
 */
export function AuthModal({
  onClose,
  onAuthenticated,
}: {
  onClose: () => void
  onAuthenticated: (data: PrivateDashboardData) => void
}) {
  const backend = useBackend()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const submit = () => {
    setError('')
    startTransition(async () => {
      const result =
        mode === 'register'
          ? await backend.registerAstronaut({ name, email, password })
          : await backend.loginAstronaut({ email, password })
      if (!result.success) {
        setError(result.message)
        return
      }
      onAuthenticated(result.data)
      onClose()
    })
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="wellness-modal auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <div className="modal-header">
          <div className="modal-symbol">
            <Icon name="lock" size={19} />
          </div>
          <div>
            <span className="eyebrow">PRIVATE ASTRONAUT ACCOUNT</span>
            <h2 id="auth-title">
              {mode === 'login' ? 'Sign in to HEALium' : 'Create astronaut account'}
            </h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close sign-in">
            <Icon name="plus" size={18} />
          </button>
        </div>
        <div className="modal-body auth-body">
          <p>
            Your journal, questionnaire responses, and reminder completion records are stored
            privately under this account.
          </p>
          {mode === 'register' && (
            <label>
              <span>Name</span>
              <input
                value={name}
                maxLength={100}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
              />
            </label>
          )}
          <label>
            <span>Email</span>
            <input
              value={email}
              type="email"
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>
          <label>
            <span>Password</span>
            <input
              value={password}
              type="password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </label>
          {error && <p className="checkin-error">{error}</p>}
        </div>
        <div className="modal-footer auth-footer">
          <button
            className="checkin-skip"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
          >
            {mode === 'login' ? 'Create an account' : 'I already have an account'}
          </button>
          <button className="primary-button" disabled={isPending} onClick={submit}>
            {isPending ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </div>
      </section>
    </div>
  )
}
