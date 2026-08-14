export type GalleryCell = {
  imageIndex: number;
  col: number;
  row: number;
};

export function buildLayout(count: number, cols: number): GalleryCell[] {
  const cells: GalleryCell[] = [];
  let imageIndex = 0;
  let row = 0;

  while (imageIndex < count) {
    const primaryCol = (row * 2 + (row % 2)) % cols;

    cells.push({ imageIndex, col: primaryCol, row });
    imageIndex++;

    if (row % 3 === 0 && imageIndex < count) {
      let secondaryCol = (primaryCol + 2) % cols;
      if (secondaryCol === primaryCol) {
        secondaryCol = (primaryCol + 1) % cols;
      }
      cells.push({ imageIndex, col: secondaryCol, row });
      imageIndex++;
    }

    row++;
  }

  return cells;
}

export function getColumnCount(width: number): number {
  if (width < 640) return 2;
  if (width < 1024) return 3;
  return 4;
}
