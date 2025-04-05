
// Update the problematic section to handle the Promise correctly:

useEffect(() => {
  const fetchServiceBookings = async () => {
    try {
      setLoadingBookings(true);
      if (id) {
        const bookingsData = await getServiceBookings(id);
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error("Error fetching service bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };
  
  fetchServiceBookings();
}, [id, getServiceBookings]);
