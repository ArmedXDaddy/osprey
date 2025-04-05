
-- Create stored procedure for booking a service
CREATE OR REPLACE FUNCTION public.create_service_booking(
  p_service_id UUID,
  p_user_id UUID,
  p_notes TEXT,
  p_payment_status TEXT DEFAULT 'unpaid',
  p_status TEXT DEFAULT 'pending'
) RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
BEGIN
  INSERT INTO service_bookings (
    service_id,
    user_id,
    notes,
    payment_status,
    status
  ) VALUES (
    p_service_id,
    p_user_id,
    p_notes,
    p_payment_status,
    p_status
  ) RETURNING id INTO v_booking_id;
  
  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create stored procedure for getting user bookings
CREATE OR REPLACE FUNCTION public.get_user_bookings(
  p_user_id UUID
) RETURNS SETOF RECORD AS $$
BEGIN
  RETURN QUERY
  SELECT
    sb.id,
    sb.service_id,
    sb.user_id,
    p.name as user_name,
    p.email as user_email,
    sb.status,
    sb.payment_status,
    sb.notes,
    sb.created_at,
    s.title as service_title,
    s.coach_name,
    s.price,
    s.duration,
    s.is_online,
    s.service_type
  FROM
    service_bookings sb
  JOIN
    services s ON sb.service_id = s.id
  LEFT JOIN
    profiles p ON sb.user_id = p.id
  WHERE
    sb.user_id = p_user_id
  ORDER BY
    sb.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create stored procedure for getting service bookings
CREATE OR REPLACE FUNCTION public.get_service_bookings(
  p_service_id UUID
) RETURNS SETOF RECORD AS $$
BEGIN
  RETURN QUERY
  SELECT
    sb.id,
    sb.service_id,
    sb.user_id,
    p.name as user_name,
    p.email as user_email,
    sb.status,
    sb.payment_status,
    sb.notes,
    sb.created_at
  FROM
    service_bookings sb
  LEFT JOIN
    profiles p ON sb.user_id = p.id
  WHERE
    sb.service_id = p_service_id
  ORDER BY
    sb.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create stored procedure for getting a specific user booking for a service
CREATE OR REPLACE FUNCTION public.get_user_booking_for_service(
  p_service_id UUID,
  p_user_id UUID
) RETURNS SETOF RECORD AS $$
BEGIN
  RETURN QUERY
  SELECT
    sb.id,
    sb.service_id,
    sb.user_id,
    p.name as user_name,
    p.email as user_email,
    sb.status,
    sb.payment_status,
    sb.notes,
    sb.created_at
  FROM
    service_bookings sb
  LEFT JOIN
    profiles p ON sb.user_id = p.id
  WHERE
    sb.service_id = p_service_id
    AND sb.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create stored procedure for cancelling a booking
CREATE OR REPLACE FUNCTION public.cancel_booking(
  p_booking_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE service_bookings
  SET status = 'cancelled'
  WHERE id = p_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create stored procedure for approving a booking
CREATE OR REPLACE FUNCTION public.approve_booking(
  p_booking_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE service_bookings
  SET status = 'approved'
  WHERE id = p_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
