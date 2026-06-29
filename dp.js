export function levenshtein(s1, s2) {
  const matrix = [];
  for (let i = 0; i <= s1.length; i++) matrix[i] = [i];
  for (let j = 0; j <= s2.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, 
          matrix[i][j - 1] + 1,     
          matrix[i - 1][j] + 1      
        );
      }
    }
  }
  return matrix;
}

export function calculateSimilarity(distance, s1, s2) {
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 100;
  return ((1 - distance / maxLen) * 100).toFixed(2);
}