import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { QUEUE_PRIORITY } from '@/lib/constants';
import { QueueLevel } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getQueuePriority(waitingGroup: number): QueueLevel {
  if (waitingGroup === 0) return QUEUE_PRIORITY.LOW;
  if (waitingGroup <= 15) return QUEUE_PRIORITY.LOW;
  if (waitingGroup <= 30) return QUEUE_PRIORITY.MEDIUM;
  return QUEUE_PRIORITY.HIGH;
}
