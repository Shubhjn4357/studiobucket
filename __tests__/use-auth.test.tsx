import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useAuth, AuthProvider } from '../src/components/providers/auth-provider'
import { useSession } from 'next-auth/react'
import type { SessionContextValue } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import React from 'react'

vi.mock('next-auth/react')
vi.mock('next/navigation')

describe('useAuth', () => {
  it('should throw error when used outside of AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider')
  })

  it('should return authentication status', () => {
    const mockSession = { data: { user: { id: '1' } }, status: 'authenticated' }
    vi.mocked(useSession).mockReturnValue(mockSession as unknown as SessionContextValue<true>)
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as unknown as AppRouterInstance)
    vi.mocked(usePathname).mockReturnValue('/dashboard')

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.status).toBe('authenticated')
  })
})
