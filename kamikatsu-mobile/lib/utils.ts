export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getStationNumber = (code: string | null | undefined): string => {
  if (!code) return 'N/A';
  const cleanCode = code.trim().toUpperCase();
  const mapping: { [key: string]: string } = {
    'CB01': '1',  // Cardboard
    'CB02': '2',  // Newspaper / Paper
    'PD01': '3',  // Pamphlets
    'MT01': '12', // Steel Cans
    'MT02': '13', // Aluminum
    'GL01': '16', // Clear Glass
    'GL02': '17', // Colored Glass
    'CR01': '31', // Ceramics
    'CR02': '32', // Porcelain
    'PL01': '22', // PET Plastic
    'PL02': '25', // HDPE Plastic / Wrap
    'RB01': '35', // Rubber
    'LE01': '36', // Leather
    'TX01': '38', // Cotton Textiles
    'TX02': '39', // Mixed Textiles
    'WD01': '41', // Wood Scraps
    'GD01': '42', // Leaves & Branches
    'FS01': '45', // Food Waste
  };
  return mapping[cleanCode] || 'General';
};
