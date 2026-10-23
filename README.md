# Chess Game API

NestJS REST API for user accounts, chess games, player profiles, and AI-assisted
chess moves.

## Contents

- [Getting started](#getting-started)
- [HTTP conventions](#http-conventions)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Health](#health)
  - [Authentication](#authentication-endpoints)
  - [Users](#user-endpoints)
  - [Games](#game-endpoints)
  - [Mail](#mail-endpoint)
- [Frontend integration flow](#frontend-integration-flow)
- [Enums](#enums)
- [Errors](#errors)
- [Development commands](#development-commands)

## Getting started

### Requirements

- Node.js 20 or newer
- npm
- PostgreSQL 13 or newer

### Install and configure

```bash
npm install
```

Create a stage environment file named `.env.stage.dev` with the following
variables. The application selects this file when `STAGE=dev`. Never commit
real credentials or API keys.

| Variable                  | Required      | Description                                                               |
| ------------------------- | ------------- | ------------------------------------------------------------------------- |
| `STAGE`                   | Yes           | Environment name. Set to `dev` for local development.                     |
| `PORT`                    | No            | HTTP port. Defaults to `3000`.                                            |
| `DB_HOST`                 | Yes           | PostgreSQL host.                                                          |
| `DB_PORT`                 | Yes           | PostgreSQL port, normally `5432`.                                         |
| `DB_USERNAME`             | Yes           | PostgreSQL username.                                                      |
| `DB_PASSWOR`              | Yes           | PostgreSQL password. The application currently reads this exact spelling. |
| `DB_DATABASE`             | Yes           | PostgreSQL database name.                                                 |
| `JWT_SECRET`              | Yes           | Secret used to sign and verify access tokens.                             |
| `JWT_EXPIRESIN`           | Yes           | JWT lifetime, for example `1d`.                                           |
| `BCRYPT_SALT`             | Yes           | Number of bcrypt salt rounds.                                             |
| `IMAGEKIT_PRIVATE_KEY`    | Yes           | ImageKit private key used for profile image uploads.                      |
| `GOOGLE_AI_API_KEY`       | For AI games  | Google GenAI key used by the `GEMMEA` opponent.                           |
| `SMTP_HOST`               | For mail test | SMTP host. Defaults to `localhost`.                                       |
| `SMTP_PORT`               | For mail test | SMTP port. Defaults to `1025`.                                            |
| `SMTP_USER` / `SMTP_PASS` | Optional      | SMTP credentials, when required by the mail server.                       |

Start PostgreSQL with Docker if needed:

```bash
docker compose up -d postgres
```

Start the API:

```bash
npm run start:dev
```

The API is available at `http://localhost:3000`. There is no `/api` or version
prefix, so endpoint paths in this document can be appended directly to the
base URL.

## HTTP conventions

- Send JSON with `Content-Type: application/json` unless an endpoint says
  otherwise.
- IDs are UUID strings.
- Dates are returned as ISO-8601 strings.
- Protected routes require
  `Authorization: Bearer <accessToken>`.
- Successful responses are returned directly; the API does not wrap them in a
  `{ data: ... }` envelope.
- Query parameter and enum names are case-sensitive in the documented format.
- The API currently uses Nest's standard error response format:

  ```json
  {
    "statusCode": 400,
    "message": "Description of the error",
    "error": "Bad Request"
  }
  ```

  The exact `message` can be a string, an array, or an object depending on the
  failure.

## Authentication

1. Create an account with `POST /auth/signup`.
2. Log in with `POST /auth/login`.
3. Store the returned `accessToken` securely in the frontend and send it as a
   bearer token on every `/user` and `/game` request.
4. If a protected request returns `401 Unauthorized`, ask the user to log in
   again. Tokens are signed with the configured `JWT_SECRET` and lifetime.

Passwords are never returned by the user endpoints.

## Endpoints

### Health

#### `GET /`

Returns a plain text health response:

```text
Server Running ....
```

### Authentication endpoints

#### `POST /auth/signup`

Creates a user account. All fields are required.

Request body:

```json
{
  "username": "chess-player",
  "email": "player@example.com",
  "password": "StrongPassword123!",
  "confirmPassword": "StrongPassword123!"
}
```

Successful response (`201 Created`):

```json
{
  "message": "Signup Successfull."
}
```

The username and email must be unique. The password and confirmation must
match. A duplicate username or email returns `409 Conflict`.

#### `POST /auth/login`

Authenticates a user.

Request body:

```json
{
  "email": "player@example.com",
  "password": "StrongPassword123!"
}
```

Successful response (`201 Created`):

```json
{
  "accessToken": "<jwt>"
}
```

An unknown email or incorrect password returns `401 Unauthorized`.

### User endpoints

All user endpoints require a bearer token.

#### `GET /user`

Returns the authenticated user's profile and statistics.

Response (`200 OK`):

```json
{
  "id": "user-uuid",
  "username": "chess-player",
  "email": "player@example.com",
  "imageUrl": "https://...",
  "rating": 0,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z",
  "gamesPlayed": 0,
  "wins": 0,
  "losses": 0,
  "draws": 0
}
```

#### `GET /user/:id`

Returns a public profile. The password, email, image URL, and timestamps are
not included.

Response (`200 OK`):

```json
{
  "id": "user-uuid",
  "username": "chess-player",
  "rating": 0,
  "gamesPlayed": 0,
  "wins": 0,
  "losses": 0,
  "draws": 0
}
```

Returns `404 Not Found` when the user does not exist.

#### `POST /user/image`

Uploads or replaces the authenticated user's profile image. Use
`multipart/form-data`, not JSON.

| Form field | Type | Required | Accepted values   |
| ---------- | ---- | -------- | ----------------- |
| `image`    | File | Yes      | JPG, JPEG, or PNG |

Example:

```bash
curl -X POST http://localhost:3000/user/image \
  -H "Authorization: Bearer <accessToken>" \
  -F "image=@./avatar.png"
```

Successful response:

```json
{
  "message": "Image uploaded successfully"
}
```

The exact success message comes from the ImageKit integration. Missing files or
unsupported file types are rejected.

### Game endpoints

All game endpoints require a bearer token. A user can have at most one
`IN_PROGRESS` game; creating another one returns the existing active game.

#### `GET /game`

Lists the authenticated user's games. Optional filters:

| Query parameter | Values                                                          |
| --------------- | --------------------------------------------------------------- |
| `status`        | `IN_PROGRESS`, `WIN`, `LOST`, `DRAW`, `ABANDODNED`, `STALEMATE` |
| `mode`          | `VS_AI`, `VS_PLAYER`                                            |

Example:

```text
GET /game?status=IN_PROGRESS&mode=VS_AI
```

The response is an array of game objects. Each game includes its move history:

```json
[
  {
    "id": "game-uuid",
    "moves": [],
    "status": "IN_PROGRESS",
    "mode": "VS_AI",
    "opponent": "GEMMEA",
    "playerColor": "WHITE",
    "gameBoard": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "turn": "w",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "lastUpdatedAt": "2026-01-01T00:00:00.000Z"
  }
]
```

The `ai_Agent` query parameter is accepted by the DTO but is not currently
applied by the service when filtering.

#### `GET /game/:id`

Returns one game owned by the authenticated user, including its move history.
Returns `404 Not Found` when the game does not exist or belongs to another
user.

#### `POST /game`

Creates a game.

Request body:

```json
{
  "mode": "VS_AI",
  "playerColor": "WHITE",
  "ai_Agent": "GEMMEA"
}
```

| Field         | Required | Accepted values      |
| ------------- | -------- | -------------------- |
| `mode`        | Yes      | `VS_AI`, `VS_PLAYER` |
| `playerColor` | Yes      | `WHITE`, `BLACK`     |
| `ai_Agent`    | Yes      | `CHATGPT`, `GEMMEA`  |

`GEMMEA` is the currently implemented AI opponent. `CHATGPT` is an enum value
but is not currently supported when a move is made.

#### `POST /game/:id/moves`

Applies the player's move and, for an AI game, generates and applies the AI's
reply in the same request.

Request body:

```json
{
  "from": "e2",
  "to": "e4",
  "san": "e4",
  "promotion": "q"
}
```

| Field       | Required | Description                                        |
| ----------- | -------- | -------------------------------------------------- |
| `from`      | Yes      | Source square in algebraic notation, such as `e2`. |
| `to`        | Yes      | Destination square, such as `e4`.                  |
| `san`       | Yes      | Standard Algebraic Notation for the player's move. |
| `promotion` | No       | Promotion piece, normally `q`, `r`, `b`, or `n`.   |

For a continuing game, the response is:

```json
{
  "gameBoard": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
  "turn": "b"
}
```

When the move ends the game, the response is:

```json
{
  "message": "Good Game",
  "GameResult": "WHITE Won."
}
```

Invalid moves, moves for a completed game, unsupported AI opponents, and
unknown game IDs return an error response.

#### `GET /game/:id/abandon`

Abandons a game that has no recorded moves by deleting it.

Response:

```json
{
  "message": "Game Abandoned"
}
```

If the game already has moves, the game is not deleted and the response
explains that it must be resigned instead.

#### `GET /game/:id/resign`

Marks an in-progress game as `LOST`.

Response:

```json
{
  "message": "Game Resigned Successfully"
}
```

#### `DELETE /game/:id`

Deletes a game owned by the authenticated user.

Successful response:

```text
Game deleted successfully
```

If no matching game exists, the endpoint returns:

```text
Game with id: <id> was not found.
```

### Mail endpoint

#### `GET /mail`

Diagnostic endpoint that verifies the configured SMTP connection and sends the
currently hard-coded test email. It is not an email verification API and should
not be exposed as a public production feature without authentication and
configuration changes.

## Frontend integration flow

1. Call `POST /auth/signup` if the user is new.
2. Call `POST /auth/login` and retain `accessToken`.
3. Attach `Authorization: Bearer <accessToken>` to user and game requests.
4. Load the profile with `GET /user`.
5. Create a game with `POST /game`.
6. Render `gameBoard` as a FEN position and use `turn` to determine whose turn
   is next.
7. On each player move, send `from`, `to`, and `san` to
   `POST /game/:id/moves`. Replace the displayed board with the returned
   `gameBoard`.
8. Refresh game state with `GET /game/:id` after reconnects or page reloads.
9. Use `GET /game/:id/resign` or `GET /game/:id/abandon` for the appropriate
   end-game action.

The current project exposes HTTP endpoints only. The commented Socket.IO
gateway is not active, so frontend clients should not depend on WebSocket
events.

## Enums

| Enum          | Values                                                          |
| ------------- | --------------------------------------------------------------- |
| `GameStatus`  | `IN_PROGRESS`, `WIN`, `LOST`, `DRAW`, `ABANDODNED`, `STALEMATE` |
| `GameMode`    | `VS_AI`, `VS_PLAYER`                                            |
| `PlayerColor` | `WHITE`, `BLACK`                                                |
| `AIAgent`     | `CHATGPT`, `GEMMEA`                                             |

The spelling `ABANDODNED` is part of the current API contract and should be
used exactly as returned until the backend enum is renamed.

## Errors

Common status codes:

| Status | Meaning                                                                                 |
| ------ | --------------------------------------------------------------------------------------- |
| `400`  | Missing, invalid, or inconsistent input; invalid chess move; or an invalid game action. |
| `401`  | Missing/invalid bearer token or incorrect login credentials.                            |
| `404`  | Requested user or game was not found.                                                   |
| `409`  | Username or email already exists.                                                       |
| `500`  | Unexpected server or dependency failure.                                                |

## Development commands

```bash
# Install dependencies
npm install

# Start in development mode with file watching
npm run start:dev

# Build
npm run build

# Start the compiled application
npm run start:prod

# Run unit tests
npm test

# Run end-to-end tests
npm run test:e2e

# Run tests with coverage
npm run test:cov

# Format TypeScript files
npm run format
```

## Project notes

- PostgreSQL is configured with TypeORM and `synchronize: true`; use caution in
  production because schema changes are applied automatically.
- The API currently has no generated OpenAPI/Swagger document.
- Keep secrets out of source control and rotate any credentials that may have
  been shared outside a local development environment.
