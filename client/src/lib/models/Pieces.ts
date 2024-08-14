export const pieces: { [key: string]: number[][] } = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1]
  ],
  barbate: [[1]]
};

export const colors: Record<string, string> = {
  I: '#22d3ee',
  O: '#fde047',
  T: '#c084fc',
  S: '#4ade80',
  Z: '#ef4444',
  J: '#2563eb',
  L: '#fb923c',
  malus: '#555555',
  specter: '#666666',
  barbate: '#ff94fb'
};
