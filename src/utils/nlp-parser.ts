
interface ParsedTask {
  title: string;
  assignee: string;
  dueDate: Date | null;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
}

export function parseNaturalLanguage(input: string): ParsedTask {
  let title = input.trim();
  let assignee = '';
  let dueDate: Date | null = null;
  let priority: 'P1' | 'P2' | 'P3' | 'P4' = 'P3';

  // Extract priority (P1, P2, P3, P4)
  const priorityMatch = input.match(/\b(P[1-4]|priority\s+[1-4])\b/i);
  if (priorityMatch) {
    const match = priorityMatch[0].toLowerCase();
    if (match.includes('p1') || match.includes('1')) priority = 'P1';
    else if (match.includes('p2') || match.includes('2')) priority = 'P2';
    else if (match.includes('p3') || match.includes('3')) priority = 'P3';
    else if (match.includes('p4') || match.includes('4')) priority = 'P4';
    
    title = title.replace(priorityMatch[0], '').trim();
  }

  // Extract assignee (names that appear after action words)
  const namePatterns = [
    /\b(?:for|with|by|to|assign(?:ed)?\s+to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:should|needs to|must|will)\b/i,
    /\b([A-Z][a-z]+)\b(?=\s+(?:by|before|on|at))/i
  ];

  for (const pattern of namePatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      // Check if it's likely a name (not a common word)
      const commonWords = ['today', 'tomorrow', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'morning', 'afternoon', 'evening', 'night', 'am', 'pm'];
      if (!commonWords.includes(match[1].toLowerCase())) {
        assignee = match[1];
        title = title.replace(match[0], '').trim();
        break;
      }
    }
  }

  // Extract date and time
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Time patterns
  const timeMatch = input.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  let hours = 0;
  let minutes = 0;
  
  if (timeMatch) {
    hours = parseInt(timeMatch[1]);
    minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const ampm = timeMatch[3].toLowerCase();
    
    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    title = title.replace(timeMatch[0], '').trim();
  }

  // Date patterns
  const datePatterns = [
    {
      pattern: /\b(tomorrow)\b/i,
      handler: () => {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      }
    },
    {
      pattern: /\b(today)\b/i,
      handler: () => new Date(today)
    },
    {
      pattern: /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      handler: (match: RegExpMatchArray) => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDay = days.indexOf(match[1].toLowerCase());
        const currentDay = now.getDay();
        const daysUntil = targetDay <= currentDay ? 7 - currentDay + targetDay : targetDay - currentDay;
        
        const date = new Date(today);
        date.setDate(date.getDate() + daysUntil);
        return date;
      }
    },
    {
      pattern: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      handler: (match: RegExpMatchArray) => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDay = days.indexOf(match[1].toLowerCase());
        const currentDay = now.getDay();
        const daysUntil = targetDay <= currentDay ? 7 - currentDay + targetDay : targetDay - currentDay;
        
        const date = new Date(today);
        date.setDate(date.getDate() + daysUntil);
        return date;
      }
    },
    {
      pattern: /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
      handler: (match: RegExpMatchArray) => {
        const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const day = parseInt(match[1]);
        const month = months.indexOf(match[2].toLowerCase());
        
        const date = new Date(now.getFullYear(), month, day);
        if (date < now) {
          date.setFullYear(now.getFullYear() + 1);
        }
        return date;
      }
    },
    {
      pattern: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/,
      handler: (match: RegExpMatchArray) => {
        const month = parseInt(match[1]) - 1; // JavaScript months are 0-indexed
        const day = parseInt(match[2]);
        const year = match[3] ? parseInt(match[3]) : now.getFullYear();
        const fullYear = year < 100 ? 2000 + year : year;
        
        return new Date(fullYear, month, day);
      }
    }
  ];

  for (const { pattern, handler } of datePatterns) {
    const match = input.match(pattern);
    if (match) {
      dueDate = handler(match);
      title = title.replace(match[0], '').trim();
      break;
    }
  }

  // Set time if we have both date and time
  if (dueDate && timeMatch) {
    dueDate.setHours(hours, minutes, 0, 0);
  }

  // Clean up title - remove common prepositions and conjunctions at the end
  title = title
    .replace(/\b(by|before|on|at|for|with|to|and|or)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    title: title || input,
    assignee,
    dueDate,
    priority
  };
}
