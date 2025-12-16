'use client'

import React from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface PermissionButtonProps extends ButtonProps {
  allowed: boolean
  disabledReason: string
}

export const PermissionButton = React.forwardRef<HTMLButtonElement, PermissionButtonProps>(
  ({ allowed, disabledReason, disabled, onClick, children, ...props }, ref) => {
    const isDisabled = Boolean(disabled) || !allowed

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault()
        return
      }
      onClick?.(e)
    }

    if (isDisabled) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span title={disabledReason} data-disabled-reason={disabledReason}>
                <Button
                  ref={ref}
                  {...props}
                  disabled={true}
                  onClick={handleClick}
                  title={disabledReason}
                  data-disabled-reason={disabledReason}
                >
                  {children}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{disabledReason}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <Button ref={ref} {...props} disabled={false} onClick={handleClick}>
        {children}
      </Button>
    )
  }
)

PermissionButton.displayName = 'PermissionButton'

