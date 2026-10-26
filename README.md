# Chess Game API

A NestJS REST API for user accounts, chess games, player statistics, and
Google GenAI-assisted chess moves.

## Tech Stack

- NestJS and TypeScript
- PostgreSQL and TypeORM
- JWT authentication and bcrypt password hashing
- chess.js for move validation and game-state management
- Google GenAI for AI chess moves

## Requirements

- Node.js 20+
- npm
- PostgreSQL 13+ (or Docker)
- Google GenAI API key for AI moves

## Getting Started

```bash
npm install
docker compose up -d postgres
npm run start:dev
```

The API runs at `http://localhost:3000`.

Create a `.env.stage.dev` file with the required settings:

```env
STAGE=dev
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWOR=your_password
DB_DATABASE=chess_game
JWT_SECRET=your_jwt_secret
JWT_EXPIRESIN=1h
BCRYPT_SALT=12
GOOGLE_AI_API_KEY=your_google_ai_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_key
```

> `DB_PASSWOR` is intentionally spelled this way because it matches the
> current application configuration. Never commit credentials or API keys.

## Authentication

### Sign up

`POST /auth/signup`

```json
{
  "username": "chess-player",
  "email": "player@example.com",
  "password": "StrongPassword123!",
  "confirmPassword": "StrongPassword123!"
}
```

### Log in

`POST /auth/login`

```json
{
  "email": "player@example.com",
  "password": "StrongPassword123!"
}
```

The response contains an access token. Send it with protected requests:

```http
Authorization: ACCESS_TOKEN
```

## Main Endpoints

All `/user` and `/game` endpoints require authentication.

### Users

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/user` | Get the authenticated user's profile and statistics |
| `GET` | `/user/:id` | Get a user's public profile |
| `POST` | `/user/image` | Upload or replace a profile image |

### Games

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/game` | List the user's games |
| `GET` | `/game/:id` | Get one game and its move history |
| `POST` | `/game` | Create a new game |
| `POST` | `/game/:id/moves` | Play a move and receive the AI response |
| `POST` | `/game/:id/resign` | Resign an active game |
| `DELETE` | `/game/:id/abandon` | Abandon a game with no moves |
| `DELETE` | `/game/:id` | Delete a game |

## Starting a Game

`POST /game`

```json
{
  "mode": "VS_AI",
  "playerColor": "WHITE",
  "ai_Agent": "GEMMEA"
}
```

Only `VS_AI`, `WHITE` or `BLACK`, and `GEMMEA` are currently supported.

## Making a Move

`POST /game/:id/moves`

```json
{
  "from": "e2",
  "to": "e4",
  "san": "e4",
  "promotion": "q"
}
```

The `promotion` field is optional. Valid promotion pieces are `q`, `r`, `b`,
and `n`.

The response includes:

- `gameBoard`: the current board as a FEN string
- `turn`: the next player (`w` or `b`)
- `status`: the current game status
- `gameResult`: included when the game ends

## Game Statuses

- `IN_PROGRESS`
- `WIN`
- `LOST`
- `DRAW`
- `STALEMATE`
- `ABANDODNED`

> `ABANDODNED` is misspelled in the current backend enum and must be used as
> written until the enum is renamed.

## Response Format

Successful responses use this format:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "data": {}
}
```

Errors use NestJS's standard format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

## Development Commands

```bash
npm run start:dev   # Start with live reload
npm run build       # Build the application
npm test            # Run tests
npm run test:e2e    # Run end-to-end tests
npm run test:cov    # Run tests with coverage
npm run format      # Format source files
```
