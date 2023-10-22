cd android
./gradlew clean
./gradlew assembleRelease
./gradlew bundleRelease

npx react-native run-android --verbose

npx react-native start
