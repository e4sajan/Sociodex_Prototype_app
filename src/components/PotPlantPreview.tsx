import type { Pot, Plant, Finish } from "@/lib/data";

type Props = { pot?: Pot; plant?: Plant; finish?: Finish; size?: number };

export function PotPlantPreview({ pot, plant, finish, size = 280 }: Props) {
  const potColor = pot?.color ?? "#D9C39B";
  const leafColor = plant?.color ?? "#7BAE78";
  const shape = pot?.shape ?? "round";

  const potPath =
    shape === "tall"
      ? "M70,160 L80,260 Q150,275 220,260 L230,160 Z"
      : shape === "square"
        ? "M70,170 L70,260 Q150,272 230,260 L230,170 Z"
        : shape === "bowl"
          ? "M60,170 Q150,310 240,170 Z"
          : "M70,170 Q70,260 150,268 Q230,260 230,170 Z";

  return (
    <svg viewBox="0 0 300 320" width={size} height={size} className="drop-shadow-md">
      {/* leaves */}
      {plant && (
        <g>
          {plant.leafShape === "spike" ? (
            <>
              <path
                d="M150,170 C140,90 120,60 110,30"
                stroke={leafColor}
                strokeWidth="14"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M150,170 C160,90 180,60 190,30"
                stroke={leafColor}
                strokeWidth="14"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M150,170 C150,90 150,60 150,20"
                stroke={leafColor}
                strokeWidth="14"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : plant.leafShape === "narrow" ? (
            <>
              <path
                d="M150,170 Q90,120 70,40"
                stroke={leafColor}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M150,170 Q210,120 230,40"
                stroke={leafColor}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M150,170 Q150,90 150,30"
                stroke={leafColor}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M150,170 Q120,110 90,70"
                stroke={leafColor}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M150,170 Q180,110 210,70"
                stroke={leafColor}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
            </>
          ) : plant.leafShape === "round" ? (
            <>
              <ellipse
                cx="110"
                cy="100"
                rx="38"
                ry="48"
                fill={leafColor}
                transform="rotate(-25 110 100)"
              />
              <ellipse
                cx="190"
                cy="100"
                rx="38"
                ry="48"
                fill={leafColor}
                transform="rotate(25 190 100)"
              />
              <ellipse cx="150" cy="60" rx="40" ry="50" fill={leafColor} />
            </>
          ) : (
            <>
              <ellipse
                cx="100"
                cy="110"
                rx="44"
                ry="60"
                fill={leafColor}
                transform="rotate(-30 100 110)"
              />
              <ellipse
                cx="200"
                cy="110"
                rx="44"
                ry="60"
                fill={leafColor}
                transform="rotate(30 200 110)"
              />
              <ellipse cx="150" cy="70" rx="46" ry="64" fill={leafColor} />
              <ellipse
                cx="135"
                cy="135"
                rx="38"
                ry="50"
                fill={leafColor}
                opacity="0.85"
                transform="rotate(-10 135 135)"
              />
              <ellipse
                cx="170"
                cy="135"
                rx="38"
                ry="50"
                fill={leafColor}
                opacity="0.85"
                transform="rotate(15 170 135)"
              />
            </>
          )}
        </g>
      )}
      {/* pot rim */}
      <ellipse cx="150" cy="170" rx="82" ry="10" fill={potColor} opacity="0.85" />
      {/* pot body */}
      <path d={potPath} fill={potColor} />
      <path d={potPath} fill="black" opacity="0.08" transform="translate(0,4)" />
      {/* finish badge */}
      {finish && (
        <g>
          <circle cx="240" cy="240" r="22" fill="#FFFDF9" stroke="rgba(92,61,46,0.18)" />
          <text x="240" y="248" textAnchor="middle" fontSize="22">
            {finish.emoji}
          </text>
        </g>
      )}
    </svg>
  );
}
