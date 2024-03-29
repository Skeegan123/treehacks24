import { Camera, CameraType } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import CircleButton from "@/components/circlebutton";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from '@react-navigation/native';

export default function App() {
  const [type, setType] = useState(CameraType.back);
  const [_, requestCameraPermissions] = Camera.useCameraPermissions();
  const [__, requestAudioPermissions] = Camera.useMicrophonePermissions();
  const [toggleMedia, setToggleMedia] = useState(true);
  // const [togglePicture, setTogglePicture] = useState(true);
  // const [toggleVideo, setToggleVideo] = useState(false);
  const [isStoppedRecording, setIsStoppedRecording] = useState(true);
  const cameraRef = useRef<Camera>(null);

  const navigation = useNavigation();

  useEffect(() => {
    requestCameraPermissions();
    requestAudioPermissions();
  }, []);

  function togglePictureType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  const toggleMediaFunc = () => {
    setToggleMedia((prevToggleMedia) => !prevToggleMedia);
  };

  async function takePicture() {
    if (cameraRef) {
      const options = { quality: 1, base64: true, fixOrientation: true, forceUpOrientation: true };
      const data = await cameraRef.current?.takePictureAsync(options);
      const base64 = data?.base64;
      let uri = data?.uri;

      if (uri) {
        const parts = uri.split('/');
        uri = parts[parts.length - 1];
      }

      try {
        const requestBody = {
          fileName: uri,
          fileData: base64,
          fileType: "image/jpeg"
        };

        const response = await fetch('/api/storage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        const responseData = await response.json();

        // Check if the request was successful
        if (response.ok) {
          console.log('File uploaded successfully:', responseData.url);
        } else {
          console.error('Error uploading file:', responseData.error);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
      // console.log(uri);
      navigation.navigate('create', { uri: uri });
    }
  }

  async function startVideo() {
    if (cameraRef) {
      setIsStoppedRecording(false);
      const data = await cameraRef.current?.recordAsync();
      let uri = data?.uri;
      if (uri) {
        const parts = uri.split('/');
        uri = parts[parts.length - 1];
      }

      if (!uri) {
        console.error('Error starting video recording: URI is undefined');
        setIsStoppedRecording(true);
        return;
      }
      try {
        const response1 = await fetch(uri);
        const videoData = await response1.arrayBuffer();

        // Convert the video file data to base64
        // const base64Video = btoa(new Uint8Array(videoData).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        // const base64Video = Buffer.from(videoData).toString('base64');

        const requestBody = {
          fileName: uri,
          fileData: videoData,
          fileType: "video/mov"
        };

        const response = await fetch('/api/storage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        const responseData = await response.json();

        // Check if the request was successful
        if (response.ok) {
          console.log('File uploaded successfully:', responseData.url);
        } else {
          console.error('Error uploading video file:', responseData.error);
        }
      } catch (error) {
        console.error('Error uploading video file:', error);
      }
      console.log(uri);
    }
  }

  async function stopVideo() {
    if (cameraRef) {
      cameraRef.current?.stopRecording();
      setIsStoppedRecording(true);
      // setToggleVideo(false);
    }
  }

  return (
    <View style={styles.container}>
      {(
        <Camera ref={cameraRef} style={styles.camera} type={type}>

          <View style={styles.buttonContainer}>

            <TouchableOpacity style={styles.button} onPress={toggleMediaFunc}>
              <Icon name="photo-camera" size={40} color="white" />
            </TouchableOpacity>


            {toggleMedia && (
              <TouchableOpacity style={styles.button} onPress={takePicture}>
                <CircleButton onPress={takePicture} title=" " />
                <Text style={styles.text}>PHOTO</Text>
              </TouchableOpacity>
            )}

            {!toggleMedia && (
              <View>
                {isStoppedRecording ? (
                  <TouchableOpacity style={styles.button} onPress={startVideo}>
                    <CircleButton onPress={startVideo} title=" " />
                    <Text style={styles.text}>VIDEO</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.button} onPress={stopVideo}>
                    <CircleButton onPress={stopVideo} title=" " />
                    <Text style={styles.text}>STOP</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={togglePictureType}>
              <Icon name="sync" size={40} color="white" />
            </TouchableOpacity>

          </View>
        </Camera>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'black',
  },
  button: {
    flex: 1,
    alignSelf: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  emptyView: {
    flex: 1,
  },
});
