# Portfolio & Interview Material

## Resume description
Life RPG — full-stack gamified productivity app (React, Node/Express, MongoDB). Users turn goals into quests and daily habits, earn XP, level up and maintain daily streaks.

## Resume bullets (describe what is implemented; add metrics only if you measure them)
- Built a full-stack MERN app with JWT authentication (short-lived access tokens, httpOnly refresh cookie with server-side revocation) and per-user data isolation on every endpoint.
- Designed an XP/leveling engine where level is derived from total XP via a configurable formula, with atomic, idempotent quest completion so rewards are granted once even under concurrent requests.
- Implemented timezone-aware daily habits and streaks using calendar-date keys and a unique database index to prevent duplicate rewards.
- Developed a responsive React dashboard with Recharts, protected routes, reusable modal/form components and a centralized Midnight Blue design-token system.
- Wrote unit tests for leveling and streak logic and API integration tests for auth, ownership, and once-only XP.

## Portfolio blurb
Life RPG gamifies everyday responsibilities: create quests, check off daily habits, earn XP, level up and keep your streak alive. Built with React, Express and MongoDB, with secure auth and server-enforced progression rules.

## Demo checklist
1. Landing page → register a new account. 2. Create quests of each difficulty; show filters/search. 3. Complete a quest → XP toast, bar animates; try completing twice (blocked). 4. Add habits; complete one; reload (state persists). 5. Show dashboard charts and activity. 6. Progress page filters. 7. Settings: change timezone, password; show delete-account confirmation. 8. Resize to mobile; open the menu. 9. Log out; show protected route redirect.

## Likely interview questions
- **Architecture:** Why separate controllers and services? (HTTP vs business rules; services are reusable/testable.)
- **React:** How does auth state persist across refresh? (refresh cookie → new access token on mount.) Why keep the access token out of localStorage? How do you avoid duplicate refresh calls? (shared in-flight promise.)
- **APIs:** How do you prevent mass assignment? Which status codes and why 409 for repeated completion?
- **Auth:** Access vs refresh token tradeoffs; how is logout/revocation done (`tokenVersion`); CSRF and `SameSite`.
- **MongoDB:** Why a unique compound index on `(habit,date)`? Why atomic `findOneAndUpdate` for completion? What are the limits without transactions?
- **Leveling:** Why derive level instead of storing it? How do multi-level jumps work? How would you rebalance the curve?
- **Dates:** Why date strings in the user's timezone instead of timers or UTC timestamps?
