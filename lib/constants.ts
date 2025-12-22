// Queue priority levels based on waiting group size

export const QUEUE_PRIORITY = {
  LOW: 'LOW', // 0-20 people
  MEDIUM: 'MEDIUM', // 21-50 people
  HIGH: 'HIGH', // 51-100 people
  EXTREME: 'EXTREME', // 100+ people
} as const;
