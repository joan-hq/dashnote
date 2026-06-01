import { 
  format, 
  isToday, 
  isYesterday,
  differenceInDays, 
  parseISO, 
  isValid 
} from "date-fns";

// format date
export const formatDate = (
  date: string | Date,
  pattern: string = "dd mm yyy"
) : string => {
  //pass date or modify date to variable d
  const d  = typeof date === "string" ? parseISO(date) : date
  return isValid(d) ? format(d, pattern) : "Invalid Date"
}


// formatRelativeTIme(date)
export const formatRelativeTime = (dateString: string) : string => {

 if (!dateString) return '';
  
  let date = parseISO(dateString);
    console.log('parseISO result:', date, 'isValid:', isValid(date));
  if (!isValid(date)) {
    date = new Date(dateString);
  }
  if (!isValid(date)) return ''; 

   const now = new Date();
  const target = new Date(dateString);
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


// count how many date after created
export const countDaysToToday = (dateString: string) : number=> {
  const date = parseISO(dateString);
  if(!isValid(date)) return 0;
  return Math.abs(differenceInDays(new Date(), date));
}


// isSameDate: Y->show time; N->show date
export const isSameDateToday = (dateString: string) : string => {
  const date = parseISO(dateString);
  if(!isValid(date)) return dateString;

  if(isToday(date)){
    return format (date, "p");
  }

  return format(date, "d MM");
}

