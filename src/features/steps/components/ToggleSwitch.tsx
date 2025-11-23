import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { theme } from '@src/shared/theme/theme';

interface ToggleSwitchProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const PADDING = 2;
const HEIGHT = 48;
const LABEL_WIDTH = 52;

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  options,
  selectedIndex,
  onSelect,
}) => {
  const slideAnim = useRef(new Animated.Value(selectedIndex)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: selectedIndex,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selectedIndex, slideAnim]);

  const containerWidth = options.length * LABEL_WIDTH + PADDING * 2;

  const translateX = slideAnim.interpolate({
    inputRange: options.map((_, i) => i),
    outputRange: options.map((_, i) => i * LABEL_WIDTH),
  });

  return (
    <View style={[styles.container, { width: containerWidth }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.slider,
          {
            width: LABEL_WIDTH,
            transform: [{ translateX }],
          },
        ]}
      />
      <View style={styles.optionsRow}>
        {options.map((option, index) => {
          return (
            <TouchableOpacity
              key={index}
              style={styles.option}
              activeOpacity={0.8}
              onPress={() => onSelect(index)}
            >
              <Text
                style={styles.label}
                numberOfLines={1}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    backgroundColor: theme.colors.toggleUnselected,
    borderRadius: HEIGHT / 2,
    padding: PADDING,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  slider: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
    borderRadius: (HEIGHT - PADDING * 2) / 2,
    backgroundColor: theme.colors.toggleSelected,
  },
  optionsRow: {
    flex: 1,
    flexDirection: 'row',
  },
  option: {
    width: LABEL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
    textAlign: 'center',
  },
});

export default ToggleSwitch;

