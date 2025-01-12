<script lang="ts">
  import BonsaiTree from './lib/BonsaiTree.svelte';
  let bonsaiComponent: BonsaiTree;
</script>

<main>
  <div class="container">
    <BonsaiTree 
      bind:this={bonsaiComponent}
      width={400} 
      height={400} 
      autoGrow={true}
      growthInterval={1000}
    />
  </div>
  <div class="controls">
    <button on:click={() => bonsaiComponent.grow()}>Grow</button>
    <button on:click={() => bonsaiComponent.reset()}>Reset</button>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    min-height: 100vh;
    background: #f9f9f9;
  }

  .container {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .controls {
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: #2d5a27;
    color: white;
    cursor: pointer;
    transition: background 0.2s;
  }

  button:hover {
    background: #1e3d1a;
  }
</style>
