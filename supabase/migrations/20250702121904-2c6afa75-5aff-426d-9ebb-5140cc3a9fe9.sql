-- Add payment URL and reference columns to bookings tables
ALTER TABLE public.rentals 
ADD COLUMN payment_url TEXT,
ADD COLUMN payment_reference TEXT;

ALTER TABLE public.reservations 
ADD COLUMN payment_url TEXT,
ADD COLUMN payment_reference TEXT;