import { colors } from './colors';
import { TextStyle } from "react-native";

export const theme = {
  colors,
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 40,
  },
  textVariants: {
    header: {
      fontSize: 36,
      fontWeight: 'bold',
    } as TextStyle,
    body: {
      fontSize: 16,
    } as TextStyle,
  },
};
