'use client'

import { ReactNode } from 'react'

interface TestProviderProps {
  children: ReactNode
}

export const TestProvider = ({ children }: TestProviderProps) => {
  return (
    <div>
      {children}
    </div>
  )
}

export default TestProvider