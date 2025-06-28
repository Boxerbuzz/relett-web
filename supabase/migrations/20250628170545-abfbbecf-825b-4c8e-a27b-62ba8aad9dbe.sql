
-- Create missing triggers for notification functions

-- Trigger for new chat messages
CREATE TRIGGER trigger_notify_new_chat_message
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_chat_message();

-- Trigger for inspection status changes
CREATE TRIGGER trigger_notify_inspection_status_change
    AFTER UPDATE ON public.inspections
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_inspection_status_change();

-- Trigger for rental status changes
CREATE TRIGGER trigger_notify_rental_status_change
    AFTER UPDATE ON public.rentals
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_rental_status_change();

-- Trigger for reservation status changes
CREATE TRIGGER trigger_notify_reservation_status_change
    AFTER UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_reservation_status_change();

-- Trigger for property price changes
CREATE TRIGGER trigger_notify_property_price_change
    AFTER UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_property_price_change();

-- Trigger for identity verification status changes
CREATE TRIGGER trigger_notify_verification_status_change
    AFTER UPDATE ON public.identity_verifications
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_verification_status_change();

-- Trigger for new users (this one already exists in your database)
-- CREATE TRIGGER trigger_handle_new_user
--     AFTER INSERT ON auth.users
--     FOR EACH ROW
--     EXECUTE FUNCTION public.handle_new_user();
