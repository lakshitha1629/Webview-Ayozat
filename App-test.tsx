import React, {useEffect, useState, useRef} from 'react';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';
import {ActivityIndicator, View, Text} from 'react-native';
import MusicControl, {Command} from 'react-native-music-control';

export default function App() {
  const webViewRef = useRef<WebView | null>(null);
  const [currentUrl, setCurrentUrl] = useState('https://www.ayozat.com');
  const [allUrlsTried, setAllUrlsTried] = useState(false);
  const urlsToTry = ['https://www.ayozat.com', 'https://ayozat.com'];

  useEffect(() => {
    SplashScreen.hide();

    MusicControl.enableBackgroundMode(true);
    MusicControl.enableControl('play', true)
    MusicControl.enableControl('pause', true)
    MusicControl.enableControl('stop', false)
    MusicControl.enableControl('nextTrack', true)
    MusicControl.enableControl('previousTrack', false)
    MusicControl.enableControl('changePlaybackPosition', true)
    MusicControl.handleAudioInterruptions(true);

    MusicControl.on('play' as Command, () => {
      webViewRef.current?.postMessage(JSON.stringify({action: 'play'}));
    });

    MusicControl.on('pause' as Command, () => {
      webViewRef.current?.postMessage(JSON.stringify({action: 'pause'}));
    });

    return () => {
      MusicControl.stopControl();
    };
  }, []);

  const handlePlayback = (data: any) => {
    if (data.isPlaying) {
      MusicControl.setNowPlaying({
        title: data.trackName,
        artist: data.artistName,
        // Add other media details as needed
      });
      MusicControl.updatePlayback({state: MusicControl.STATE_PLAYING});
    } else {
      MusicControl.updatePlayback({state: MusicControl.STATE_PAUSED});
    }
  };

  const handleLoadingError = () => {
    const failedUrlIndex = urlsToTry.indexOf(currentUrl);
    if (failedUrlIndex < urlsToTry.length - 1) {
      setCurrentUrl(urlsToTry[failedUrlIndex + 1]);
    } else {
      setAllUrlsTried(true);
    }
  };

  if (allUrlsTried) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 18, textAlign: 'center'}}>
          Sorry, the page is unavailable.
        </Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#131313'}}>
      <WebView
        ref={webViewRef}
        source={{uri: currentUrl}}
        startInLoadingState={true}
        renderLoading={() => (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#f30543" />
          </View>
        )}
        onError={handleLoadingError}
        onHttpError={handleLoadingError}
        onMessage={event => {
          try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.action === 'playback') {
              handlePlayback(message.data);
            }
          } catch (e) {
            console.error('Failed to parse message from WebView:', e);
          }
        }}
        injectedJavaScript={`
                    window.ReactNativeWebView.postMessage(JSON.stringify(window.console));

                    window.addEventListener('message', function(event) {
                        const data = JSON.parse(event.data);
                        const audioElement = document.querySelector('audio');
                        
                        if (data.action === 'play') {
                            audioElement.play();
                        } else if (data.action === 'pause') {
                            audioElement.pause();
                        }
                    });

                    true;
                `}
        userAgent="Chrome/58.0.3029.110"
        containerStyle={{backgroundColor: '#131313'}}
        style={{marginTop: 5}}
        originWhitelist={['https://*']}
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        scalesPageToFit={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        incognito={true}
      />
    </View>
  );
}
