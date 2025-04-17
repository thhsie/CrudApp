export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Invalid Date';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { // Or your preferred locale/format
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return 'Invalid Date';
  }
};

export const formatLeaveDate = (dateString: string, isHalfDay: boolean, position: 'start' | 'end'): string => {
  const baseFormattedDate = formatDate(dateString);
  if (baseFormattedDate === 'Invalid Date') return baseFormattedDate;

  if (isHalfDay) {
    // Append AM/PM marker based on position
    return `${baseFormattedDate} (${position === 'start' ? 'AM' : 'PM'})`;
    // Alternative: return `${baseFormattedDate} (Half Day)`;
  }
  return baseFormattedDate;
};