export default function renderHtmlInParent(html, parentId) {
  const parent = document.getElementById(parentId);

  if (!parent) {
    throw new Error(`Parent element with id "${parentId}" not found.`);
  }

  const temporaryDiv = document.createElement('div');
  temporaryDiv.innerHTML = html;

  parent.append(...temporaryDiv.children);
}
