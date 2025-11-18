# Tournament Management System - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tournament Lifecycle](#tournament-lifecycle)
3. [GraphQL API Reference](#graphql-api-reference)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Integration Guide](#integration-guide)
7. [Best Practices](#best-practices)

---

## Overview

The Tournament Management System supports two tournament formats:
- **GROUP_STAGE**: Players are divided into groups, winners advance to finals
- **SINGLE_ELIMINATION**: Direct knockout tournament with bracket progression

### Key Features
- Dynamic player limits (not hardcoded)
- Automatic bracket/group generation
- Real-time match tracking
- Automatic round advancement
- Winner declaration and tournament completion

---

## Tournament Lifecycle

### Phase 1: Tournament Creation
**Status**: `UPCOMING`

**Actions**:
1. Admin creates tournament with `saveTournament` mutation
2. Tournament is created with `status = UPCOMING`
3. `playerCount = 0`, `currentRound = 0`

**GraphQL Operation**:
```graphql
mutation CreateTournament {
  saveTournament(input: {
    companyUuid: "company-uuid-here"
    categoryUuid: "category-uuid-here"
    name: "Ludo Championship 2025"
    date: "2025-12-15"
    startTime: "18:00:00"
    entryFee: 5000.00
    prizePool: 50000.00
    currencyName: "PKR"
    playerLimit: 16
    format: GROUP_STAGE
    playersPerGroup: 4
  }) {
    status
    data {
      uuid
      name
      status
      playerLimit
      playerCount
      format
    }
    errors
    errorMessage
  }
}
```

---

### Phase 2: Player Registration
**Status**: `UPCOMING` (continues)

**Actions**:
1. Customer checks registration bill with `playerRegistrationBill` query
2. Customer registers with `playerRegistration` mutation
3. `playerCount` increments automatically
4. Each player is assigned an initial table

**GraphQL Operations**:

**Check Registration Bill**:
```graphql
query GetRegistrationBill {
  playerRegistrationBill(params: {
    customerUuid: "customer-uuid-here"
    tournamentUuid: "tournament-uuid-here"
  }) {
    status
    data {
      uuid
      name
      entryFee
      currencyName
      playerCount
      playerLimit
    }
    errors
    errorMessage
  }
}
```

**Register Player**:
```graphql
mutation RegisterPlayer {
  playerRegistration(input: {
    customerUuid: "customer-uuid-here"
    tournamentUuid: "tournament-uuid-here"
    tableUuid: "table-uuid-here"
  }) {
    status
    data {
      tournamentId
      customerId
      tableId
      status
    }
    errors
    errorMessage
  }
}
```

**Get Registered Players**:
```graphql
query GetTournamentPlayers {
  tournamentPlayers(tournamentUuid: "tournament-uuid-here") {
    status
    list {
      customerId
      tableId
      status
      customer {
        uuid
        firstName
        lastName
        phoneNumber
      }
      table {
        uuid
        name
      }
    }
    errors
    errorMessage
  }
}
```

---

### Phase 3: Start Tournament
**Status**: `UPCOMING` → `RUNNING`

**Prerequisites**:
- `playerCount >= playerLimit`
- Tournament status must be `UPCOMING`

**Actions**:
1. System calculates rounds based on format
2. Creates all `TournamentRound` records
3. Creates Round 1 matches
4. Randomly assigns players to groups (GROUP_STAGE) or sequentially (SINGLE_ELIMINATION)
5. Assigns tables to matches
6. Updates `status = RUNNING`, `currentRound = 1`

**GraphQL Operation**:
```graphql
mutation StartTournament {
  startTournament(tournamentUuid: "tournament-uuid-here") {
    status
    data {
      uuid
      status
      currentRound
      numberOfRounds
      rounds {
        uuid
        roundNumber
        roundName
        playersCount
        matchesCount
        completedMatches
        isCompleted
      }
      matches {
        uuid
        roundNumber
        matchNumber
        groupNumber
        status
        table {
          uuid
          name
        }
      }
    }
    errors
    errorMessage
  }
}
```

**What Happens**:
- **GROUP_STAGE** (16 players, 4 per group):
  - Round 1: 4 groups, 4 matches
  - Round 2: 1 final match with 4 winners
  - Total: 2 rounds, 5 matches

- **SINGLE_ELIMINATION** (16 players):
  - Round 1: 4 matches (16 players → 4 winners)
  - Round 2: 1 match (4 players → 1 winner)
  - Total: 2 rounds, 5 matches

---

### Phase 4: Match Execution
**Status**: `RUNNING`

**Actions**:
1. Staff starts match → `startMatch` mutation
2. Match status: `PENDING` → `IN_PROGRESS`
3. Game is played
4. Staff declares winner → `declareMatchWinner` mutation
5. Match status: `IN_PROGRESS` → `COMPLETED`

**GraphQL Operations**:

**Start Match**:
```graphql
mutation StartMatch {
  startMatch(matchUuid: "match-uuid-here") {
    status
    data {
      uuid
      status
      startedAt
      roundNumber
      matchNumber
      groupNumber
      table {
        uuid
        name
      }
      players {
        tournamentPlayer {
          customer {
            uuid
            firstName
            lastName
          }
          status
        }
        position
      }
    }
    errors
    errorMessage
  }
}
```

**Declare Winner**:
```graphql
mutation DeclareWinner {
  declareMatchWinner(input: {
    matchUuid: "match-uuid-here"
    winnerCustomerUuid: "customer-uuid-here"
  }) {
    status
    data {
      uuid
      status
      winnerCustomerId
      winner {
        uuid
        firstName
        lastName
      }
      completedAt
    }
    errors
    errorMessage
  }
}
```

**What Happens Automatically**:
1. Match is marked as completed
2. Round's `completedMatches` increments
3. Winner's status → `ADVANCED`
4. Losers' status → `ELIMINATED` (with `eliminatedInRound`)
5. If round completes:
   - Round `isCompleted = true`
   - Next round matches are automatically created
   - Winners are assigned to next round matches
   - Tournament `currentRound` increments
6. If all rounds complete:
   - Tournament `status = COMPLETED`
   - Tournament `winnerCustomerId` is set
   - Winner's status → `WINNER`, `finalPosition = 1`

---

### Phase 5: Round Progression
**Status**: `RUNNING`

**Automatic Behavior**:
- When a round completes, next round matches are created automatically
- Winners from previous round are assigned to new matches
- No manual intervention needed

**Query Current Round**:
```graphql
query GetCurrentRound {
  tournamentRound(
    tournamentUuid: "tournament-uuid-here"
    roundNumber: 1
  ) {
    status
    data {
      uuid
      roundNumber
      roundName
      playersCount
      matchesCount
      completedMatches
      isCompleted
      matches {
        uuid
        matchNumber
        status
        winner {
          uuid
          firstName
          lastName
        }
      }
    }
    errors
    errorMessage
  }
}
```

---

### Phase 6: Tournament Completion
**Status**: `RUNNING` → `COMPLETED`

**Automatic Behavior**:
- When final match completes:
  - Tournament `status = COMPLETED`
  - Tournament `winnerCustomerId` is set
  - Winner's `status = WINNER`, `finalPosition = 1`

**Query Completed Tournament**:
```graphql
query GetCompletedTournament {
  tournament(uuid: "tournament-uuid-here") {
    status
    data {
      uuid
      name
      status
      winnerCustomerId
      winner {
        uuid
        firstName
        lastName
      }
      rounds {
        roundNumber
        roundName
        isCompleted
        matches {
          matchNumber
          winner {
            firstName
            lastName
          }
        }
      }
    }
    errors
    errorMessage
  }
}
```

---

## GraphQL API Reference

### Tournament Queries

#### Get Tournament
```graphql
query GetTournament($uuid: ID!) {
  tournament(uuid: $uuid) {
    status
    data {
      uuid
      name
      date
      startTime
      entryFee
      prizePool
      currencyName
      playerLimit
      playerCount
      format
      playersPerGroup
      numberOfRounds
      currentRound
      status
      winnerCustomerId
      category {
        uuid
        name
      }
      winner {
        uuid
        firstName
        lastName
      }
      rounds {
        uuid
        roundNumber
        roundName
        isCompleted
      }
    }
    errors
    errorMessage
  }
}
```

#### List Tournaments
```graphql
query ListTournaments($paging: PaginatorInput!, $params: TournamentFilter!) {
  tournaments(paging: $paging, params: $params) {
    list {
      uuid
      name
      date
      status
      playerCount
      playerLimit
      format
    }
    paging {
      page
      limit
      totalPages
      totalResultCount
    }
  }
}
```

**Variables**:
```json
{
  "paging": {
    "page": 1,
    "limit": 10
  },
  "params": {
    "companyUuid": "company-uuid-here",
    "status": "UPCOMING",
    "searchText": "Championship"
  }
}
```

---

### Tournament Mutations

#### Create/Update Tournament
```graphql
mutation SaveTournament($input: SaveTournamentInput!) {
  saveTournament(input: $input) {
    status
    data {
      uuid
      name
      format
      playerLimit
      status
    }
    errors
    errorMessage
  }
}
```

**Variables**:
```json
{
  "input": {
    "companyUuid": "company-uuid-here",
    "categoryUuid": "category-uuid-here",
    "name": "Ludo Championship",
    "date": "2025-12-15",
    "startTime": "18:00:00",
    "entryFee": 5000.00,
    "prizePool": 50000.00,
    "currencyName": "PKR",
    "playerLimit": 16,
    "format": "GROUP_STAGE",
    "playersPerGroup": 4
  }
}
```

#### Start Tournament
```graphql
mutation StartTournament($tournamentUuid: ID!) {
  startTournament(tournamentUuid: $tournamentUuid) {
    status
    data {
      uuid
      status
      currentRound
      numberOfRounds
    }
    errors
    errorMessage
  }
}
```

---

### Tournament Player Queries

#### Get Tournament Players
```graphql
query GetTournamentPlayers($tournamentUuid: ID!) {
  tournamentPlayers(tournamentUuid: $tournamentUuid) {
    status
    list {
      tournamentId
      customerId
      tableId
      status
      eliminatedInRound
      finalPosition
      customer {
        uuid
        firstName
        lastName
        phoneNumber
      }
      table {
        uuid
        name
      }
    }
    errors
    errorMessage
  }
}
```

#### Get Registration Bill
```graphql
query GetRegistrationBill($params: PlayerRegistrationBillInput!) {
  playerRegistrationBill(params: $params) {
    status
    data {
      uuid
      name
      entryFee
      currencyName
      playerCount
      playerLimit
    }
    errors
    errorMessage
  }
}
```

---

### Tournament Player Mutations

#### Register Player
```graphql
mutation RegisterPlayer($input: PlayerRegistrationInput!) {
  playerRegistration(input: $input) {
    status
    data {
      tournamentId
      customerId
      tableId
      status
    }
    errors
    errorMessage
  }
}
```

**Variables**:
```json
{
  "input": {
    "customerUuid": "customer-uuid-here",
    "tournamentUuid": "tournament-uuid-here",
    "tableUuid": "table-uuid-here"
  }
}
```

---

### Tournament Round Queries

#### Get All Rounds
```graphql
query GetTournamentRounds($tournamentUuid: ID!) {
  tournamentRounds(tournamentUuid: $tournamentUuid) {
    status
    list {
      uuid
      roundNumber
      roundName
      playersCount
      groupsCount
      matchesCount
      completedMatches
      isCompleted
    }
    errors
    errorMessage
  }
}
```

#### Get Specific Round
```graphql
query GetRound($tournamentUuid: ID!, $roundNumber: Int!) {
  tournamentRound(tournamentUuid: $tournamentUuid, roundNumber: $roundNumber) {
    status
    data {
      uuid
      roundNumber
      roundName
      playersCount
      matchesCount
      completedMatches
      isCompleted
      matches {
        uuid
        matchNumber
        status
        winner {
          firstName
          lastName
        }
      }
    }
    errors
    errorMessage
  }
}
```

---

### Tournament Match Queries

#### Get Tournament Matches
```graphql
query GetTournamentMatches($tournamentUuid: ID!, $roundNumber: Int) {
  tournamentMatches(tournamentUuid: $tournamentUuid, roundNumber: $roundNumber) {
    status
    list {
      uuid
      roundNumber
      matchNumber
      groupNumber
      status
      winnerCustomerId
      startedAt
      completedAt
      table {
        uuid
        name
      }
      winner {
        uuid
        firstName
        lastName
      }
      players {
        tournamentPlayer {
          customer {
            firstName
            lastName
          }
          status
        }
        position
      }
    }
    errors
    errorMessage
  }
}
```

**Note**: `roundNumber` is optional. If omitted, returns all matches.

#### Get Match Details
```graphql
query GetMatch($matchUuid: ID!) {
  tournamentMatch(matchUuid: $matchUuid) {
    status
    data {
      uuid
      roundNumber
      matchNumber
      groupNumber
      status
      winnerCustomerId
      startedAt
      completedAt
      table {
        uuid
        name
      }
      winner {
        uuid
        firstName
        lastName
      }
      players {
        tournamentPlayer {
          customer {
            uuid
            firstName
            lastName
          }
          status
        }
        position
      }
    }
    errors
    errorMessage
  }
}
```

---

### Tournament Match Mutations

#### Start Match
```graphql
mutation StartMatch($matchUuid: ID!) {
  startMatch(matchUuid: $matchUuid) {
    status
    data {
      uuid
      status
      startedAt
    }
    errors
    errorMessage
  }
}
```

#### Declare Match Winner
```graphql
mutation DeclareWinner($input: DeclareMatchWinnerInput!) {
  declareMatchWinner(input: $input) {
    status
    data {
      uuid
      status
      winnerCustomerId
      completedAt
      winner {
        uuid
        firstName
        lastName
      }
    }
    errors
    errorMessage
  }
}
```

**Variables**:
```json
{
  "input": {
    "matchUuid": "match-uuid-here",
    "winnerCustomerUuid": "customer-uuid-here"
  }
}
```

**What Happens**:
- Match is completed
- Round progress updates
- Player statuses update
- If round completes → next round matches created automatically
- If tournament completes → winner is declared

---

### Match Players Query

#### Get Match Players
```graphql
query GetMatchPlayers($matchUuid: ID!) {
  matchPlayers(matchUuid: $matchUuid) {
    status
    list {
      id
      matchId
      tournamentPlayerId
      position
      tournamentPlayer {
        customer {
          uuid
          firstName
          lastName
        }
        status
      }
    }
    errors
    errorMessage
  }
}
```

---

## Data Models

### Tournament
```typescript
type Tournament {
  uuid: ID!
  name: String!
  date: String!                    // Format: "YYYY-MM-DD"
  startTime: String!               // Format: "HH:mm:ss"
  entryFee: Float!
  prizePool: Float!
  currencyName: String!
  playerLimit: Int!
  playerCount: Int!
  format: TournamentFormat!        // GROUP_STAGE | SINGLE_ELIMINATION
  playersPerGroup: Int             // Required for GROUP_STAGE
  numberOfRounds: Int               // Auto-calculated
  currentRound: Int!               // 0 = not started, 1+ = active round
  winnerCustomerId: ID             // Set when tournament completes
  status: TournamentStatus!
  createdAt: String!
  updatedAt: String!
}
```

### TournamentPlayer
```typescript
type TournamentPlayer {
  tournamentId: Int!
  customerId: Int!
  tableId: Int                     // Initial table assignment
  status: PlayerTournamentStatus!   // ACTIVE | ELIMINATED | ADVANCED | WINNER | WITHDRAWN
  eliminatedInRound: Int           // Round number when eliminated
  finalPosition: Int               // 1 = winner, 2 = runner-up, etc.
}
```

### TournamentRound
```typescript
type TournamentRound {
  uuid: ID!
  tournamentId: Int!
  roundNumber: Int!                // 1, 2, 3, ...
  roundName: String                // "Group Stage", "Finals", etc.
  playersCount: Int!                // Players in this round
  groupsCount: Int!                 // Number of groups (1 for SINGLE_ELIMINATION)
  matchesCount: Int!                // Total matches in round
  completedMatches: Int!            // Matches completed so far
  isCompleted: Boolean!             // True when all matches done
}
```

### TournamentMatch
```typescript
type TournamentMatch {
  uuid: ID!
  tournamentId: Int!
  roundId: Int!
  roundNumber: Int!
  matchNumber: Int!                // Match number within round
  groupNumber: Int                 // Group number (for GROUP_STAGE)
  tableId: Int                     // Table assigned for match
  status: MatchStatus!             // PENDING | IN_PROGRESS | COMPLETED | CANCELLED
  winnerCustomerId: ID             // Customer UUID who won
  startedAt: String                 // When match started
  completedAt: String              // When match completed
}
```

### TournamentMatchPlayer
```typescript
type TournamentMatchPlayer {
  id: ID!
  matchId: Int!
  tournamentPlayerId: Int!
  position: Int                    // Seat position (1, 2, 3, 4)
}
```

---

## Enums

### TournamentStatus
- `UPCOMING` - Tournament created, registration open
- `RUNNING` - Tournament in progress
- `COMPLETED` - Tournament finished
- `CANCELLED` - Tournament cancelled
- `POSTPONED` - Tournament postponed
- `UNKNOWN` - Unknown status

### TournamentFormat
- `GROUP_STAGE` - Players divided into groups, winners advance
- `SINGLE_ELIMINATION` - Direct knockout bracket

### MatchStatus
- `PENDING` - Match not started
- `IN_PROGRESS` - Match currently being played
- `COMPLETED` - Match finished, winner declared
- `CANCELLED` - Match cancelled

### PlayerTournamentStatus
- `ACTIVE` - Player is active in current round
- `ELIMINATED` - Player lost and is out
- `ADVANCED` - Player won and advanced to next round
- `WINNER` - Player won the tournament
- `WITHDRAWN` - Player withdrew from tournament

---

## Error Handling

### Response Format
All GraphQL operations return a consistent format:

```typescript
{
  status: Boolean          // true = success, false = error
  data: T | null          // Response data (if success)
  errors: GlobalError[]   // Array of error codes
  errorMessage: String    // Human-readable error message
}
```

### Common Errors

| Error Code | Description | When It Occurs |
|------------|-------------|----------------|
| `RECORD_NOT_FOUND` | Resource not found | Tournament/Player/Match doesn't exist |
| `NOT_ALLOWED` | Permission denied | User lacks required permissions |
| `ALREADY_EXISTS` | Duplicate entry | Player already registered, table already booked |
| `VALIDATION_ERROR` | Invalid input | Tournament not ready to start, match not in correct status |
| `REQUIRED_FIELDS_MISSING` | Missing required fields | Required input fields not provided |
| `INTERNAL_SERVER_ERROR` | Server error | Unexpected system error |

### Error Handling Example
```typescript
const response = await client.mutate({
  mutation: START_TOURNAMENT,
  variables: { tournamentUuid: "..." }
});

if (!response.data.startTournament.status) {
  const error = response.data.startTournament.errors[0];
  const message = response.data.startTournament.errorMessage;
  
  switch(error) {
    case 'RECORD_NOT_FOUND':
      showError('Tournament not found');
      break;
    case 'VALIDATION_ERROR':
      showError(message); // "Tournament requires 16 players, but only 12 are registered"
      break;
    case 'NOT_ALLOWED':
      showError('You do not have permission to start this tournament');
      break;
    default:
      showError('An error occurred: ' + message);
  }
} else {
  // Success - tournament started
  const tournament = response.data.startTournament.data;
}
```

---

## Integration Guide

### Step 1: Tournament Creation Flow

```typescript
// 1. Create Tournament
const createTournament = async (tournamentData) => {
  const result = await client.mutate({
    mutation: SAVE_TOURNAMENT,
    variables: {
      input: {
        companyUuid: tournamentData.companyUuid,
        categoryUuid: tournamentData.categoryUuid,
        name: tournamentData.name,
        date: tournamentData.date,
        startTime: tournamentData.startTime,
        entryFee: tournamentData.entryFee,
        prizePool: tournamentData.prizePool,
        playerLimit: tournamentData.playerLimit,
        format: tournamentData.format, // "GROUP_STAGE" or "SINGLE_ELIMINATION"
        playersPerGroup: tournamentData.playersPerGroup, // For GROUP_STAGE
      }
    }
  });
  
  if (result.data.saveTournament.status) {
    return result.data.saveTournament.data;
  }
  throw new Error(result.data.saveTournament.errorMessage);
};
```

### Step 2: Player Registration Flow

```typescript
// 1. Check Registration Bill
const checkBill = async (customerUuid, tournamentUuid) => {
  const result = await client.query({
    query: PLAYER_REGISTRATION_BILL,
    variables: {
      params: { customerUuid, tournamentUuid }
    }
  });
  
  if (result.data.playerRegistrationBill.status) {
    const tournament = result.data.playerRegistrationBill.data;
    
    // Check if already registered
    if (tournament.playerCount >= tournament.playerLimit) {
      return { error: 'Tournament is full' };
    }
    
    return {
      entryFee: tournament.entryFee,
      currencyName: tournament.currencyName,
      availableSlots: tournament.playerLimit - tournament.playerCount
    };
  }
  
  throw new Error(result.data.playerRegistrationBill.errorMessage);
};

// 2. Get Available Tables
const getAvailableTables = async (tournamentUuid) => {
  const result = await client.query({
    query: AVAILABLE_TABLES,
    variables: { tournamentUuid }
  });
  
  return result.data.availableTables.list;
};

// 3. Register Player
const registerPlayer = async (customerUuid, tournamentUuid, tableUuid) => {
  const result = await client.mutate({
    mutation: PLAYER_REGISTRATION,
    variables: {
      input: { customerUuid, tournamentUuid, tableUuid }
    }
  });
  
  if (result.data.playerRegistration.status) {
    return result.data.playerRegistration.data;
  }
  
  throw new Error(result.data.playerRegistration.errorMessage);
};
```

### Step 3: Start Tournament Flow

```typescript
const startTournament = async (tournamentUuid) => {
  // 1. Verify tournament is ready
  const tournament = await client.query({
    query: GET_TOURNAMENT,
    variables: { uuid: tournamentUuid }
  });
  
  if (tournament.data.tournament.data.status !== 'UPCOMING') {
    throw new Error('Tournament is not in UPCOMING status');
  }
  
  if (tournament.data.tournament.data.playerCount < tournament.data.tournament.data.playerLimit) {
    throw new Error(`Need ${tournament.data.tournament.data.playerLimit} players, only ${tournament.data.tournament.data.playerCount} registered`);
  }
  
  // 2. Start Tournament
  const result = await client.mutate({
    mutation: START_TOURNAMENT,
    variables: { tournamentUuid }
  });
  
  if (result.data.startTournament.status) {
    return result.data.startTournament.data;
  }
  
  throw new Error(result.data.startTournament.errorMessage);
};
```

### Step 4: Match Management Flow

```typescript
// 1. Get Current Round Matches
const getCurrentRoundMatches = async (tournamentUuid) => {
  const tournament = await client.query({
    query: GET_TOURNAMENT,
    variables: { uuid: tournamentUuid }
  });
  
  const currentRound = tournament.data.tournament.data.currentRound;
  
  const result = await client.query({
    query: GET_TOURNAMENT_MATCHES,
    variables: {
      tournamentUuid,
      roundNumber: currentRound
    }
  });
  
  return result.data.tournamentMatches.list;
};

// 2. Start Match
const startMatch = async (matchUuid) => {
  const result = await client.mutate({
    mutation: START_MATCH,
    variables: { matchUuid }
  });
  
  if (result.data.startMatch.status) {
    return result.data.startMatch.data;
  }
  
  throw new Error(result.data.startMatch.errorMessage);
};

// 3. Declare Winner
const declareWinner = async (matchUuid, winnerCustomerUuid) => {
  const result = await client.mutate({
    mutation: DECLARE_MATCH_WINNER,
    variables: {
      input: { matchUuid, winnerCustomerUuid }
    }
  });
  
  if (result.data.declareMatchWinner.status) {
    // Check if round/tournament completed
    const match = result.data.declareMatchWinner.data;
    
    // Refresh tournament to check status
    const tournament = await client.query({
      query: GET_TOURNAMENT,
      variables: { uuid: match.tournament.uuid }
    });
    
    return {
      match,
      tournament: tournament.data.tournament.data,
      roundCompleted: match.round.isCompleted,
      tournamentCompleted: tournament.data.tournament.data.status === 'COMPLETED'
    };
  }
  
  throw new Error(result.data.declareMatchWinner.errorMessage);
};
```

### Step 5: Real-time Updates

```typescript
// Poll for tournament updates
const pollTournamentStatus = async (tournamentUuid, callback) => {
  const interval = setInterval(async () => {
    const result = await client.query({
      query: GET_TOURNAMENT,
      variables: { uuid: tournamentUuid },
      fetchPolicy: 'network-only' // Always fetch fresh data
    });
    
    const tournament = result.data.tournament.data;
    callback(tournament);
    
    // Stop polling if tournament completed
    if (tournament.status === 'COMPLETED' || tournament.status === 'CANCELLED') {
      clearInterval(interval);
    }
  }, 5000); // Poll every 5 seconds
  
  return () => clearInterval(interval);
};
```

---

## Complete Tournament Flow Example

### Scenario: 16-Player GROUP_STAGE Tournament

```typescript
// 1. CREATE TOURNAMENT
const tournament = await createTournament({
  companyUuid: "company-123",
  categoryUuid: "category-456",
  name: "Ludo Championship",
  date: "2025-12-15",
  startTime: "18:00:00",
  entryFee: 5000,
  prizePool: 50000,
  playerLimit: 16,
  format: "GROUP_STAGE",
  playersPerGroup: 4
});
// Result: tournament.status = "UPCOMING", playerCount = 0

// 2. REGISTER 16 PLAYERS
for (let i = 0; i < 16; i++) {
  const availableTables = await getAvailableTables(tournament.uuid);
  await registerPlayer(
    `customer-uuid-${i}`,
    tournament.uuid,
    availableTables[i % availableTables.length].uuid
  );
}
// Result: tournament.playerCount = 16

// 3. START TOURNAMENT
const startedTournament = await startTournament(tournament.uuid);
// Result: 
// - tournament.status = "RUNNING"
// - tournament.currentRound = 1
// - 4 rounds created (Round 1: Group Stage, Round 2: Finals)
// - 4 matches created for Round 1
// - Players randomly assigned to 4 groups

// 4. GET ROUND 1 MATCHES
const round1Matches = await getCurrentRoundMatches(tournament.uuid);
// Result: 4 matches, each with 4 players

// 5. PLAY MATCHES
for (const match of round1Matches) {
  // Start match
  await startMatch(match.uuid);
  
  // ... game is played ...
  
  // Declare winner (example: first player wins)
  const winner = match.players[0].tournamentPlayer.customer;
  await declareWinner(match.uuid, winner.uuid);
}
// Result:
// - Round 1 completes
// - 4 winners advance (status = ADVANCED)
// - 12 losers eliminated (status = ELIMINATED)
// - Round 2 match automatically created
// - tournament.currentRound = 2

// 6. PLAY FINAL MATCH
const round2Matches = await getCurrentRoundMatches(tournament.uuid);
const finalMatch = round2Matches[0]; // Only 1 match in finals

await startMatch(finalMatch.uuid);
// ... game is played ...
await declareWinner(finalMatch.uuid, finalMatch.players[0].tournamentPlayer.customer.uuid);

// Result:
// - Tournament status = "COMPLETED"
// - Winner declared
// - Winner's status = "WINNER", finalPosition = 1
```

---

## Best Practices

### 1. Error Handling
- Always check `status` field before accessing `data`
- Display user-friendly error messages from `errorMessage`
- Handle specific error codes for better UX

### 2. Data Polling
- Poll tournament status every 5-10 seconds during active matches
- Use `fetchPolicy: 'network-only'` for real-time updates
- Stop polling when tournament is `COMPLETED` or `CANCELLED`

### 3. State Management
- Cache tournament data locally
- Update cache after mutations
- Invalidate cache when tournament status changes

### 4. User Experience
- Show loading states during mutations
- Display match progress (completedMatches / matchesCount)
- Highlight current round and active matches
- Show player statuses clearly (ACTIVE, ELIMINATED, ADVANCED, WINNER)

### 5. Validation
- Check `playerCount >= playerLimit` before allowing start
- Verify match status before starting/declaring winner
- Validate customer is in match before declaring winner

### 6. Security
- All operations require authentication (`@requireAuth`)
- Permission checks are automatic (`@requirePermissions`)
- Always use UUIDs, never expose internal IDs

---

## GraphQL Query Examples

### Complete Tournament Dashboard Query
```graphql
query TournamentDashboard($uuid: ID!) {
  tournament(uuid: $uuid) {
    status
    data {
      uuid
      name
      status
      playerCount
      playerLimit
      currentRound
      format
      winner {
        firstName
        lastName
      }
      rounds {
        uuid
        roundNumber
        roundName
        matchesCount
        completedMatches
        isCompleted
        matches {
          uuid
          matchNumber
          groupNumber
          status
          table {
            name
          }
          winner {
            firstName
            lastName
          }
          players {
            tournamentPlayer {
              customer {
                firstName
                lastName
              }
              status
            }
          }
        }
      }
    }
  }
}
```

### Match Details with Players
```graphql
query MatchDetails($matchUuid: ID!) {
  tournamentMatch(matchUuid: $matchUuid) {
    status
    data {
      uuid
      roundNumber
      matchNumber
      groupNumber
      status
      startedAt
      completedAt
      table {
        uuid
        name
      }
      winner {
        uuid
        firstName
        lastName
      }
      players {
        position
        tournamentPlayer {
          customer {
            uuid
            firstName
            lastName
            phoneNumber
          }
          status
          eliminatedInRound
        }
      }
    }
  }
}
```

---

## Status Flow Diagrams

### Tournament Status Flow
```
UPCOMING → RUNNING → COMPLETED
    ↓         ↓
CANCELLED  CANCELLED
    ↓
POSTPONED → UPCOMING
```

### Match Status Flow
```
PENDING → IN_PROGRESS → COMPLETED
    ↓
CANCELLED
```

### Player Status Flow
```
ACTIVE → ADVANCED → ACTIVE → ... → WINNER
  ↓         ↓
ELIMINATED ELIMINATED
```

---

## Important Notes

1. **Automatic Round Advancement**: When a round completes, next round matches are created automatically. No manual intervention needed.

2. **Winner Declaration**: Declaring a match winner automatically:
   - Updates round progress
   - Updates player statuses
   - Creates next round matches (if round completes)
   - Completes tournament (if all rounds done)

3. **Table Assignment**: Tables are assigned automatically when tournament starts. For next rounds, available tables are reused.

4. **Player Limit**: Must be reached before tournament can start. System validates this automatically.

5. **Format-Specific Behavior**:
   - **GROUP_STAGE**: Players randomly shuffled into groups
   - **SINGLE_ELIMINATION**: Players assigned sequentially to matches

6. **Transaction Safety**: All critical operations (start tournament, declare winner) use database transactions for data consistency.

---

## Support & Troubleshooting

### Common Issues

**Issue**: Cannot start tournament
- **Check**: `playerCount >= playerLimit`
- **Check**: Tournament status is `UPCOMING`
- **Check**: User has `tournament:update` permission

**Issue**: Cannot declare winner
- **Check**: Match status is `IN_PROGRESS`
- **Check**: Customer is registered in tournament
- **Check**: Customer is assigned to this match

**Issue**: Round not advancing
- **Check**: All matches in round are `COMPLETED`
- **Check**: Round's `completedMatches === matchesCount`
- **Note**: Advancement is automatic when last match completes

---

This documentation covers the complete tournament management system. For additional support, refer to the GraphQL schema introspection or contact the backend team.

