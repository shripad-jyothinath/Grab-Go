
// Helper to get current IST time components (Hours 0-23, Minutes 0-59)
const getCurrentIST = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    hourCycle: 'h23' // Forces 0-23 format
  });
  
  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  
  return { hour, minute };
};

export const isRestaurantOpen = (hours: string | undefined): boolean => {
  if (!hours) return false; // Assume closed if no hours set
  
  try {
    const [startStr, endStr] = hours.split(' - ');
    if (!startStr || !endStr) return false;

    const parseTime = (t: string) => {
      // Handles "10:00 AM" or "10:00 PM"
      t = t.trim();
      const [time, modifier] = t.split(' ');
      let [h, m] = time.split(':').map(Number);
      
      // 12-hour format conversion
      if (h === 12 && modifier === 'AM') h = 0;
      else if (h === 12 && modifier === 'PM') h = 12; // Keep 12 PM as 12
      else if (h !== 12 && modifier === 'PM') h += 12;
      
      return h * 60 + m; // Minutes from midnight
    };

    const start = parseTime(startStr);
    const end = parseTime(endStr);
    
    // Get Current Time in IST specifically
    const ist = getCurrentIST();
    const current = ist.hour * 60 + ist.minute;

    if (end < start) {
      // Crosses midnight (e.g. 6 PM to 2 AM)
      // Open if current > start (6 PM - 11:59 PM) OR current < end (0 AM - 2 AM)
      return current >= start || current < end;
    } else {
      // Standard day (e.g. 9 AM to 9 PM)
      return current >= start && current < end;
    }
  } catch (e) {
    console.error("Error parsing time:", e);
    return false;
  }
};

// Helper to display dates in IST format
export const formatToIST = (isoDate: string) => {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return isoDate;
  }
};
