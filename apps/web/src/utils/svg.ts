export const CARD_WIDTH = 240;
export const CARD_HEIGHT = 336 / 1.25;

// Compat between Node (max 10 precission) and Browsers (max 8 precission).
function fixFloatForSsr(num: number): number {
  return +num.toPrecision(8);
}

function getArcsCoords(x: number, y: number, rad: number, sweepAngle: number) {
  const halfSweep = sweepAngle / 2;

  const first = {
    x: fixFloatForSsr(x + rad * Math.cos(halfSweep)),
    y: fixFloatForSsr(y - rad * Math.sin(halfSweep)),
  };
  const second = {
    x: fixFloatForSsr(x + rad * Math.cos(halfSweep + halfSweep)),
    y: fixFloatForSsr(y - rad * Math.sin(halfSweep + halfSweep)),
  };

  return [first, second];
}

export function arc({
  x,
  y,
  endAngle,
  innerRadius,
  outerRadius,
}: {
  x: number;
  y: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
}) {
  // Input coords are top-left aligned.
  const cx = x + outerRadius;
  const cy = y + outerRadius;

  const [outerFirstArc, outerSecondArc] = getArcsCoords(
    cx,
    cy,
    outerRadius,
    endAngle
  );
  const [innerFirstArc, innerSecondArc] = getArcsCoords(
    cx,
    cy,
    innerRadius,
    endAngle
  );

  const outerArc =
    `M${cx + outerRadius},${cy}` +
    `A${outerRadius},${outerRadius} 0 0 0 ${outerFirstArc.x} ${outerFirstArc.y}` +
    `A${outerRadius},${outerRadius} 0 0 0 ${outerSecondArc.x} ${outerSecondArc.y}`;

  const startLineCap = `L${innerSecondArc.x},${innerSecondArc.y}`;

  const innerArc =
    `A${innerRadius},${innerRadius} 0 0 1 ${innerFirstArc.x} ${innerFirstArc.y}` +
    `A${innerRadius},${innerRadius} 0 0 1 ${cx + innerRadius} ${cy}`;

  const endLineCap = `L${cx + outerRadius},${cy}`;

  return `${outerArc} ${startLineCap} ${innerArc} ${endLineCap}`;
}
