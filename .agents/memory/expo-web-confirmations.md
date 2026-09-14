---
name: Expo Web confirmations
description: Cross-platform confirmation behavior for destructive mobile actions that must also work on Expo Web.
---

Use an in-app modal or sheet state for destructive confirmations with multiple choices, rather than relying on multi-button `Alert.alert`.

**Why:** In this Expo Web environment, multi-button alerts did not reliably appear even though the press handler ran, leaving Leave and Block controls apparently unresponsive.

**How to apply:** Put the question, destructive action, and cancel/stay action inside the existing modal or sheet. Keep a pending state, await the operation, and show errors without closing on failure.