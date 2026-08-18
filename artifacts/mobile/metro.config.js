const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// expo-notifications creates temporary native build dirs during pnpm install
// that get cleaned up before Metro starts. Exclude them to prevent ENOENT errors.
config.resolver.blockList = /expo-notifications_tmp_\d+\/.*/;

module.exports = config;
