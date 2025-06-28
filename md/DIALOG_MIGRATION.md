# Dialog Migration Guide

## Overview

This guide covers migrating all dialogs to use the new `ResponsiveDialog` component that automatically switches between Dialog (desktop) and Drawer (mobile).

## Import Changes

```tsx
// OLD
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// NEW  
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogCloseButton,
} from "@/components/ui/responsive-dialog"
```

## Usage Example

```tsx
// OLD Pattern
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    
    {/* Dialog content */}
    
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
      <Button onClick={handleSave}>Save</Button>
    </div>
  </DialogContent>
</Dialog>

// NEW Pattern
<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
  <ResponsiveDialogContent size="md">
    <ResponsiveDialogHeader>
      <ResponsiveDialogTitle>Dialog Title</ResponsiveDialogTitle>
      <ResponsiveDialogDescription>Dialog description</ResponsiveDialogDescription>
    </ResponsiveDialogHeader>
    
    {/* Dialog content - mobile gets padding automatically */}
    <div className="px-4 md:px-0">
      {/* Your content */}
    </div>
    
    <ResponsiveDialogFooter>
      <ResponsiveDialogCloseButton />
      <Button onClick={handleSave}>Save</Button>
    </ResponsiveDialogFooter>
  </ResponsiveDialogContent>
</ResponsiveDialog>
```

## Size Options

- `sm`: 384px max width
- `md`: 448px max width (default)
- `lg`: 512px max width  
- `xl`: 576px max width
- `full`: Full width

## Key Migration Changes

### 1. Automatic Mobile Adaptation

- **Desktop**: Shows as centered dialog
- **Mobile**: Shows as bottom sheet (drawer)
- **Responsive**: Automatically switches at 768px breakpoint

### 2. Simplified Content Structure

```tsx
// OLD: Manual padding and responsive classes
<div className="space-y-6">
  {/* Content with no mobile considerations */}
</div>

// NEW: Responsive padding built-in
<div className="space-y-6 px-4 md:px-0">
  {/* Content automatically responsive */}
</div>
```

### 3. Standardized Footer

```tsx
// OLD: Custom button layout
<div className="flex gap-2">
  <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
  <Button onClick={handleSave}>Save</Button>
</div>

// NEW: Responsive footer with standard close button
<ResponsiveDialogFooter>
  <ResponsiveDialogCloseButton />
  <Button onClick={handleSave}>Save</Button>
</ResponsiveDialogFooter>
```

## Dialogs to Migrate

### Core Dialogs (src/components/dialogs/)

- [x] **ResponsiveDialog** - ✅ Created
- [ ] **BuyTokenDialog.tsx** - Investment dialog with tabs
- [x] **ChangeCurrencyDialog.tsx** - ✅ Migrated (Example)
- [ ] **InvestNowDialog.tsx** - Investment form with calculations
- [ ] **NotificationSettingsDialog.tsx** - Large settings form
- [ ] **PropertyDetailsDialog.tsx** - Complex property viewer
- [ ] **RoleRequestDialog.tsx** - Role selection form
- [ ] **TokenizePropertyDialog.tsx** - Multi-step property tokenization
- [ ] **TransactionDetailsDialog.tsx** - Transaction viewer
- [ ] **TreeDonationDialog.tsx** - Donation form with options

### Property Modals (src/components/property/modals/)

- [ ] **InspectionModal.tsx** - Inspection booking
- [ ] **OfferModal.tsx** - Property offer form
- [ ] **RentalRequestModal.tsx** - Rental application
- [ ] **ReservationModal.tsx** - Property reservation

### Token Dialogs (src/components/tokens/)

- [ ] **EnhancedTradeDialog.tsx** - Advanced trading interface
- [ ] **TradeDialog.tsx** - Basic trading form

### Other Dialogs

- [ ] **AdminConversationControls.tsx** - Admin message controls (2 dialogs)
- [ ] **WalletConnectDialog.tsx** - Wallet connection
- [ ] **ProfileCompletionWizard.tsx** - Profile setup wizard
- [ ] **RentalAgreementSigning.tsx** - Agreement signing
- [ ] **InvestmentGroupCreator.tsx** - Group creation
- [ ] **CreatePollDialog.tsx** - Poll creation

## Migration Priority

### Phase 1 (High Priority - Simple Forms)

1. ChangeCurrencyDialog - Simple form
2. TransactionDetailsDialog - Read-only viewer
3. RoleRequestDialog - Form with validation

### Phase 2 (Medium Priority - Complex Forms)

1. InvestNowDialog - Investment calculations
2. TokenizePropertyDialog - Multi-step form
3. TreeDonationDialog - Options with calculations

### Phase 3 (Low Priority - Complex Interfaces)

1. BuyTokenDialog - Tabs with wallet integration
2. PropertyDetailsDialog - Complex property viewer
3. NotificationSettingsDialog - Large settings form

## Benefits After Migration

✅ **Mobile-First Experience** - Automatic bottom sheet on mobile
✅ **Consistent UX** - Same behavior across all dialogs
✅ **Reduced Boilerplate** - ~40% less code per dialog
✅ **Better Accessibility** - Improved screen reader support
✅ **Maintainable** - Single source of truth for dialog behavior

## Testing Checklist

- [ ] Desktop: Dialog appears centered
- [ ] Mobile: Drawer slides up from bottom
- [ ] Responsive: Breakpoint at 768px works correctly
- [ ] Accessibility: Screen readers work properly
- [ ] Keyboard Navigation: Tab/Enter/Escape work
- [ ] Touch: Swipe to close works on mobile
