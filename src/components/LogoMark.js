import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';

/**
 * LogoMark — matches the frontend's SVG logo icon.
 * Gradient blue rounded square with a door + step + knob icon inside.
 *
 * Props:
 *   size   — icon container size in dp (default 72)
 *   radius — border radius (default 20)
 */
export default function LogoMark({ size = 72, radius = 20 }) {

  return (
    <Svg width={size} height={size} viewBox="0 0 192 192">
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#4F7DFF" />
          <Stop offset="1" stopColor="#355CFF" />
        </LinearGradient>
      </Defs>

      {/* Gradient background */}
      <Rect x="0" y="0" width="192" height="192" rx={radius * (192 / size)} fill="url(#grad)" />

      {/* Step (bottom platform) */}
      <Rect x="46" y="154" width="100" height="14" rx="7" fill="#FFFFFF" />

      {/* Door outline */}
      <Rect
        x="62"
        y="51"
        width="68"
        height="112"
        rx="12"
        stroke="#FFFFFF"
        strokeWidth="8"
        fill="none"
      />

      {/* Door knob */}
      <Circle cx="114" cy="104" r="6" fill="#FFFFFF" />
    </Svg>
  );
}
