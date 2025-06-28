"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

interface ResponsiveDialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface ResponsiveDialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface ResponsiveDialogContentProps {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

interface ResponsiveDialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDialogTitleProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDialogFooterProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDialogCloseProps {
  children: React.ReactNode
  asChild?: boolean
}

const ResponsiveDialogContext = React.createContext<{ isMobile: boolean }>({
  isMobile: false,
})

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md", 
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  full: "sm:max-w-full"
}

export function ResponsiveDialog({ children, open, onOpenChange }: ResponsiveDialogProps) {
  const isMobile = useIsMobile()

  return (
    <ResponsiveDialogContext.Provider value={{ isMobile }}>
      {isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      )}
    </ResponsiveDialogContext.Provider>
  )
}

export function ResponsiveDialogTrigger({ children, asChild }: ResponsiveDialogTriggerProps) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)

  return isMobile ? (
    <DrawerTrigger asChild={asChild}>{children}</DrawerTrigger>
  ) : (
    <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
  )
}

export function ResponsiveDialogContent({ 
  children, 
  className, 
  size = "md" 
}: ResponsiveDialogContentProps) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)

  if (isMobile) {
    return (
      <DrawerContent className={cn("max-h-[90vh]", className)}>
        {children}
      </DrawerContent>
    )
  }

  return (
    <DialogContent className={cn(sizeClasses[size], className)}>
      {children}
    </DialogContent>
  )
}

export function ResponsiveDialogHeader({ children, className }: ResponsiveDialogHeaderProps) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)

  return isMobile ? (
    <DrawerHeader className={cn("text-left", className)}>
      {children}
    </DrawerHeader>
  ) : (
    <DialogHeader className={className}>
      {children}
    </DialogHeader>
  )
}

export function ResponsiveDialogTitle({ children, className }: ResponsiveDialogTitleProps) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)

  return isMobile ? (
    <DrawerTitle className={className}>{children}</DrawerTitle>
  ) : (
    <DialogTitle className={className}>{children}</DialogTitle>
  )
}

export function ResponsiveDialogDescription({ children, className }: ResponsiveDialogDescriptionProps) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)

  return isMobile ? (
    <DrawerDescription className={className}>{children}</DrawerDescription>
  ) : (
    <DialogDescription className={className}>{children}</DialogDescription>
  )
}

export function ResponsiveDialogFooter({ children, className }: ResponsiveDialogFooterProps) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)

  if (isMobile) {
    return (
      <DrawerFooter className={cn("pt-2", className)}>
        {children}
      </DrawerFooter>
    )
  }

  // For desktop, render footer content directly (no DialogFooter wrapper needed)
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
      {children}
    </div>
  )
}

export function ResponsiveDialogClose({ children, asChild }: ResponsiveDialogCloseProps) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)

  return isMobile ? (
    <DrawerClose asChild={asChild}>{children}</DrawerClose>
  ) : (
    <DialogClose asChild={asChild}>{children}</DialogClose>
  )
}

// Convenience component for common cancel/close button
export function ResponsiveDialogCloseButton({ 
  children = "Cancel", 
  variant = "outline" 
}: { 
  children?: React.ReactNode
  variant?: "outline" | "ghost" | "secondary"
}) {
  return (
    <ResponsiveDialogClose asChild>
      <Button variant={variant}>{children}</Button>
    </ResponsiveDialogClose>
  )
} 