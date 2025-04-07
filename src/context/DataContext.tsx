
const handleEventJoinRequest = async (eventId: string, userId: string, status: 'approved' | 'rejected'): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('join_requests')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    
    if (data) {
      if (status === 'approved') {
        // Ensure both parameters are passed
        await approveEventRequest(data.id, eventId, userId);
      } else {
        await rejectEventRequest(data.id);
      }
    }
  } catch (error: any) {
    console.error("Error handling event join request:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to handle join request",
      variant: "destructive"
    });
    throw new Error(error.message || 'Failed to handle join request');
  }
};
