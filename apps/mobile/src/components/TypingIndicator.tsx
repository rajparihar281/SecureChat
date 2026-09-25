import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme';

export interface TypingIndicatorProps {
  username?: string;
  testID?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  username,
  testID = 'typing-indicator',
}) => {
  const { colors, typography } = useTheme();

  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createPulse = (dot: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.3,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.delay(300),
          ]),
        ),
      ]);
    };

    const anim1 = createPulse(dot1Opacity, 0);
    const anim2 = createPulse(dot2Opacity, 150);
    const anim3 = createPulse(dot3Opacity, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  return (
    <View
      testID={testID}
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[styles.dot, { backgroundColor: colors.primary, opacity: dot1Opacity }]}
        />
        <Animated.View
          style={[styles.dot, { backgroundColor: colors.primary, opacity: dot2Opacity }]}
        />
        <Animated.View
          style={[styles.dot, { backgroundColor: colors.primary, opacity: dot3Opacity }]}
        />
      </View>
      <Text style={[styles.text, typography.bodySmall, { color: colors.textMuted }]}>
        {username ? `${username} is typing...` : 'typing...'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontStyle: 'italic',
  },
});
