type Outcome = {
  winner: string | null
  loser: string | null
  isEquality: boolean
}

export function determineWinner(
  player1Total: number,
  player2Total: number,
  player1Id: string,
  player2Id: string
): Outcome {
  if (player1Total === player2Total) {
    return { winner: null, loser: null, isEquality: true }
  } else {
    const winner = player1Total > player2Total ? player1Id : player2Id
    const loser = player1Total > player2Total ? player2Id : player1Id

    return { winner, loser, isEquality: false }
  }
}
