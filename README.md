
  # InfraBondX MVP UI/UX Design

  This is a code bundle for InfraBondX MVP UI/UX Design. The original project is available at https://www.figma.com/design/VzBF52k1IBGmarP1DcRqDv/InfraBondX-MVP-UI-UX-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Backend API

  The `backend/` folder contains a dedicated Express + MongoDB service that persists real investor, issuer, and admin data. To boot the API:

  1. `cd backend`
  2. Copy `.env.example` to `.env` and update `JWT_SECRET` (the provided MongoDB Atlas URI is already included).
  3. `npm install`
  4. `npm run dev` (listens on port 5000)

  Use the issued JWT tokens as `Authorization: Bearer <token>` when making requests from the frontend.
  