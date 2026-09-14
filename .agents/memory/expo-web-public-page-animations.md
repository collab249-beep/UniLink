---
name: Expo Web public-page animations
description: Compatibility rule for public informational routes rendered by Expo Web.
---

Keep public legal and support routes on basic React Native views unless motion is essential; avoid passing composed style arrays through custom Reanimated wrappers on these pages.

**Why:** In this Expo Web setup, that composition caused the browser to treat an array index as a CSS property and crash into the root error boundary, despite native and production bundle compilation succeeding.

**How to apply:** For unauthenticated informational routes, prioritize direct `View`, `Text`, `Image`, and `TouchableOpacity` composition. Add animation only after confirming a fresh direct web load.