import React, {useEffect, useState} from 'react';
import {WebView} from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';
import {ActivityIndicator, View, Text, SafeAreaView, StyleSheet } from 'react-native';

export default function App() {
  const [currentUrl, setCurrentUrl] = useState('https://www.ayozat.com');
  const [allUrlsTried, setAllUrlsTried] = useState(false);
  const urlsToTry = [
    'https://www.ayozat.com',
    'http://www.ayozat.com',
    'https://ayozat.com',
    'http://ayozat.com',
  ];

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const handleLoadingError = () => {
    // Find the index of the failed URL
    const failedUrlIndex = urlsToTry.indexOf(currentUrl);

    // If there are more URLs to try, update currentUrl
    if (failedUrlIndex < urlsToTry.length - 1) {
      setCurrentUrl(urlsToTry[failedUrlIndex + 1]);
    } else {
      // Handle case where all URLs failed
      setAllUrlsTried(true);
    }
  };

  if (allUrlsTried) {
    // All URLs failed to load, displaying a message to the user
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 18, textAlign: 'center'}}>
          Sorry, the page is unavailable.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{uri: currentUrl}}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#f30543" />
          </View>
        )}
        onError={handleLoadingError}
        onHttpError={handleLoadingError}
        onMessage={event => {
          console.log('WebView message', event.nativeEvent.data);
        }}
        injectedJavaScript={`
          window.ReactNativeWebView.postMessage(JSON.stringify(window.console));
          true;
        `}
        userAgent="Chrome/58.0.3029.110"
        // cacheEnabled={true}
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
