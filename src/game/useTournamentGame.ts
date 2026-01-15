export function useTournamentGame() {
    function generate() {
      return {
        groups: [],
        total: 0,
      }
    }
  
    return {
      generate,
    }
  }
  