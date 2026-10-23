# GIP Dev Challenges

This is a repository for the GIP-26 Dev challenges, it includes solutions to all of the 7 problems.

All 7 problems have been solved in a way to be hosted as one service.
Frontend and DSA problems testable from the UI.
Backend problems *should* be testable through the swagger Docs UI on `/docs`

## Problem Solutions

### Frontend Problems

Frontend Problems Solutions (Without Most glue code) can be found in:

1. `frontend-vanilla/` for problem #1
2. `frontend/src/solutions/FuzzySearch.ts` and `frontend/src/solutions/AutoComplete.tsx` for problem #2

### DSA Problems

DSA Problems  can be found in:

1. `frontend/src/solutions/DifferentBitString.ts`
2. `frontend/src/solutions/SmallestInt.ts`

### Backend Problems

Each Backend problem lives in its own sub directory under `backend/src/problems`.

- `router.ts` Includes code relating to express handling and routing.
- `controller.ts` Includes the actual executing code / service code.

Other Files exist to help with the backend:

- `middleware.ts` Middleware for the problems such body validation, auth validation, admin keys and error handling
- `db.ts` the Postgres Pool and a migrate function to run migrations.
- `errors.ts` Error Helper classes so that not every error is a 500

There is also a test suite that can be ran on the backend via `pnpm test` it includes tests for all 3 problems.

## Setting Up

To launch the program all you need to do is:

1. Create the `.env` File based on the `.env.example` File provided.
2. Run `./build.sh` on the project root
3. Run `docker compose up -d db` to run the database (Make sure the URL in env is correct)
4. Run `NODE_ENV=production pnpm start` on the backend folder
5. Visit localhost

Alternatively You can check the [Live Link](https://gip-dev-challenges.onrender.com)
Everything is hosted on render.
Hope everything is satisfactory