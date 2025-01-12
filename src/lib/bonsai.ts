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

export class Bonsai {
  private width: number;
  private height: number;
  private trunk: Branch;
  private growthStage: number = 0;
  private maxGrowth: number = 10;
  private branchProbability: number = 0.85;
  private maxBranchAngle: number = Math.PI / 2.5;
  private initialAngle: number = 0;
  private leafSize: number = 6;
  private maxDownwardAngle: number = Math.PI / 6; // Limit downward growth

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.trunk = this.createTrunk();
  }

  private createTrunk(): Branch {
    return {
      start: { x: this.width / 2, y: this.height * 0.9 },
      end: { x: this.width / 2, y: this.height * 0.75 },
      thickness: 16,
      color: '#4a3728',
      children: []
    };
  }

  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private calculateEndPoint(start: Point, length: number, angle: number): Point {
    return {
      x: start.x + Math.sin(angle) * length,
      y: start.y - Math.cos(angle) * length
    };
  }

  private growBranch(branch: Branch, depth: number = 0): void {
    if (depth >= this.growthStage) return;

    const maxSubBranches = Math.max(2, 4 - depth);
    const numSubBranches = Math.floor(this.randomInRange(1, maxSubBranches + 1));

    for (let i = 0; i < numSubBranches; i++) {
      if (Math.random() > this.branchProbability) continue;

      // Calculate base angle from current branch
      const baseAngle = Math.atan2(
        branch.end.x - branch.start.x,
        branch.start.y - branch.end.y
      );

      // Calculate growth direction
      let potentialAngle: number;
      if (depth === 0) {
        // First branches should spread out wide with upward tendency
        const spreadAngle = (i % 2 === 0 ? 1 : -1) * Math.PI / 3;
        const upwardBias = -Math.PI / 4;
        potentialAngle = spreadAngle + upwardBias + this.randomInRange(-Math.PI / 6, Math.PI / 6);
      } else {
        // Other branches should tend upward with some variation
        const side = ((depth + i) % 2 === 0 ? 1 : -1);
        const spreadAngle = side * Math.PI / 6;
        const upwardBias = -Math.PI / 4;
        potentialAngle = spreadAngle + upwardBias + this.randomInRange(-Math.PI / 4, Math.PI / 4);
      }

      // Prevent downward growth
      const finalAngle = baseAngle + potentialAngle;
      if (Math.abs(finalAngle) > this.maxDownwardAngle) {
        potentialAngle += (finalAngle > 0 ? -1 : 1) * (Math.PI / 3);
      }
      
      const newLength = branch.thickness * (2.2 + Math.random());
      const newThickness = branch.thickness * (0.65 + Math.random() * 0.1);

      const newBranch: Branch = {
        start: { ...branch.end },
        end: this.calculateEndPoint(branch.end, newLength, baseAngle + potentialAngle),
        thickness: newThickness,
        color: '#4a3728', // All branches are brown
        children: []
      };

      branch.children.push(newBranch);
      this.growBranch(newBranch, depth + 1);
    }
  }

  grow(): boolean {
    if (this.growthStage >= this.maxGrowth) return false;
    
    this.growthStage++;
    this.trunk.children = [];
    this.growBranch(this.trunk);
    return true;
  }

  reset(): void {
    this.growthStage = 0;
    this.trunk = this.createTrunk();
  }

  getAllElements(): { branches: Branch[], leaves: Point[] } {
    const branches: Branch[] = [this.trunk];
    const leaves: Point[] = [];
    
    const traverse = (branch: Branch) => {
      if (branch.children.length === 0 && this.growthStage > 3) {
        // Add leaves at the end of branches
        const angle = Math.atan2(
          branch.end.x - branch.start.x,
          branch.start.y - branch.end.y
        );
        
        // Add multiple leaves at different angles
        // Add more leaves with upward tendency
        for (let i = 0; i < 6; i++) {
          const upwardBias = -Math.PI / 3; // Bias leaves to grow upward
          const leafAngle = angle + upwardBias + (Math.random() - 0.3) * Math.PI / 2;
          const leafLength = this.leafSize * (0.8 + Math.random() * 0.4);
          leaves.push({
            x: branch.end.x + Math.sin(leafAngle) * leafLength,
            y: branch.end.y - Math.cos(leafAngle) * leafLength
          });
        }
      }
      branches.push(...branch.children);
      branch.children.forEach(traverse);
    };
    
    traverse(this.trunk);
    return { branches, leaves };
  }
}
