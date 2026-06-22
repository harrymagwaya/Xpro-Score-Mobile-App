// src/components/AppSplashScreen.js
import { useCallback, useEffect, useRef, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { View, StyleSheet, Animated, Image, Platform } from "react-native";
import useAuth from "../hooks/useAuth";

// Keep the native splash screen visible while we load resources
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function AppSplashScreen({ children }) {
  const [appReady, setAppReady] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0];
  const isFinishingRef = useRef(false);
  const nativeSplashHiddenRef = useRef(false);

  const { booting } = useAuth();

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any fonts, images, or data here
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (e) {
        console.warn("Error loading app resources:", e);
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (!appReady || booting || isFinishingRef.current) return;

    isFinishingRef.current = true;

    async function finishSplash() {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: Platform.OS !== "web",
      }).start(() => {
        setAnimationComplete(true);
      });
    }

    finishSplash();
  }, [appReady, booting, fadeAnim]);

  const onLayout = useCallback(async () => {
    if (nativeSplashHiddenRef.current) return;

    nativeSplashHiddenRef.current = true;
    await SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View
        style={animationComplete ? styles.visibleContent : styles.hiddenContent}
      >
        {children}
      </View>

      {!animationComplete && (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Image
            source={require("../../assets/splash_xpro_score.png")}
            style={styles.splashImage}
            resizeMode="contain"
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  splashImage: {
    width: "78%",
    maxWidth: 360,
    height: 360,
  },
  hiddenContent: {
    flex: 1,
    opacity: 0,
  },
  visibleContent: {
    flex: 1,
  },
});
