import { QueuePriority } from '@/lib/types';
import { QUEUE_PRIORITY } from './constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// Helper function to determine queue priority

export function getQueuePriority(waitingGroup: number): QueuePriority {
  if (waitingGroup === 0) return QUEUE_PRIORITY.LOW;
  if (waitingGroup <= 15) return QUEUE_PRIORITY.LOW;
  if (waitingGroup <= 30) return QUEUE_PRIORITY.MEDIUM;
  return QUEUE_PRIORITY.HIGH;
}
