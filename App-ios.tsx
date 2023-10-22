import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';

export default function App() {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri:'https://www.ayozat.com/' }}
        style={styles.webview}
        originWhitelist={['https://*']}
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        scalesPageToFit={true}
        domStorageEnabled={true}
        scrollEnabled={true}
        incognito={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',  // Adjust top margin color here
  },
  webview: {
    marginTop: 5,
  },
});
