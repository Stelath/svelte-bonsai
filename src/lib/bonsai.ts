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
  private maxGrowth: number = 7;
  private branchProbability: number = 0.8;
  private maxBranchAngle: number = Math.PI / 2;
  private initialAngle: number = (Math.random() > 0.5 ? 1 : -1) * Math.PI / 4;
  private leafSize: number = 10;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.trunk = this.createTrunk();
  }

  private createTrunk(): Branch {
    return {
      start: { x: this.width / 2, y: this.height * 0.9 },
      end: {
        x: this.width / 2 + Math.sin(this.initialAngle) * 40,
        y: this.height * 0.88 - Math.cos(this.initialAngle) * 40
      },
      thickness: 15,
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

      // Encourage growth in the initial direction for first few branches
      const angleRange = depth < 2 ? this.maxBranchAngle / 2 : this.maxBranchAngle;
      const angleOffset = depth < 2 ? this.initialAngle / 2 : 0;
      const angle = this.randomInRange(-angleRange, angleRange) + angleOffset;
      const baseAngle = Math.atan2(
        branch.end.x - branch.start.x,
        branch.start.y - branch.end.y
      );
      const newLength = branch.thickness * (3 + Math.random());
      const newThickness = branch.thickness * 0.8;

      const newBranch: Branch = {
        start: { ...branch.end },
        end: this.calculateEndPoint(branch.end, newLength, baseAngle + angle),
        thickness: newThickness,
        color: depth > 1 ? (Math.random() > 0.5 ? '#2d5a27' : '#3a6a34') : '#4a3728',
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
        for (let i = 0; i < 3; i++) {
          const leafAngle = angle + (Math.random() - 0.5) * Math.PI / 2;
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
