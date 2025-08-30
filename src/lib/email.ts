import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface DailyScheduleTask {
  title: string;
  category: string;
  scheduledTime: string | null;
  priority: string;
  targetMinutes?: number | null;
}

export async function sendDailyScheduleEmail(
  userEmail: string,
  userName: string,
  tasks: DailyScheduleTask[],
  date: string
) {
  const formatTime = (time: string | null) => {
    if (!time) return 'Not scheduled';
    return time;
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'DSA': return '🧮';
      case 'PROJECT': return '💻';
      case 'WRITING': return '✍️';
      case 'LEARNING': return '📚';
      case 'APPLICATION': return '📝';
      case 'INTERVIEW_PREP': return '🤝';
      default: return '📋';
    }
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  // Sort tasks by scheduled time, unscheduled tasks at the end
  const sortedTasks = tasks.sort((a, b) => {
    if (!a.scheduledTime && !b.scheduledTime) return 0;
    if (!a.scheduledTime) return 1;
    if (!b.scheduledTime) return -1;
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  const tasksList = sortedTasks.map(task => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px;">
        ${getCategoryEmoji(task.category)} ${task.title}
      </td>
      <td style="padding: 12px 8px; text-align: center;">
        ${getPriorityEmoji(task.priority)} ${task.priority}
      </td>
      <td style="padding: 12px 8px; text-align: center;">
        ⏰ ${formatTime(task.scheduledTime)}
      </td>
      <td style="padding: 12px 8px; text-align: center;">
        ${task.targetMinutes ? `${task.targetMinutes}min` : '-'}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Daily Schedule - ${date}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🌅 Good Morning, ${userName}!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your schedule for ${date}</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        ${tasks.length > 0 ? `
          <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 20px;">📋 Today's Tasks (${tasks.length})</h2>
          
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #374151;">Task</th>
                <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: #374151;">Priority</th>
                <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: #374151;">Time</th>
                <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: #374151;">Duration</th>
              </tr>
            </thead>
            <tbody>
              ${tasksList}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #1e40af;">
              💡 <strong>Tip:</strong> Start with your scheduled tasks and tackle high-priority items first!
            </p>
          </div>
        ` : `
          <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
            <h2 style="color: #374151; margin: 0 0 10px 0;">No tasks scheduled for today!</h2>
            <p style="color: #6b7280; margin: 0;">Enjoy your free day or consider planning some activities.</p>
          </div>
        `}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            📱 Visit your <a href="${process.env.NEXT_PUBLIC_APP_URL || 'your-app-url'}/dashboard" style="color: #3b82f6; text-decoration: none;">dashboard</a> to manage your tasks
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p>This is an automated daily schedule reminder from Claude Habit Tracker.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Good Morning, ${userName}!

Your schedule for ${date}:

${tasks.length > 0 ? 
  tasks.map((task, index) => 
    `${index + 1}. ${task.title} (${task.category})
   Priority: ${task.priority}
   Time: ${formatTime(task.scheduledTime)}
   Duration: ${task.targetMinutes ? `${task.targetMinutes}min` : 'Not specified'}
`).join('\n') 
  : 'No tasks scheduled for today! Enjoy your free day.'}

Visit your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'your-app-url'}/dashboard

---
Claude Habit Tracker - Daily Schedule Reminder
  `;

  const mailOptions = {
    from: `"Claude Habit Tracker" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `🌅 Your Daily Schedule - ${date}`,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error}`);
  }
}