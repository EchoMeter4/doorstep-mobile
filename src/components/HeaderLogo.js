import { View, Text } from 'react-native';
import LogoMark from './LogoMark';
import { fonts } from '../theme';

export default function HeaderLogo() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4 }}>
      <LogoMark size={28} radius={8} />
      <Text style={{ color: '#FFFFFF', fontFamily: fonts.semibold, fontSize: 20, marginLeft: 8 }}>
        Doorstep
      </Text>
    </View>
  );
}
