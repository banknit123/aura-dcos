export interface CalibrationGridOptions {
  width: number;
  height: number;
  columns: number;
  rows: number;
}

export interface CalibrationLine {
  orientation: 'horizontal' | 'vertical';
  position: number;
  label: string;
}

export interface CalibrationGrid {
  width: number;
  height: number;
  lines: CalibrationLine[];
}

export function createCalibrationGrid(options: CalibrationGridOptions): CalibrationGrid {
  const lines: CalibrationLine[] = [];

  for (let column = 0; column <= options.columns; column += 1) {
    lines.push({ orientation: 'vertical', position: Math.round((column / options.columns) * options.width), label: `C${column}` });
  }

  for (let row = 0; row <= options.rows; row += 1) {
    lines.push({ orientation: 'horizontal', position: Math.round((row / options.rows) * options.height), label: `R${row}` });
  }

  return { width: options.width, height: options.height, lines };
}

export function defaultProjectorCalibrationGrid(): CalibrationGrid {
  return createCalibrationGrid({ width: 1920, height: 1080, columns: 12, rows: 8 });
}
