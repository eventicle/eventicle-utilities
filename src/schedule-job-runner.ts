

export interface ScheduleJobRunner {
  addScheduledTask(component: string, name: string, config: {
    isInterval: true
    initialWaitMillis: number
    interval: number
  } | {
    isInterval: false
    timeout: number
  }, data: any)

  removeSchedule(component: string, name: string)

  addScheduleTaskListener(component: string, exec: (name: string, data: any) => Promise<void>)
}
