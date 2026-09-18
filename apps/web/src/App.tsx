/** Temporary application shell; route modules are introduced within src/pages. */
export function App(): HTMLElement {
  const main = document.createElement('main');
  main.textContent = 'PotGrowHub';
  return main;
}
