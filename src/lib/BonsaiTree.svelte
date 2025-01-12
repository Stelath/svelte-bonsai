<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Bonsai } from './bonsai';

  export let width = 400;
  export let height = 400;
  export let autoGrow = true;
  export let growthInterval = 1000;

  let bonsai: Bonsai;
  interface Point {
    x: number;
    y: number;
  }

  interface Branch {
    start: Point;
    end: Point;
    thickness: number;
    color: string;
    children: Branch[];
  }

  let elements: { branches: Branch[], leaves: Point[] } = { branches: [], leaves: [] };
  let growthTimer: number;

  onMount(() => {
    bonsai = new Bonsai(width, height);
    elements = bonsai.getAllElements();

    if (autoGrow) {
      growthTimer = window.setInterval(() => {
        if (!bonsai.grow()) {
          clearInterval(growthTimer);
        }
        elements = bonsai.getAllElements();
      }, growthInterval);
    }
  });

  onDestroy(() => {
    if (growthTimer) clearInterval(growthTimer);
  });

  export function grow(): boolean {
    if (!bonsai) return false;
    const result = bonsai.grow();
    elements = bonsai.getAllElements();
    return result;
  }

  export function reset(): void {
    if (!bonsai) return;
    bonsai.reset();
    elements = bonsai.getAllElements();
  }
</script>

<svg {width} {height} viewBox="0 0 {width} {height}">
  <!-- Base -->
  <g>
    <!-- Pot rim -->
    <line 
      x1={width * 0.3} 
      y1={height * 0.9} 
      x2={width * 0.7} 
      y2={height * 0.9}
      stroke="#654321"
      stroke-width="2"
    />
    <!-- Left side -->
    <line 
      x1={width * 0.35} 
      y1={height * 0.9} 
      x2={width * 0.4} 
      y2={height * 0.95}
      stroke="#654321"
      stroke-width="2"
    />
    <!-- Right side -->
    <line 
      x1={width * 0.65} 
      y1={height * 0.9} 
      x2={width * 0.6} 
      y2={height * 0.95}
      stroke="#654321"
      stroke-width="2"
    />
    <!-- Bottom -->
    <line 
      x1={width * 0.4} 
      y1={height * 0.95} 
      x2={width * 0.6} 
      y2={height * 0.95}
      stroke="#654321"
      stroke-width="2"
    />
  </g>

  <!-- Branches -->
  {#each elements.branches as branch}
    <line
      x1={branch.start.x}
      y1={branch.start.y}
      x2={branch.end.x}
      y2={branch.end.y}
      stroke={branch.color}
      stroke-width={branch.thickness}
      stroke-linecap="round"
    />
  {/each}
  <!-- Leaves -->
  {#each elements.leaves as leaf}
    <circle
      cx={leaf.x}
      cy={leaf.y}
      r={5}
      fill="#4CAF50"
      opacity={0.8}
    />
  {/each}
</svg>

<style>
  svg {
    background: transparent;
  }
</style>
