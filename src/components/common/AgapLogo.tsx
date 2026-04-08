import { Image, View } from "react-native";
import { agapaiLogo } from "../../assets/logos";

type AgapLogoProps = {
  size?: number;
  withBadge?: boolean;
};

export function AgapLogo({ size = 28, withBadge = false }: AgapLogoProps) {
  const badgeSize = size + 10;

  const image = (
    <Image
      source={agapaiLogo}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );

  if (!withBadge) {
    return image;
  }

  return (
    <View
      className="self-center items-center justify-center rounded-full border border-[#2C446B] bg-[#0E2449]"
      style={{ width: badgeSize, height: badgeSize }}
    >
      {image}
    </View>
  );
}
