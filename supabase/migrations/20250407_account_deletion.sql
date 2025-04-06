
-- Create a function to handle user account deletion
CREATE OR REPLACE FUNCTION public.delete_user(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all user data from public tables first
  -- (Add more tables as needed based on your schema)
  
  -- Delete the user from the auth.users table
  -- This will cascade to the profiles table if you have a reference
  DELETE FROM auth.users WHERE id = user_id;
  
  RETURN;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user TO authenticated;
