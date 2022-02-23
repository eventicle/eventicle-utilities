

export interface ScheduleJobRunner {
  addScheduledTask(component: string, name: string, id: string, config: { isCron: true; crontab: string } | { isCron: false; timeout: number }, data: any): Promise<void>

  removeSchedule(component: string, name: string, id: string): Promise<void>

  addScheduleTaskListener(component: string, exec: (name: string, id: string, data: any) => Promise<void>): Promise<void>
}
