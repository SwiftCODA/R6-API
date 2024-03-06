import cron from 'node-cron'
import { UbiLoginManager } from '../http/ubi-auth'


export default function ScheduleLogin() {
    // Login to Ubisoft accounts every 2 hours.
    cron.schedule('0 */2 * * *', () => {
        UbiLoginManager.instance.Login()
    })
}