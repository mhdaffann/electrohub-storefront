REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.orders, public.order_items FROM anon, authenticated;
REVOKE ALL ON public.orders, public.order_items FROM anon;