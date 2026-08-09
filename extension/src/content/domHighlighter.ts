/**
 * Highlights filled form elements with a high-contrast emerald confirmation border
 * and renders a temporary visual badge indicating the data source provenance.
 */
export function highlightElement(element: HTMLElement, sourceLabel: string = 'Vault Profile'): void {
  const originalBorder = element.style.border;
  const originalBoxShadow = element.style.boxShadow;

  // Apply high-contrast emerald confirmation outline (#10B981)
  element.style.border = '2px solid #10B981';
  element.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.4)';
  element.style.transition = 'all 0.3s ease-in-out';

  // Create or update floating provenance badge
  const badgeId = `loksetu-badge-${element.id || element.getAttribute('name') || Math.random().toString(36).substring(2, 7)}`;
  let badge = document.getElementById(badgeId);

  if (!badge) {
    badge = document.createElement('span');
    badge.id = badgeId;
    badge.className = 'loksetu-provenance-badge';
    badge.style.position = 'absolute';
    badge.style.backgroundColor = '#10B981';
    badge.style.color = '#FFFFFF';
    badge.style.fontSize = '11px';
    badge.style.fontWeight = '600';
    badge.style.padding = '2px 6px';
    badge.style.borderRadius = '4px';
    badge.style.zIndex = '99999';
    badge.style.pointerEvents = 'none';
    badge.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    const rect = element.getBoundingClientRect();
    badge.style.top = `${window.scrollY + rect.top - 18}px`;
    badge.style.left = `${window.scrollX + rect.left}px`;

    document.body.appendChild(badge);
  }

  badge.textContent = `Source: ${sourceLabel}`;

  // Fade out badge after 3.5 seconds, keep smooth outline
  setTimeout(() => {
    if (badge && badge.parentNode) {
      badge.parentNode.removeChild(badge);
    }
  }, 3500);
}
