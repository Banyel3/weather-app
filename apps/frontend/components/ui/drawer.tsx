'use client'

import * as React from 'react';
import type { FC, ReactNode, ButtonHTMLAttributes, HTMLAttributes } from 'react';
// Removed vaul dependency. Using custom drawer implementation.

import { cn } from '@/lib/utils'

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Drawer({ isOpen, onClose, children }: DrawerProps) {
  if (!isOpen) return null;
  return (
    <div data-slot="drawer" className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-background z-10 rounded-lg shadow-lg p-4 min-w-[300px]">
        {children}
      </div>
    </div>
  );
}

// DrawerTrigger can be a simple button
interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
function DrawerTrigger({ ...props }: DrawerTriggerProps) {
  return <button data-slot="drawer-trigger" {...props} />;
}

// DrawerPortal is not needed in this custom implementation

// DrawerClose can be a simple button
interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
function DrawerClose({ ...props }: DrawerCloseProps) {
  return <button data-slot="drawer-close" {...props} />;
}

// DrawerOverlay is handled in Drawer component

// DrawerContent is handled in Drawer component

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn('flex flex-col gap-0.5 p-4 text-center md:gap-1.5 md:text-left', className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 data-slot="drawer-title" className={cn('text-foreground font-semibold', className)} {...props} />
  );
}

function DrawerDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p data-slot="drawer-description" className={cn('text-muted-foreground text-sm', className)} {...props} />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
