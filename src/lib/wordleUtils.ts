export type LetterStatus = 'correct' | 'present' | 'absent';

export const getGuessStatuses = (guess: string, solution: string): LetterStatus[] => {
  const splitSolution = solution.toUpperCase().split('');
  const splitGuess = guess.toUpperCase().split('');

  const statuses: LetterStatus[] = Array(guess.length).fill('absent');
  const solutionCharsTaken = Array(solution.length).fill(false);

  // First pass for 'correct' letters
  splitGuess.forEach((letter, i) => {
    if (splitSolution[i] === letter) {
      statuses[i] = 'correct';
      solutionCharsTaken[i] = true;
    }
  });

  // Second pass for 'present' letters
  splitGuess.forEach((letter, i) => {
    if (statuses[i] === 'correct') {
      return;
    }

    const indexOfPresentChar = splitSolution.findIndex(
      (solutionChar, index) =>
        solutionChar === letter && !solutionCharsTaken[index]
    );

    if (indexOfPresentChar > -1) {
      statuses[i] = 'present';
      solutionCharsTaken[indexOfPresentChar] = true;
    }
  });

  return statuses;
};
