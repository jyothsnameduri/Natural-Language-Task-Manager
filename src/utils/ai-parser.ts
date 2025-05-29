import { Task } from '@/pages/Index';

// Add type declaration for Vite's env
interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface AIParsedTask {
  title: string;
  assignee: string | null;
  dueDate: string | null; // ISO string format
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'pending' | 'in-progress' | 'completed';
  description?: string;
  tags?: string[];
}

const today = new Date();
const todayISO = today.toISOString().split('T')[0];
const timezone = 'Asia/Kolkata';
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const tomorrowISO = tomorrow.toISOString().split('T')[0];

const SYSTEM_PROMPT = `Today is ${todayISO}. The current timezone is ${timezone}.
For any time expressions like "tomorrow", always add one day to today's date (${todayISO}) in the ${timezone} timezone. For example, if today is ${todayISO} and the user says "tomorrow 5pm", the dueDate should be "${tomorrowISO}T17:00:00+05:30" (for Asia/Kolkata).
You are a task parsing assistant. Your job is to extract structured information from natural language task descriptions.
You should return a JSON object with the following fields:
- title: The main task title/description
- assignee: The person assigned to the task (null if not specified)
- dueDate: The due date in ISO format (null if not specified). All times should be interpreted in the ${timezone} timezone.
- priority: One of P1 (urgent), P2 (high), P3 (normal), P4 (low)
- status: One of pending, in-progress, completed
- description: Optional detailed description
- tags: Optional array of relevant tags

Rules for parsing:
1. For dates, convert all relative dates (today, tomorrow, next week) to actual dates, using the current date: ${todayISO} and the timezone: ${timezone}.
2. For priorities, use context clues (urgent, important, ASAP = P1; high priority = P2; normal = P3; low = P4)
3. If multiple tasks are described, return an array of task objects
4. If the input is ambiguous, make reasonable assumptions based on context
5. Always return valid JSON that matches the interface exactly

Example input: "Need to finish the landing page by tomorrow 5pm, it's urgent"
Example output: {
  "title": "Finish landing page",
  "assignee": null,
  "dueDate": "${tomorrowISO}T17:00:00+05:30",
  "priority": "P1",
  "status": "pending",
  "description": "Complete the landing page implementation",
  "tags": ["frontend", "design"]
}`;

export async function parseTaskWithAI(input: string): Promise<Omit<Task, 'id' | 'createdAt'> | Omit<Task, 'id' | 'createdAt'>[]> {
  try {
    // Check if API key is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key is not set in environment variables');
      throw new Error('OpenAI API key is not configured');
    }

    console.log('Sending request to OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: input }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('OpenAI API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Failed to parse task with AI: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Received response from OpenAI:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    const parsedContent = JSON.parse(data.choices[0].message.content) as AIParsedTask | AIParsedTask[];
    console.log('Parsed content:', parsedContent);

    // Validate the parsed content
    if (!parsedContent || (Array.isArray(parsedContent) && parsedContent.length === 0)) {
      throw new Error('No valid tasks found in the parsed content');
    }

    // Convert the AI response to our task format
    const convertToTask = (parsed: AIParsedTask): Omit<Task, 'id' | 'createdAt'> => {
      const task = {
        title: parsed.title,
        assignee: parsed.assignee || '',
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
        priority: parsed.priority,
        status: parsed.status
      };
      console.log('Converted task:', task);
      return task;
    };

    // Handle both single task and array of tasks
    if (Array.isArray(parsedContent)) {
      const tasks = parsedContent.map(convertToTask);
      console.log('Converted multiple tasks:', tasks);
      return tasks;
    }
    
    const task = convertToTask(parsedContent);
    console.log('Converted single task:', task);
    return task;
  } catch (error) {
    console.error('Error parsing task with AI:', error);
    // Fallback to basic parsing if AI parsing fails
    const fallbackTask: Omit<Task, 'id' | 'createdAt'> = {
      title: input,
      assignee: '',
      dueDate: null,
      priority: 'P3' as const,
      status: 'pending' as const
    };
    console.log('Using fallback task:', fallbackTask);
    return fallbackTask;
  }
} 