import type { Business } from "@shared/schema";

export interface ScheduledPost {
  postType: 'informative' | 'fun_fact' | 'promotional';
  scheduledFor: Date;
}

const SLOWEST_DAY_MAP: Record<string, number> = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
};

function getRandomTime(startHour: number = 7, startMinute: number = 0, endHour: number = 9, endMinute: number = 30): { hour: number; minute: number } {
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  const randomMinutes = Math.floor(Math.random() * (endMinutes - startMinutes + 1)) + startMinutes;
  
  return {
    hour: Math.floor(randomMinutes / 60),
    minute: randomMinutes % 60,
  };
}

function getNextWeekday(date: Date, targetDayOfWeek: number): Date {
  const result = new Date(date);
  const currentDay = result.getDay();
  const daysUntilTarget = (targetDayOfWeek - currentDay + 7) % 7;
  result.setDate(result.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
  return result;
}

export function generateWeeklySchedule(business: Business, weekStartDate: Date = new Date()): ScheduledPost[] {
  const slowestDayNumber = SLOWEST_DAY_MAP[business.slowestDay] ?? 1;
  
  const weekStart = new Date(weekStartDate);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  const slowestDay = getNextWeekday(weekStart, slowestDayNumber);
  
  let fourDaysBefore = new Date(slowestDay);
  fourDaysBefore.setDate(slowestDay.getDate() - 4);
  
  if (fourDaysBefore < weekStart) {
    fourDaysBefore = new Date(weekStart);
  }
  
  let twoDaysBefore = new Date(slowestDay);
  twoDaysBefore.setDate(slowestDay.getDate() - 2);
  
  if (twoDaysBefore < weekStart) {
    twoDaysBefore = new Date(weekStart);
    twoDaysBefore.setDate(weekStart.getDate() + 1);
  }
  
  const postTypes: Array<'informative' | 'fun_fact' | 'promotional'> = [
    'informative',
    'informative',
    'informative',
    'fun_fact',
    'fun_fact',
    'promotional',
    'promotional',
  ];
  
  const schedule: ScheduledPost[] = [];
  const usedDates = new Set<string>();
  
  const promotionalDates = [fourDaysBefore, twoDaysBefore];
  let promotionalIndex = 0;
  
  for (const postType of postTypes) {
    let scheduledDate: Date;
    
    if (postType === 'promotional' && promotionalIndex < 2) {
      scheduledDate = new Date(promotionalDates[promotionalIndex]);
      promotionalIndex++;
    } else {
      let attempts = 0;
      do {
        const randomDaysOffset = Math.floor(Math.random() * 7);
        scheduledDate = new Date(weekStart);
        scheduledDate.setDate(weekStart.getDate() + randomDaysOffset);
        attempts++;
        
        if (attempts > 20) {
          scheduledDate.setDate(weekStart.getDate() + schedule.length);
          break;
        }
      } while (usedDates.has(scheduledDate.toDateString()));
    }
    
    usedDates.add(scheduledDate.toDateString());
    
    const time = getRandomTime();
    scheduledDate.setHours(time.hour, time.minute, 0, 0);
    
    schedule.push({
      postType,
      scheduledFor: scheduledDate,
    });
  }
  
  schedule.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  
  return schedule;
}
