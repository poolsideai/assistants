import { buildVisualizationDocument } from "../visualizationDocument.js";

const navigations = {
  location: 'location.href = "https://visualization-probe.invalid/location"',
  refresh:
    'const meta = document.createElement("meta"); meta.httpEquiv = "refresh"; meta.content = "0;url=https://visualization-probe.invalid/refresh"; document.head.append(meta)',
  anchor:
    'const link = document.createElement("a"); link.href = "https://visualization-probe.invalid/anchor"; document.body.append(link); link.click()',
  mailto: 'location.replace("mailto:visualization-probe@example.invalid")',
};
export const navigationDocuments = Object.fromEntries(
  Object.entries(navigations).map(([name, action]) => [
    name,
    buildVisualizationDocument(
      `<button id="interact">Interact</button><p id="status">Ready</p>
<button id="navigate">Try navigation</button><script>
document.getElementById('interact').onclick = () => {
  try { void parent.document.body; document.getElementById('status').textContent = 'Parent accessible'; }
  catch { document.getElementById('status').textContent = 'Interactive; parent access denied'; }
};
document.getElementById('navigate').onclick = () => { ${action} };
</script>`,
      "black",
      "white",
    ),
  ]),
);
