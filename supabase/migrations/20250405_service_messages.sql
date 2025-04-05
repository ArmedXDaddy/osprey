
-- Create a function to get service chat messages
CREATE OR REPLACE FUNCTION public.get_service_chat_messages(p_service_id uuid)
RETURNS TABLE(
  id uuid,
  service_id uuid,
  user_id uuid,
  user_name text,
  user_profile_image text,
  content text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.id,
    sm.service_id,
    sm.user_id,
    sm.user_name,
    sm.user_profile_image,
    sm.content,
    sm.created_at
  FROM 
    service_messages sm
  WHERE 
    sm.service_id = p_service_id
  ORDER BY 
    sm.created_at ASC;
END;
$$;

-- Create a function to send a service chat message
CREATE OR REPLACE FUNCTION public.send_service_chat_message(p_service_id uuid, p_user_id uuid, p_content text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_name TEXT;
  v_user_profile_image TEXT;
  v_message_id UUID;
BEGIN
  -- Get user information
  SELECT name, profile_image INTO v_user_name, v_user_profile_image
  FROM profiles
  WHERE id = p_user_id;
  
  -- Insert the message
  INSERT INTO service_messages (
    service_id,
    user_id,
    user_name,
    user_profile_image,
    content
  )
  VALUES (
    p_service_id,
    p_user_id,
    v_user_name,
    v_user_profile_image,
    p_content
  )
  RETURNING id INTO v_message_id;
  
  RETURN v_message_id;
END;
$$;
