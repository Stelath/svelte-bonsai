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
  private maxGrowth: number = 12;
  private branchProbability: number = 0.9;
  private maxBranchAngle: number = Math.PI / 2;
  private initialAngle: number = 0;
  private leafSize: number = 6;
  private maxDownwardAngle: number = Math.PI / 6;
  private branchLengthMultiplier: number = 2.8;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.trunk = this.createTrunk();
  }

  private createTrunk(): Branch {
    return {
      start: { x: this.width / 2, y: this.height * 0.9 },
      end: { x: this.width / 2, y: this.height * 0.85 },
      thickness: 14,
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

      // Calculate growth direction with more natural variation
      let potentialAngle: number;
      const randomFactor = Math.random();
      
      if (depth === 0) {
        // First branches spread wide with strong upward tendency
        const spreadAngle = (i % 2 === 0 ? 1 : -1) * (Math.PI / 3 + randomFactor * Math.PI / 6);
        const upwardBias = -Math.PI / 3;
        potentialAngle = spreadAngle + upwardBias + this.randomInRange(-Math.PI / 8, Math.PI / 8);
      } else if (depth === 1) {
        // Second level branches alternate sides with moderate spread
        const side = (i % 2 === 0 ? 1 : -1);
        const spreadAngle = side * (Math.PI / 4 + randomFactor * Math.PI / 6);
        const upwardBias = -Math.PI / 3;
        potentialAngle = spreadAngle + upwardBias + this.randomInRange(-Math.PI / 6, Math.PI / 6);
      } else {
        // Higher branches have more random growth but maintain upward tendency
        const side = ((depth + i) % 2 === 0 ? 1 : -1);
        const spreadAngle = side * (Math.PI / 5 + randomFactor * Math.PI / 4);
        const upwardBias = -Math.PI / 2.5;
        potentialAngle = spreadAngle + upwardBias + this.randomInRange(-Math.PI / 5, Math.PI / 5);
      }

      // Prevent downward growth
      const finalAngle = baseAngle + potentialAngle;
      if (Math.abs(finalAngle) > this.maxDownwardAngle) {
        potentialAngle += (finalAngle > 0 ? -1 : 1) * (Math.PI / 3);
      }
      
      const newLength = branch.thickness * (this.branchLengthMultiplier + Math.random() * 1.5);
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
        for (let i = 0; i < 8; i++) {
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
