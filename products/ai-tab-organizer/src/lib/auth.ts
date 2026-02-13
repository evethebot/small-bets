// ============================================================
// TabFlow AI — Auth Flow (Optional SaaS Backend)
// ============================================================
//
// Stub for token-based authentication. Choose ONE approach:
//
//   A) Chrome Identity API  — for Google OAuth
//   B) launchWebAuthFlow()  — for custom OAuth providers
//   C) Token exchange       — user signs in on your website,
//                             you pass a token to the extension
//
// This file provides the storage/state layer.
// Uncomment the login() implementation that fits your stack.
//
// ============================================================

import { storage } from './storage'
import { STORAGE_KEYS, AUTH } from './constants'
import type { AuthState } from './types'

// --------------------------------------------------
// State helpers
// --------------------------------------------------

const EMPTY_STATE: AuthState = { isAuthenticated: false }

export async function getAuth(): Promise<AuthState> {
  const state = await storage.get<AuthState>(STORAGE_KEYS.AUTH, 'local')
  if (!state) return EMPTY_STATE

  // Auto-expire
  if (state.expiresAt && Date.now() > state.expiresAt) {
    await logout()
    return EMPTY_STATE
  }

  return state
}

export async function isAuthenticated(): Promise<boolean> {
  const state = await getAuth()
  return state.isAuthenticated
}

// --------------------------------------------------
// Login
// --------------------------------------------------

export async function login(): Promise<AuthState> {
  // ── Option A: Google OAuth via chrome.identity ──
  // const token = await chrome.identity.getAuthToken({ interactive: true })
  // const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
  //   headers: { Authorization: `Bearer ${token.token}` },
  // })
  // const user = await res.json()
  // const state: AuthState = {
  //   isAuthenticated: true,
  //   token: token.token,
  //   user: { id: user.sub, email: user.email, name: user.name, avatar: user.picture },
  //   expiresAt: Date.now() + 60 * 60 * 1000,
  // }

  // ── Option B: Custom OAuth via launchWebAuthFlow ──
  // const redirectUrl = chrome.identity.getRedirectURL()
  // const authUrl =
  //   `${AUTH.AUTH_URL}/authorize` +
  //   `?client_id=${AUTH.CLIENT_ID}` +
  //   `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
  //   `&response_type=code` +
  //   `&scope=openid email profile`
  // const responseUrl = await chrome.identity.launchWebAuthFlow({
  //   url: authUrl,
  //   interactive: true,
  // })
  // const code = new URL(responseUrl!).searchParams.get('code')
  // // Exchange code for token via your API…
  // const tokenRes = await fetch(`${AUTH.API_URL}/auth/token`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ code, redirect_uri: redirectUrl }),
  // })
  // const { access_token, user, expires_in } = await tokenRes.json()
  // const state: AuthState = {
  //   isAuthenticated: true,
  //   token: access_token,
  //   user,
  //   expiresAt: Date.now() + expires_in * 1000,
  // }

  // ── Stub (remove when implementing) ──
  void AUTH // suppress unused warning
  const state: AuthState = {
    isAuthenticated: true,
    token: 'stub-token-replace-me',
    user: {
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
    },
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }

  await storage.set(STORAGE_KEYS.AUTH, state, 'local')
  return state
}

// --------------------------------------------------
// Logout
// --------------------------------------------------

export async function logout(): Promise<void> {
  // If using chrome.identity, also revoke:
  // const state = await getAuth()
  // if (state.token) {
  //   await chrome.identity.removeCachedAuthToken({ token: state.token })
  // }

  await storage.remove(STORAGE_KEYS.AUTH, 'local')
}

// --------------------------------------------------
// Token refresh (implement if your auth provider supports it)
// --------------------------------------------------

export async function refreshToken(): Promise<boolean> {
  const state = await getAuth()
  if (!state.token) return false

  // TODO: call your API to refresh the token
  // const res = await fetch(`${AUTH.API_URL}/auth/refresh`, { ... })
  // Update stored state with new token + expiry

  return true
}
