import type { FormEvent } from 'react'
import { useState } from 'react'
import { BrandLogo } from '@/global/components'
import { useAuth } from '../hooks'
import type { LoginCredentials, AuthUser } from '../types'
import { hasLoginFieldErrors, validateLoginFields, type LoginFieldErrors } from '../utils/validateLogin'
import loginBackground from '@/modules/auth/assets/login-background.jpeg'
import './LoginPage.css'

interface LoginPageProps {
  onLogin?: (credentials: LoginCredentials) => Promise<AuthUser | null>
  isSubmitting?: boolean
  error?: string | null
}

export function LoginPage({
  onLogin: externalLogin,
  isSubmitting: externalIsSubmitting,
  error: externalError,
}: LoginPageProps = {}) {
  const internalAuth = useAuth()

  const isSubmitting =
    externalIsSubmitting !== undefined
      ? externalIsSubmitting
      : internalAuth.isSubmitting
  const serverError =
    externalError !== undefined ? externalError : internalAuth.error

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})
  const [localError, setLocalError] = useState<string | null>(null)
  // Oculta el error del servidor al editar, hasta el próximo envío.
  const [suppressServerError, setSuppressServerError] = useState(false)

  const formError = localError ?? (suppressServerError ? null : serverError)

  function clearFeedback() {
    setLocalError(null)
    setSuppressServerError(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError(null)
    setSuppressServerError(false)
    if (externalError === undefined) {
      internalAuth.setError(null)
    }

    const nextErrors = validateLoginFields(email, password)
    setFieldErrors(nextErrors)
    if (hasLoginFieldErrors(nextErrors)) {
      return
    }

    try {
      if (externalLogin) {
        await externalLogin({ email, password, remember })
      } else {
        await internalAuth.login({ email, password, remember })
      }
    } catch (err) {
      // useAuth ya deja el mensaje; con login externo lo reflejamos aquí.
      if (externalError === undefined) {
        return
      }
      const msg = err instanceof Error ? err.message : 'No se pudo iniciar sesión.'
      setLocalError(msg)
    }
  }

  return (
    <main className="login-page">
      <div
        className="login-page__backdrop"
        style={{ backgroundImage: `url(${loginBackground})` }}
        aria-hidden
      />

      <div className="login-page__content">
        <BrandLogo
          mark="wordmark"
          variant="transparent"
          className="login-page__wordmark"
        />

        <section className="login-card" aria-labelledby="login-title">
          <BrandLogo
            mark="principal"
            variant="transparent"
            className="login-card__emblem"
          />

          <h1 id="login-title" className="login-card__title">
            Iniciar sesión
          </h1>

          <form className="login-card__form" onSubmit={handleSubmit} noValidate>
            <label className="login-field">
              <span className="login-field__label">Correo electrónico</span>
              <input
                className={
                  fieldErrors.email
                    ? 'login-field__input login-field__input--invalid'
                    : 'login-field__input'
                }
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Correo electrónico"
                value={email}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }))
                  }
                  clearFeedback()
                }}
              />
              {fieldErrors.email ? (
                <span id="login-email-error" className="login-field__hint" role="alert">
                  {fieldErrors.email}
                </span>
              ) : null}
            </label>

            <label className="login-field">
              <span className="login-field__label">Contraseña</span>
              <div className="login-field__password">
                <input
                  className={
                    fieldErrors.password
                      ? 'login-field__input login-field__input--password login-field__input--invalid'
                      : 'login-field__input login-field__input--password'
                  }
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Contraseña"
                  value={password}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }))
                    }
                    clearFeedback()
                  }}
                />
                <button
                  type="button"
                  className="login-field__toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fieldErrors.password ? (
                <span id="login-password-error" className="login-field__hint" role="alert">
                  {fieldErrors.password}
                </span>
              ) : null}
            </label>

            <div className="login-row-remember">
              <label className="login-remember">
                <span className="login-remember__control">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <PawIcon className="login-remember__paw" />
                </span>
                <span>Recordarme</span>
              </label>
            </div>

            {formError && !hasLoginFieldErrors(fieldErrors) ? (
              <div className="login-card__error-box" role="alert">
                <AlertIcon className="login-card__error-icon" />
                <p className="login-card__error">{formError}</p>
              </div>
            ) : null}

            <button
              type="submit"
              className="login-card__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

function PawIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden
      fill="currentColor"
    >
      <ellipse cx="6.2" cy="8.2" rx="2.1" ry="2.6" />
      <ellipse cx="12" cy="5.8" rx="2.1" ry="2.6" />
      <ellipse cx="17.8" cy="8.2" rx="2.1" ry="2.6" />
      <path d="M12 10.4c-3.6 0-6.2 2.4-6.2 5.4 0 2.2 1.9 3.6 4.1 3.6 1.1 0 1.6-.4 2.1-.4s1 .4 2.1.4c2.2 0 4.1-1.4 4.1-3.6 0-3-2.6-5.4-6.2-5.4Z" />
    </svg>
  )
}

// Icono outline para mostrar contraseña.
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  )
}

// Icono outline para ocultar contraseña.
function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.7a2.6 2.6 0 0 0 3.7 3.7" />
      <path d="M9.4 5.4A10.4 10.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16.7 16.7 0 0 1-3.2 3.7" />
      <path d="M6.2 6.4A16.2 16.2 0 0 0 2.5 12S6 18.5 12 18.5c1.1 0 2.1-.2 3-.5" />
    </svg>
  )
}

// Aviso discreto para errores del servidor.
function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16.5h.01" />
    </svg>
  )
}
