# Dialog Files Migration Checklist

## ✅ Completed (10/31)

- [x] `src/components/dialogs/ChangeCurrencyDialog.tsx`
- [x] `src/components/dialogs/TransactionDetailsDialog.tsx`
- [x] `src/components/dialogs/RoleRequestDialog.tsx`
- [x] `src/components/dialogs/InvestNowDialog.tsx`
- [x] `src/components/tokens/TradeDialog.tsx`
- [x] `src/components/property/modals/InspectionModal.tsx`
- [x] `src/components/property/modals/OfferModal.tsx`
- [x] `src/components/property/modals/RentalRequestModal.tsx`
- [x] `src/components/bookings/RentalAgreementSigning.tsx`
- [x] `src/components/wallet/WalletConnectDialog.tsx`

## 🎉 Phase 1: COMPLETE! (10/10) ✅

- ~~`src/components/dialogs/TransactionDetailsDialog.tsx`~~ ✅
- ~~`src/components/dialogs/RoleRequestDialog.tsx`~~ ✅
- ~~`src/components/dialogs/InvestNowDialog.tsx`~~ ✅
- ~~`src/components/tokens/TradeDialog.tsx`~~ ✅
- ~~`src/components/property/modals/InspectionModal.tsx`~~ ✅
- ~~`src/components/property/modals/OfferModal.tsx`~~ ✅
- ~~`src/components/property/modals/RentalRequestModal.tsx`~~ ✅
- ~~`src/components/bookings/RentalAgreementSigning.tsx`~~ ✅
- ~~`src/components/wallet/WalletConnectDialog.tsx`~~ ✅

## 📋 Phase 2: Medium Priority (11 files)

- [ ] `src/components/dialogs/BuyTokenDialog.tsx`
- [ ] `src/components/dialogs/TokenizePropertyDialog.tsx`
- [ ] `src/components/dialogs/TreeDonationDialog.tsx`
- [ ] `src/components/property/modals/ReservationModal.tsx`
- [ ] `src/components/tokens/EnhancedTradeDialog.tsx`
- [ ] `src/components/messaging/AdminConversationControls.tsx` (2 dialogs)
- [ ] `src/components/investment/polling/CreatePollDialog.tsx`
- [ ] `src/components/investment/InvestmentGroupCreator.tsx`
- [ ] `src/components/profile/ProfileCompletionWizard.tsx`
- [ ] `src/components/admin/PropertyManagement.tsx`

## ⏳ Phase 3: Low Priority (4 files)

- [ ] `src/components/dialogs/PropertyDetailsDialog.tsx`
- [ ] `src/components/dialogs/NotificationSettingsDialog.tsx`
- [ ] `src/pages/AdminContacts.tsx`
- [ ] `src/components/bookings/BookingDetailsPanel.tsx`

## 🚫 Not Migrating (6 files)

- ~~`src/components/property/sheets/InspectionSheet.tsx`~~ (Already mobile-optimized)
- ~~`src/components/property/sheets/OfferSheet.tsx`~~ (Already mobile-optimized)
- ~~`src/components/property/sheets/ReservationSheet.tsx`~~ (Already mobile-optimized)
- ~~`src/components/messaging/AdminActions.tsx`~~ (Popover, different pattern)
- ~~`src/components/wallet/WalletCombobox.tsx`~~ (Popover, different pattern)
- ~~`src/components/Layout.tsx`~~ (Sidebar sheet, layout component)

## 📊 Progress Summary

- **Total Dialogs**: 31 found
- **Migrating**: 25 dialogs
- **Completed**: 10/25 (40% 🚀)
- **Remaining**: 15 dialogs
- **Phase 1**: ✅ COMPLETE! (10/10 - 100%)

## 🎯 Next Actions

1. Start with Phase 1 dialogs (simple, high-impact)
2. Focus on `TransactionDetailsDialog.tsx` as next target
3. Test each migration on both desktop and mobile
4. Update this checklist as you complete each file
