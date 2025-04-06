
-- Function to check if a user is registered for a workshop
CREATE OR REPLACE FUNCTION public.check_workshop_registration(
  p_workshop_id UUID,
  p_user_id UUID
) 
RETURNS SETOF workshop_registrations
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM workshop_registrations
  WHERE workshop_id = p_workshop_id
  AND user_id = p_user_id;
$$;

-- Function to count registrations for a workshop
CREATE OR REPLACE FUNCTION public.count_workshop_registrations(
  p_workshop_id UUID
)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM workshop_registrations
  WHERE workshop_id = p_workshop_id;
$$;

-- Function to create a workshop registration
CREATE OR REPLACE FUNCTION public.create_workshop_registration(
  p_workshop_id UUID,
  p_user_id UUID,
  p_user_name TEXT,
  p_user_email TEXT,
  p_user_profile_image TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_registration_id UUID;
BEGIN
  INSERT INTO workshop_registrations (
    workshop_id,
    user_id,
    user_name,
    user_email,
    user_profile_image,
    status
  )
  VALUES (
    p_workshop_id,
    p_user_id,
    p_user_name,
    p_user_email,
    p_user_profile_image,
    'confirmed'
  )
  RETURNING id INTO v_registration_id;
  
  RETURN v_registration_id;
END;
$$;

-- Function to delete a workshop registration
CREATE OR REPLACE FUNCTION public.delete_workshop_registration(
  p_workshop_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_deleted INTEGER;
BEGIN
  DELETE FROM workshop_registrations
  WHERE workshop_id = p_workshop_id
  AND user_id = p_user_id
  RETURNING 1 INTO rows_deleted;
  
  RETURN FOUND;
END;
$$;

-- Function to get all registrations for a workshop
CREATE OR REPLACE FUNCTION public.get_workshop_registrations(
  p_workshop_id UUID
)
RETURNS SETOF workshop_registrations
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM workshop_registrations
  WHERE workshop_id = p_workshop_id
  ORDER BY created_at DESC;
$$;
