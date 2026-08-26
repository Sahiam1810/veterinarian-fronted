import type { FormEvent } from 'react'
import { useState } from 'react'
import { BrandLogo } from '@/global/components'
import { useAuth } from '../hooks'
import type { LoginCredentials, AuthUser } from '../types'
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
  const error =
    externalError !== undefined ? externalError : internalAuth.error

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (externalLogin) {
      await externalLogin({ email, password, remember })
    } else {
      await internalAuth.login({ email, password, remember })
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
                className="login-field__input"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="login-field">
              <span className="login-field__label">Contraseña</span>
              <input
                className="login-field__input"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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

            {error ? (
              <div className="login-card__error-box">
                <p className="login-card__error">{error}</p>
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

