export function getCurrentPage(page?: string) {
  const currentPage = Number(page);

  if (!Number.isInteger(currentPage) || currentPage < 1) {
    return 1;
  }

  return currentPage;
}
