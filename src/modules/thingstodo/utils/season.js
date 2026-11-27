const NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export function monthName(month) {
  const index = Number(month) - 1;
  return index >= 0 && index < 12 ? NAMES[index] : '';
}

export function monthLetter(month) {
  const index = Number(month) - 1;
  return index >= 0 && index < 12 ? LETTERS[index] : '';
}

export function currentMonthColombo(now = new Date()) {
  return Number(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Colombo',
    month: 'numeric'
  }).format(now));
}

function cleanMonths(months) {
  return [...new Set((months || []).map(Number).filter((month) => month >= 1 && month <= 12))];
}

function ranges(months) {
  const sorted = cleanMonths(months).sort((a, b) => a - b);
  if (sorted.length === 0) return [];
  const groups = [];
  let start = sorted[0];
  let previous = sorted[0];
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index] === previous + 1) previous = sorted[index];
    else {
      groups.push([start, previous]);
      start = sorted[index];
      previous = sorted[index];
    }
  }
  groups.push([start, previous]);
  if (groups.length > 1 && groups[0][0] === 1 && groups[groups.length - 1][1] === 12) {
    const last = groups.pop();
    const first = groups.shift();
    groups.unshift([last[0], first[1]]);
  }
  return groups;
}

function phrase(groups) {
  return groups
    .map(([start, end]) => (start === end ? monthName(start) : `${monthName(start)} to ${monthName(end)}`))
    .join(', ');
}

export function describeSeason(months = [], peak = [], yearRound = false) {
  const season = yearRound ? [[1, 12]] : ranges(months);
  const best = ranges(peak);
  if (!yearRound && season.length === 0) return 'Season varies.';
  const allYear = yearRound || (season.length === 1 && season[0][0] === 1 && season[0][1] === 12);
  const seasonText = allYear ? 'In season all year.' : `In season: ${phrase(season)}.`;
  const bestText = best.length ? ` Best: ${phrase(best)}.` : '';
  return `${seasonText}${bestText}`;
}
