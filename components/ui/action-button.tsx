'use client'

import React from 'react'
import { Button, ButtonProps } from './button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
import { useRole } from '@/hooks/use-role'

interface ActionButtonProps extends ButtonProps {
  actionType?: 'sales' | 'ops' | 'finance' | 'admin' | 'any'
  demoMessage?: string
}

/**
 * Button that automatically disables based on role and demo mode
 */
export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({
    actionType = 'any',
    demoMessage = 'Demo data is read-only',
    children,
    disabled,
    onClick,
    ...props
  }, ref) => {
    const { isDemo, canWrite, canWriteSales, canWriteOps, canWriteFinance, canWriteAdmin, loading } = useRole()

    const canPerform = actionType === 'any' ? canWrite
      : actionType === 'sales' ? canWriteSales
      : actionType === 'ops' ? canWriteOps
      : actionType === 'finance' ? canWriteFinance
      : actionType === 'admin' ? canWriteAdmin
      : false

    const isDisabled = loading || disabled || !canPerform

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault()
        return
      }
      if (onClick) {
        onClick(e)
      }
    }

    if (isDisabled && (isDemo || !canPerform)) {
      const reason = isDemo ? demoMessage : 'You do not have permission to perform this action'
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span title={reason} data-disabled-reason={reason}>
                <Button {...props} ref={ref} disabled={true} onClick={handleClick} title={reason} data-disabled-reason={reason}>
                  {children}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {reason}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <Button {...props} ref={ref} disabled={isDisabled} onClick={handleClick}>
        {children}
      </Button>
    )
  }
)

ActionButton.displayName = "ActionButton"

