
-- Function to create a new service
CREATE OR REPLACE FUNCTION public.create_service(
  title TEXT,
  description TEXT,
  coach_id UUID,
  coach_name TEXT,
  service_type TEXT,
  capacity INTEGER,
  price NUMERIC,
  is_free BOOLEAN,
  duration TEXT,
  image TEXT,
  location TEXT,
  is_online BOOLEAN,
  meeting_url TEXT,
  is_active BOOLEAN
) RETURNS SETOF services AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.services (
    title, 
    description, 
    coach_id, 
    coach_name, 
    service_type, 
    capacity, 
    price, 
    is_free, 
    duration, 
    image, 
    location, 
    is_online, 
    meeting_url, 
    is_active
  )
  VALUES (
    title, 
    description, 
    coach_id, 
    coach_name, 
    service_type, 
    capacity, 
    price, 
    is_free, 
    duration, 
    image, 
    location, 
    is_online, 
    meeting_url, 
    is_active
  )
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a service
CREATE OR REPLACE FUNCTION public.update_service(
  id UUID,
  title TEXT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  service_type TEXT DEFAULT NULL,
  capacity INTEGER DEFAULT NULL,
  price NUMERIC DEFAULT NULL,
  is_free BOOLEAN DEFAULT NULL,
  duration TEXT DEFAULT NULL,
  image TEXT DEFAULT NULL,
  location TEXT DEFAULT NULL,
  is_online BOOLEAN DEFAULT NULL,
  meeting_url TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT NULL
) RETURNS SETOF services AS $$
BEGIN
  RETURN QUERY
  UPDATE public.services
  SET
    title = COALESCE(update_service.title, services.title),
    description = COALESCE(update_service.description, services.description),
    service_type = COALESCE(update_service.service_type, services.service_type),
    capacity = COALESCE(update_service.capacity, services.capacity),
    price = COALESCE(update_service.price, services.price),
    is_free = COALESCE(update_service.is_free, services.is_free),
    duration = COALESCE(update_service.duration, services.duration),
    image = COALESCE(update_service.image, services.image),
    location = COALESCE(update_service.location, services.location),
    is_online = COALESCE(update_service.is_online, services.is_online),
    meeting_url = COALESCE(update_service.meeting_url, services.meeting_url),
    is_active = COALESCE(update_service.is_active, services.is_active),
    updated_at = COALESCE(update_service.updated_at, now())
  WHERE services.id = update_service.id
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a service
CREATE OR REPLACE FUNCTION public.delete_service(id UUID) RETURNS void AS $$
BEGIN
  DELETE FROM public.services WHERE services.id = delete_service.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get service enrollments
CREATE OR REPLACE FUNCTION public.get_service_enrollments(service_id UUID) RETURNS SETOF service_enrollments AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.service_enrollments
  WHERE service_enrollments.service_id = get_service_enrollments.service_id
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user enrollments
CREATE OR REPLACE FUNCTION public.get_user_enrollments(user_id UUID) RETURNS SETOF service_enrollments AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.service_enrollments
  WHERE service_enrollments.user_id = get_user_enrollments.user_id
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a service enrollment
CREATE OR REPLACE FUNCTION public.create_service_enrollment(
  service_id UUID,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  user_profile_image TEXT,
  status TEXT,
  payment_status TEXT
) RETURNS SETOF service_enrollments AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.service_enrollments (
    service_id,
    user_id,
    user_name,
    user_email,
    user_profile_image,
    status,
    payment_status
  )
  VALUES (
    service_id,
    user_id,
    user_name,
    user_email,
    user_profile_image,
    status,
    payment_status
  )
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update enrollment status
CREATE OR REPLACE FUNCTION public.update_enrollment_status(
  id UUID,
  status TEXT,
  payment_status TEXT DEFAULT NULL
) RETURNS SETOF service_enrollments AS $$
BEGIN
  RETURN QUERY
  UPDATE public.service_enrollments
  SET
    status = update_enrollment_status.status,
    payment_status = COALESCE(update_enrollment_status.payment_status, service_enrollments.payment_status)
  WHERE service_enrollments.id = update_enrollment_status.id
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
