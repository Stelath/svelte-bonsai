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
  private maxBranchAngle: number = Math.PI / 1.2; // Even wider spread
  private initialAngle: number = 0; // Slight random initial tilt
  private leafSize: number = 6;
  private maxDownwardAngle: number = Math.PI / 3; // Increased to allow more droop
  private branchLengthMultiplier: number = 3.5; // Slightly shorter branches for better balance
  private allBranches: Branch[] = [];

  // New property for downward bias
  private downwardBias: number = Math.PI / 16; // Adjust this value to control droop intensity

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
        x: this.width / 2 + Math.sin(this.initialAngle) * 10,
        y: this.height * 0.89 - Math.cos(this.initialAngle) * 10
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

      // Calculate base angle relative to vertical (0 is straight up)
      const relativeAngle = Math.atan2(
        branch.end.x - branch.start.x,
        branch.start.y - branch.end.y
      );

      // Determine spread direction based on current position relative to trunk
      const distanceFromCenter = branch.end.x - (this.width / 2);
      let spreadBias = -Math.sign(distanceFromCenter) * 0.2; // Bias towards center

      if (depth === 0) {
        const baseSpread = Math.PI * 0.7; // Wider initial spread
        // Force first branches to go opposite directions
        const side = i === 0 ? -1 : (i === 1 ? 1 : (Math.random() < 0.5 ? 1 : -1));
        const spreadAngle = side * (baseSpread * (0.5 + randomFactor * 0.5));
        potentialAngle = spreadAngle;
      } else {
        // Unified approach for all subsequent branches
        const spreadRange = Math.PI * (0.8 - depth * 0.1); // Gradually decrease spread
        const side = Math.random() < (0.5 + spreadBias) ? 1 : -1;
        const spreadAngle = side * spreadRange * randomFactor;
        potentialAngle = spreadAngle;
      }

      // Introduce downward bias to make branches droop
      potentialAngle += this.downwardBias;

      potentialAngle += this.randomInRange(-Math.PI / 16, Math.PI / 16); // Reduced randomness for smoother droop

      const finalAngle = baseAngle + potentialAngle;
      if (Math.abs(finalAngle) > this.maxDownwardAngle) {
        potentialAngle += (finalAngle > 0 ? -1 : 1) * (Math.PI / 4); // Adjusted for smoother angle limits
      }

      const newLength = branch.thickness * (this.branchLengthMultiplier + Math.random() * 1.5);
      const newThickness = branch.thickness * (0.65 + Math.random() * 0.1);

      const endPoint = this.calculateEndPoint(branch.end, newLength, baseAngle + potentialAngle);

      if (endPoint.y > this.height * 0.95) continue; // Adjusted to allow more droop without exceeding canvas

      // Generate slightly varied brown color for branch
      const colorVariation = Math.floor(this.randomInRange(-20, 20));
      const r = Math.min(Math.max(74 + colorVariation, 54), 94);
      const g = Math.min(Math.max(55 + colorVariation, 35), 75);
      const b = Math.min(Math.max(40 + colorVariation, 20), 60);

      const newBranch: Branch = {
        start: { ...branch.end },
        end: endPoint,
        thickness: newThickness,
        color: `rgb(${r}, ${g}, ${b})`,
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
          const upwardBias = -Math.PI / 4;
          // Use position-based bias for leaves
          const distanceFromCenter = branch.end.x - (this.width / 2);
          const leafBias = -Math.sign(distanceFromCenter) * 0.2; // Bias towards center
          const leafSide = Math.random() < (0.5 + leafBias) ? 1 : -1;
          const spreadFactor = Math.random() * Math.PI * 0.8; // Even wider spread for leaves
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
