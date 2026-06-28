# Timer feature

- Timer lives on its own page
- Timer can be started, paused and stopped
- When the timer is stopped a UI opens where the user has to select a project. After the project is selected the timer is destroyed and the time recorded with it is created as time entries assigned to the selected project
- Timers are stored in the database and can be resumed after the application is closed and reopened or if the user signs out and back in.
- For a user there exists one timer at a time. A timer can have zero or more start pause entries that record when the timer is started and paused. If a timer is running the last start pause entry has a start time but no pause time. If a timer is paused the last start pause entry has both a start and a pause time. When a timer is stopped the last start pause entry is paused if it was running. The user had to select a project to assign the stopped timer to and all the start pause entries are converted to time entries assigned to the selected project. The timer with all its start pause entries is then destroyed.
- Don't use verbs in the endpoint paths as it is a RESTful API. Use nouns instead of verbs. For example you can post to `.../start` to create a start for a timer. The method should also be named `createTimerStart` instead of `startTimer`
- If there is no start pause entry without a pause time the timer is paused. If there is a start pause entry without a pause time the timer is running.
