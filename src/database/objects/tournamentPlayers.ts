interface TournamentPlayerInput {
    tournamentId: number
}

export const tournamentPlayers = (input: TournamentPlayerInput) => {
    // Register 16 customers (IDs 1-16) to the tournament
    const players = [];
    for (let i = 1; i <= 16; i++) {
        players.push({
            tournamentId: input.tournamentId,
            customerId: i
        });
    }
    return players;
};

