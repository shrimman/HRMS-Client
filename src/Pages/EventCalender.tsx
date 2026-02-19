import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import 'temporal-polyfill/global'
import '@schedule-x/theme-default/dist/index.css';
import { useEffect, useState } from 'react'

function CalendarApp() {
  const eventsService = useState(() => createEventsServicePlugin())[0]

  const calendar = useCalendarApp({
    timezone: 'Asia/Tokyo',
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    dayBoundaries: {
      start: '05:00',
      end: '24:00',
    },
    events: [
      {
        id: '1',
        title: 'GAME SCEHEDULE: I booked this event',
        start: Temporal.ZonedDateTime.from('2026-02-19T10:00:00+09:00[Asia/Tokyo]'),
        end: Temporal.ZonedDateTime.from('2026-02-19T12:00:00+09:00[Asia/Tokyo]'),
      },
    ],
    plugins: [eventsService]
  })

  useEffect(() => {
    eventsService.getAll()
  }, [])

  return (
    <div>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  )
}

export default CalendarApp