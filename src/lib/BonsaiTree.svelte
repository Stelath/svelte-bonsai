<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Bonsai } from './bonsai';

  export let width = 600;
  export let height = 600;
  export let autoGrow = true;
  export let growthInterval = 50;

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
  <!-- Bonsai Pot -->
  <g>
    <!-- Top rim layers -->
    <rect
      x={width * 0.3}
      y={height * 0.9}
      width={width * 0.4}
      height={height * 0.015}
      fill="#2a1810"
    />
    <rect
      x={width * 0.28}
      y={height * 0.915}
      width={width * 0.44}
      height={height * 0.012}
      fill="#3a2820"
    />
    
    <!-- Main pot body -->
    <rect
      x={width * 0.29}
      y={height * 0.927}
      width={width * 0.42}
      height={height * 0.028}
      fill="#2a1810"
    />
    
    <!-- Bottom rim -->
    <rect
      x={width * 0.27}
      y={height * 0.955}
      width={width * 0.46}
      height={height * 0.015}
      fill="#1a0800"
    />
    
    <!-- Shadow effect -->
    <ellipse
      cx={width * 0.5}
      cy={height * 0.975}
      rx={width * 0.25}
      ry={height * 0.008}
      fill="rgba(0,0,0,0.2)"
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
    {@const colorSeed = (leaf.x * 0.37 + leaf.y * 0.73)}
    {@const r = 60 + Math.floor(Math.abs(Math.sin(colorSeed)) * 20)}
    {@const g = 165 + Math.floor(Math.abs(Math.cos(colorSeed)) * 30)}
    {@const b = 70 + Math.floor(Math.abs(Math.sin(colorSeed * 2)) * 20)}
    <circle
      cx={leaf.x}
      cy={leaf.y}
      r={8}
      fill={`rgb(${r}, ${g}, ${b})`}
      opacity={0.8}
    />
  {/each}
</svg>

<style>
  svg {
    background: transparent;
  }
</style>
