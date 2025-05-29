
interface ParsedTask {
  title: string;
  assignee: string;
  dueDate: Date | null;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
}

export function parseMeetingMinutes(transcript: string): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  
  // Split transcript into sentences and process each
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  for (const sentence of sentences) {
    const cleanSentence = sentence.trim();
    
    // Look for task assignment patterns
    const taskPatterns = [
      // "Name you/please do task by time"
      /(\w+)\s+(?:you\s+)?(?:please\s+)?(?:take\s+(?:care\s+of\s+)?|do\s+|handle\s+|work\s+on\s+|complete\s+|finish\s+|review\s+|prepare\s+|create\s+|update\s+|fix\s+)([^,]+?)(?:\s+by\s+(.+?))?(?:\.|$)/i,
      // "Name needs to/should task by time"
      /(\w+)\s+(?:needs\s+to|should|must|will)\s+([^,]+?)(?:\s+by\s+(.+?))?(?:\.|$)/i,
      // "Assign task to Name by time"
      /(?:assign|give)\s+([^,]+?)\s+to\s+(\w+)(?:\s+by\s+(.+?))?(?:\.|$)/i
    ];
    
    for (const pattern of taskPatterns) {
      const match = cleanSentence.match(pattern);
      if (match) {
        let assignee = match[1];
        let taskTitle = match[2];
        let timeStr = match[3];
        
        // Handle "assign X to Y" pattern differently
        if (pattern === taskPatterns[2]) {
          assignee = match[2];
          taskTitle = match[1];
        }
        
        // Clean up task title
        taskTitle = taskTitle
          .replace(/^(the\s+|a\s+|an\s+)/i, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Skip if task title is too short or just common words
        if (taskTitle.length < 3 || /^(it|this|that|you|me|us)$/i.test(taskTitle)) {
          continue;
        }
        
        // Parse due date
        const dueDate = timeStr ? parseDateFromText(timeStr.trim()) : null;
        
        // Extract priority if mentioned
        const priority = extractPriority(cleanSentence);
        
        tasks.push({
          title: taskTitle,
          assignee: assignee,
          dueDate,
          priority
        });
        
        break; // Found a match, no need to try other patterns
      }
    }
  }
  
  return tasks;
}

function parseDateFromText(timeStr: string): Date | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Remove common words
  timeStr = timeStr.toLowerCase()
    .replace(/\b(by|before|on|at|this|next|the)\b/g, '')
    .trim();
  
  // Time extraction
  const timeMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  let hours = 0;
  let minutes = 0;
  
  if (timeMatch) {
    hours = parseInt(timeMatch[1]);
    minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const ampm = timeMatch[3];
    
    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    timeStr = timeStr.replace(timeMatch[0], '').trim();
  }
  
  // Date patterns
  const datePatterns = [
    {
      pattern: /tomorrow/,
      handler: () => {
        const date = new Date(today);
        date.setDate(date.getDate() + 1);
        return date;
      }
    },
    {
      pattern: /today|tonight/,
      handler: () => new Date(today)
    },
    {
      pattern: /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/,
      handler: (match: RegExpMatchArray) => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDay = days.indexOf(match[1]);
        const currentDay = now.getDay();
        const daysUntil = targetDay <= currentDay ? 7 - currentDay + targetDay : targetDay - currentDay;
        
        const date = new Date(today);
        date.setDate(date.getDate() + daysUntil);
        return date;
      }
    },
    {
      pattern: /(\d{1,2})\s*(st|nd|rd|th)?\s*(january|february|march|april|may|june|july|august|september|october|november|december)/,
      handler: (match: RegExpMatchArray) => {
        const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const day = parseInt(match[1]);
        const month = months.indexOf(match[3]);
        
        const date = new Date(now.getFullYear(), month, day);
        if (date < now) {
          date.setFullYear(now.getFullYear() + 1);
        }
        return date;
      }
    }
  ];
  
  for (const { pattern, handler } of datePatterns) {
    const match = timeStr.match(pattern);
    if (match) {
      const date = handler(match);
      if (timeMatch) {
        date.setHours(hours, minutes, 0, 0);
      }
      return date;
    }
  }
  
  return null;
}

function extractPriority(text: string): 'P1' | 'P2' | 'P3' | 'P4' {
  const priorityMatch = text.match(/\b(P[1-4]|priority\s+[1-4]|urgent|high\s+priority|critical)\b/i);
  
  if (priorityMatch) {
    const match = priorityMatch[0].toLowerCase();
    if (match.includes('p1') || match.includes('urgent') || match.includes('critical')) return 'P1';
    if (match.includes('p2') || match.includes('high')) return 'P2';
    if (match.includes('p4')) return 'P4';
  }
  
  return 'P3'; // Default priority
}
