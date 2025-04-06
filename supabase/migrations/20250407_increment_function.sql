
-- Create a function to increment a column value
CREATE OR REPLACE FUNCTION public.increment_group_members(row_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_value integer;
BEGIN
  -- Get the current value first
  SELECT members INTO current_value FROM public.groups WHERE id = row_id;
  
  -- Increment and update
  UPDATE public.groups SET members = current_value + 1 WHERE id = row_id;
  
  -- Return the new value
  RETURN current_value + 1;
END;
$$;
