export const comparisonVisualization = `
<h3>Multiple comparisons</h3>
<button class="btn" id="add">Add comparison</button>
<p id="count" aria-live="polite">1 comparison</p>
<script>
  let count = 1;
  document.getElementById("add").onclick = () => {
    document.getElementById("count").textContent = ++count + " comparisons";
  };
</script>`;
