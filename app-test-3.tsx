import React, {useEffect, useRef, useState} from 'react';
import {WebView} from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';
import {ActivityIndicator, View, Text} from 'react-native';
import TrackPlayer, {Capability} from 'react-native-track-player';

export default function App() {
  const webViewRef = useRef<WebView | null>(null);
  const [currentUrl, setCurrentUrl] = useState('https://www.ayozat.com');
  const [allUrlsTried, setAllUrlsTried] = useState(false);
  const urlsToTry = ['https://www.ayozat.com', 'https://ayozat.com'];
  const artworkImage = require('./assets/images/ayozat.png');
  const playIcon = require('./assets/images/play_icon.png');

  useEffect(() => {
    SplashScreen.hide();
    setupPlayer();

    const listeners = [
      TrackPlayer.addEventListener('remote-play' as any, () =>
        TrackPlayer.play(),
      ),
      TrackPlayer.addEventListener('remote-pause' as any, () =>
        TrackPlayer.pause(),
      ),
      TrackPlayer.addEventListener('remote-next' as any, () =>
        TrackPlayer.skipToNext(),
      ),
      TrackPlayer.addEventListener('remote-previous' as any, () =>
        TrackPlayer.skipToPrevious(),
      ),
    ];

    return () => {
      // Cleaning up the listeners when the component is unmounted
      listeners.forEach(listener => listener.remove());
    };
  }, []);
  const setupPlayer = async () => {
    await TrackPlayer.setupPlayer();
    TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
    });
  };

  const playTrack = async (url: string, title: string) => {
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: 'trackId',
      url: url,
      title: title,
      artist: 'Ayozat',
      artwork: artworkImage,
    });
    TrackPlayer.play();
  };

  const handlePlayback = (data: any) => {
    if (data.isPlaying) {
      console.log('data.isPlaying', data.isPlaying);
      playTrack(data.url, data.title);
    } else {
      TrackPlayer.pause();
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
            console.log('message-------------', message);
            if (message.type == 'play') {
              console.log(' ------------- play -------------');
              handlePlayback({
                url: message.url,
                title: message.title,
                isPlaying: true,
              });
            } else {
              console.log(' ------------- pause -------------');
              handlePlayback({
                url: message.url,
                title: message.title,
                isPlaying: false,
              });
            }
          } catch (e) {
            console.error('Failed to parse message from WebView:', e);
          }
        }}
        injectedJavaScript={`
        (function () {
          let lastSentURL = '';
          let action = '';

          window.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              const audioElement = document.querySelector('audio');
              
              if (data.action === 'play' && audioElement) {
                // audioElement.play();
              } else if (data.action === 'pause' && audioElement) {
                // audioElement.pause();
              }
            } catch (error) {
              console.error('Failed to handle message:', error);
            }
          });
          const attachAudioEventListeners = (audioElement) => {
            // Attach play event
            audioElement.addEventListener('play', () => {
                sendAudioDetails(audioElement, 'play');
            });
            
            // Attach pause event
            audioElement.addEventListener('pause', () => {
                sendAudioDetails(audioElement, 'pause');
            });
        }
        
        const sendAudioDetails = (audioElement, playbackStatus) => {
            if (audioElement && audioElement.src) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: playbackStatus,
                    url: audioElement.src,
                    title: audioElement.getAttribute('title') || 'Unknown Title'
                }));
            }
        };
        
        const checkAndAttachListeners = () => {
            const audioElement = document.querySelector('audio');
            if (audioElement && !audioElement.__listenersAttached) {
                // Mark this audio element as having listeners attached
                audioElement.__listenersAttached = true;
        
                // Attach the event listeners
                attachAudioEventListeners(audioElement);
        
                // Send the current status immediately
                const initialStatus = audioElement.paused ? 'pause' : 'play';
                sendAudioDetails(audioElement, initialStatus);
            }
        };
        
        const observer = new MutationObserver(checkAndAttachListeners);
        observer.observe(document, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
        });
        
      })();
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
