// 20px stroke icons.
const P = {
  lock: '<rect x="4.5" y="9" width="11" height="8" rx="1.5"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9"/>',
  unlock: '<rect x="4.5" y="9" width="11" height="8" rx="1.5"/><path d="M7 9V6.5a3 3 0 0 1 5.8-1"/>',
  x: '<path d="M5.5 5.5l9 9M14.5 5.5l-9 9"/>',
  plus: '<path d="M10 4.5v11M4.5 10h11"/>',
  grid: '<rect x="4" y="4" width="5" height="5"/><rect x="11" y="4" width="5" height="5"/><rect x="4" y="11" width="5" height="5"/><rect x="11" y="11" width="5" height="5"/>',
  grip: '<circle cx="7.5" cy="5.5" r=".9"/><circle cx="12.5" cy="5.5" r=".9"/><circle cx="7.5" cy="10" r=".9"/><circle cx="12.5" cy="10" r=".9"/><circle cx="7.5" cy="14.5" r=".9"/><circle cx="12.5" cy="14.5" r=".9"/>',
  copy: '<rect x="7" y="7" width="9" height="9" rx="1.2"/><path d="M13 7V5.2A1.2 1.2 0 0 0 11.8 4H5.2A1.2 1.2 0 0 0 4 5.2v6.6A1.2 1.2 0 0 0 5.2 13H7"/>',
  undo: '<path d="M7.5 6L4 9.5 7.5 13"/><path d="M4 9.5h7.5a4.5 4.5 0 0 1 0 9H9"/>',
  redo: '<path d="M12.5 6L16 9.5 12.5 13"/><path d="M16 9.5H8.5a4.5 4.5 0 0 0 0 9H11"/>',
  swap: '<path d="M4 7h11l-3-3M16 13H5l3 3"/>',
  stack: '<path d="M10 3.5l6.5 3.5L10 10.5 3.5 7z"/><path d="M3.5 10.5L10 14l6.5-3.5"/><path d="M3.5 14L10 17.5l6.5-3.5"/>',
  bookmark: '<path d="M6 3.5h8v13l-4-3-4 3z"/>',
  import: '<path d="M10 3.5v9M6.5 9l3.5 3.5L13.5 9"/><path d="M4 14.5v2h12v-2"/>',
  link: '<path d="M8.5 11.5l3-3"/><path d="M9.5 6.5l1-1a3 3 0 0 1 4.2 4.2l-1 1"/><path d="M10.5 13.5l-1 1a3 3 0 0 1-4.2-4.2l1-1"/>',
  chevronDown: '<path d="M5.5 8l4.5 4.5L14.5 8"/>',
  palette: '<path d="M10 3.5a6.5 6.5 0 1 0 0 13c1 0 1.5-.6 1.5-1.4 0-.9-.8-1.2-.8-2 0-.7.6-1.1 1.3-1.1h1.6a2.9 2.9 0 0 0 2.9-2.9C16.5 5.9 13.6 3.5 10 3.5z"/><circle cx="6.8" cy="9" r=".9"/><circle cx="9.2" cy="6.3" r=".9"/><circle cx="12.6" cy="6.8" r=".9"/>',
  sliders: '<path d="M4 6h7M14 6h2M4 14h2M9 14h7"/><circle cx="12.5" cy="6" r="1.6"/><circle cx="7.5" cy="14" r="1.6"/>',
  expand: '<path d="M4 8V4h4M16 8V4h-4M4 12v4h4M16 12v4h-4"/>',
  speaker: '<path d="M4 8h3l4-3.5v11L7 12H4z"/><path d="M14 7.5a3.5 3.5 0 0 1 0 5M15.8 5.5a6.3 6.3 0 0 1 0 9"/>',
  mic: '<rect x="7.5" y="3.5" width="5" height="9" rx="2.5"/><path d="M5 10a5 5 0 0 0 10 0M10 15v2"/>',
  file: '<path d="M6 3.5h5.5l3 3v10H6z"/><path d="M11.5 3.5v3h3"/>',
  wave: '<path d="M3 10c1.5 0 1.5-4 3-4s1.5 8 3 8 1.5-8 3-8 1.5 8 3 8 1.5-4 2-4"/>',
  eye: '<path d="M2.5 10S5.5 4.5 10 4.5 17.5 10 17.5 10 14.5 15.5 10 15.5 2.5 10 2.5 10z"/><circle cx="10" cy="10" r="2.3"/>',
};

export function icon(name) {
  return `<svg class="ic" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}
