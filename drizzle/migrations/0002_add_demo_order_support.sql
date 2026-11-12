ALTER TABLE public.orders ADD COLUMN is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN idempotency_key uuid;
CREATE UNIQUE INDEX orders_user_idempotency_key_idx ON public.orders (user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
COMMENT ON COLUMN public.orders.is_demo IS 'True for orders placed through demo checkout: no payment was taken.';
COMMENT ON COLUMN public.orders.idempotency_key IS 'Per-checkout key from the client so a repeated submit returns the same order.';

-- Creates a demo order and its items in one transaction. Server-only: prices are computed
-- server-side from the products table before this is called.
CREATE OR REPLACE FUNCTION public.create_demo_order(
  _user_id uuid, _idempotency_key uuid, _subtotal integer, _delivery integer, _total integer,
  _address jsonb, _items jsonb
) RETURNS uuid
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE _order_id uuid;
BEGIN
  IF jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;
  INSERT INTO public.orders (user_id, status, subtotal, delivery_charge, total, currency, shipping_address, is_demo, idempotency_key)
  VALUES (_user_id, 'pending', _subtotal, _delivery, _total, 'INR', _address, true, _idempotency_key)
  ON CONFLICT (user_id, idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
  RETURNING id INTO _order_id;
  IF _order_id IS NULL THEN
    SELECT id INTO _order_id FROM public.orders WHERE user_id = _user_id AND idempotency_key = _idempotency_key;
    RETURN _order_id;
  END IF;
  INSERT INTO public.order_items (order_id, product_id, product_name, unit_price, quantity)
  SELECT _order_id, i->>'product_id', i->>'product_name', (i->>'unit_price')::integer, (i->>'quantity')::integer
  FROM jsonb_array_elements(_items) AS i;
  RETURN _order_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_demo_order(uuid, uuid, integer, integer, integer, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_demo_order(uuid, uuid, integer, integer, integer, jsonb, jsonb) TO service_role;