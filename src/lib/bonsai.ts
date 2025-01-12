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
  private maxGrowth: number = 6;
  private branchProbability: number = 0.9;
  private maxBranchAngle: number = Math.PI / 2;
  private initialAngle: number = 0;
  private leafSize: number = 6;
  private maxDownwardAngle: number = Math.PI / 6;
  private branchLengthMultiplier: number = 2.8;
  private allBranches: Branch[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.trunk = this.createTrunk();
    this.generateFullTree();
  }

  private createTrunk(): Branch {
    return {
      start: { x: this.width / 2, y: this.height * 0.9 },
      end: {
        x: this.width / 2 + Math.sin(this.initialAngle) * 15,
        y: this.height * 0.88 - Math.cos(this.initialAngle) * 15
      },
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

  private generateBranches(branch: Branch, depth: number = 0): void {
    if (depth >= this.maxGrowth) return;

    const baseBranches = 6;
    const numBranches = Math.max(2, Math.round(
      0.5 * depth * depth
      - 2.5 * depth
      + baseBranches
    ));
    const numSubBranches = Math.floor(this.randomInRange(1, numBranches + 1));

    for (let i = 0; i < numSubBranches; i++) {
      if (Math.random() > this.branchProbability) continue;

      const baseAngle = Math.atan2(
        branch.end.x - branch.start.x,
        branch.start.y - branch.end.y
      );

      let potentialAngle: number;
      const randomFactor = Math.random();
      
      if (depth === 0) {
        const baseSpread = Math.PI / 2.5;
        const side = (i / numSubBranches) < 0.5 ? 1 : -1;
        const spreadAngle = side * (baseSpread * randomFactor);
        const upwardBias = -Math.PI / 4;
        potentialAngle = spreadAngle + upwardBias;
      } else if (depth === 1) {
        const side = (i / numSubBranches) < 0.5 ? 1 : -1;
        const spreadAngle = side * (Math.PI / 3 * randomFactor);
        const upwardBias = -Math.PI / 3;
        potentialAngle = spreadAngle + upwardBias;
      } else {
        const side = (i / numSubBranches) < 0.5 ? 1 : -1;
        const spreadAngle = side * (Math.PI / 4 * randomFactor);
        const upwardBias = -Math.PI / 3;
        potentialAngle = spreadAngle + upwardBias;
      }

      potentialAngle += this.randomInRange(-Math.PI / 8, Math.PI / 8);

      const finalAngle = baseAngle + potentialAngle;
      if (Math.abs(finalAngle) > this.maxDownwardAngle) {
        potentialAngle += (finalAngle > 0 ? -1 : 1) * (Math.PI / 3);
      }
      
      const newLength = branch.thickness * (this.branchLengthMultiplier + Math.random() * 1.5);
      const newThickness = branch.thickness * (0.65 + Math.random() * 0.1);

      const endPoint = this.calculateEndPoint(branch.end, newLength, baseAngle + potentialAngle);
      
      if (endPoint.y > this.height * 0.9) continue;

      const newBranch: Branch = {
        start: { ...branch.end },
        end: endPoint,
        thickness: newThickness,
        color: '#4a3728',
        children: []
      };

      branch.children.push(newBranch);
      this.allBranches.push(newBranch);
      this.generateBranches(newBranch, depth + 1);
    }
  }

  private generateFullTree(): void {
    this.allBranches = [this.trunk];
    this.generateBranches(this.trunk);
  }

  grow(): boolean {
    if (this.growthStage >= this.maxGrowth) return false;
    this.growthStage++;
    return true;
  }

  reset(): void {
    this.growthStage = 0;
    this.trunk = this.createTrunk();
    this.allBranches = [];
    this.generateFullTree();
  }

  getAllElements(): { branches: Branch[], leaves: Point[] } {
    const visibleBranches = this.allBranches.slice(0, Math.max(1, Math.floor(this.allBranches.length * (this.growthStage / this.maxGrowth))));
    const leaves: Point[] = [];
    
    visibleBranches.forEach(branch => {
      const isEndBranch = !this.allBranches.some(b => 
        b !== branch && b.start.x === branch.end.x && b.start.y === branch.end.y
      );
      
      if (this.growthStage > 3 && isEndBranch) {
        const angle = Math.atan2(
          branch.end.x - branch.start.x,
          branch.start.y - branch.end.y
        );
        
        for (let i = 0; i < 8; i++) {
          const upwardBias = -Math.PI / 3;
          const leafSide = (i / 8) < 0.5 ? 1 : -1;
          const spreadFactor = Math.random() * Math.PI / 3;
          const leafAngle = angle + upwardBias + (leafSide * spreadFactor);
          const leafLength = this.leafSize * (0.8 + Math.random() * 0.4);
          leaves.push({
            x: branch.end.x + Math.sin(leafAngle) * leafLength,
            y: branch.end.y - Math.cos(leafAngle) * leafLength
          });
        }
      }
    });
    
    return { branches: visibleBranches, leaves };
  }
}