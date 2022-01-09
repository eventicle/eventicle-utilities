

export interface ScheduleJobRunner {
  addScheduledTask(component: string, name: string, config: { isCron: true; crontab: string } | { isCron: false; timeout: number }, data: any): Promise<void>

  removeSchedule(component: string, name: string): Promise<void>

  addScheduleTaskListener(component: string, exec: (name: string, data: any) => Promise<void>): Promise<void>
}
