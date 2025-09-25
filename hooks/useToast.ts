'use client'

import * as React from 'react'
import { useToast as useToastInternal, toast } from '@/lib/toastReducer'

export function useToast() {
  return useToastInternal()
}

export { toast }
