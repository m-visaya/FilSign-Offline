import { Camera, CameraType } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import {
  bundleResourceIO,
  detectGLCapabilities,
  decodeJpeg,
} from "@tensorflow/tfjs-react-native";
import { manipulateAsync } from "expo-image-manipulator";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import "@tensorflow/tfjs-backend-webgl";
import modelWeights from "./utils";
import { Box, Spinner, Text, Center, Icon, IconButton } from "native-base";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import Preview from "./Preview";

const modelJSON = require("../assets/model/model.json");
const labels = require("../assets/model/labels.json");

export default function Capture({ navigation }) {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const cameraRef = useRef(null);
  const cameraReady = useRef(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoURI, setPhotoURI] = useState(null);

  const loadModel = async () => {
    try {
      await tf.ready();
      await tf.setBackend("rn-webgl");
      const loadedModel = await tf.loadGraphModel(
        bundleResourceIO(modelJSON, modelWeights)
      );
      setModel(loadedModel);
      console.log("model ready");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (model === null)
      (async () => {
        await loadModel();
      })();
  }, []);

  if (!permission) {
    return (
      <Center height={"full"} safeArea>
        Please Allow Camera Permissions
      </Center>
    );
  }

  if (!permission.granted) {
    requestPermission();
  }

  const imageToTensor = async (image) => {
    console.log("preprocessing");
    // const imgBuffer = tf.util.encodeString(image, "base64");
    // const raw = new Uint8Array(imgBuffer);
    // const imageTensor = decodeJpeg(raw);
    // const resizedTensor = imageTensor.resizeBilinear([640, 640]);
    // return resizedTensor;
    const processedImage = await manipulateAsync(
      image.uri,
      [{ resize: { width: 640, height: 640 } }],
      { base64: true }
    );
    const imgBuffer = tf.util.encodeString(processedImage.base64, "base64");
    const raw = new Float32Array(imgBuffer);
    const imageTensor = decodeJpeg(raw);
    return imageTensor;
  };

  const handleCapture = async () => {
    if (cameraRef.current && cameraReady.current) {
      setPrediction(null);
      setIsCapturing(true);
      const img = await cameraRef.current.takePictureAsync({
        skipProcessing: true,
      });
      cameraRef.current.pausePreview();
      const tensor = await imageToTensor(img);
      await predict(tensor);
      tensor.dispose();
      setPhotoURI(img.uri);
      setIsCapturing(false);
      console.log(tf.memory());
    }
  };

  const predict = async (tensor) => {
    console.log("predicting");
    tf.tidy(() => {
      const input = tensor.div(255.0).expandDims(0);
      model?.executeAsync(input).then((output) => {
        const scores = output[1];
        const classes = output[2];
        // const boxes_data = boxes.dataSync();
        const scores_data = scores.dataSync();
        const classes_data = classes.dataSync();
        if (scores_data[0] > 0) {
          const class_label = labels[classes_data[0]];
          setPrediction(class_label);
          // console.log(`${class_label} ${scores_data[0] * 100}`);
        }
        input.dispose();
      });
    });
  };

  return (
    <Box>
      {model === null ? (
        <Center height={"full"} bg={"dark.400"} safeArea>
          <Spinner size={"lg"} color="darkBlue.500"></Spinner>
          <Text color="light.300">Initializing YOLO</Text>
        </Center>
      ) : (
        <Center bg={"black"} height={"full"} position={"relative"} safeArea>
          {isCapturing && (
            <Center
              height={"full"}
              width={"full"}
              bg={"black"}
              zIndex="30"
              opacity={60}
              bottom="0"
              position="absolute"
            >
              <Spinner size={"lg"} color="darkBlue.500"></Spinner>
            </Center>
          )}
          <IconButton
            borderRadius="full"
            colorScheme={"light"}
            variant="ghost"
            position={"absolute"}
            top={"2"}
            left={"2"}
            zIndex={"20"}
            icon={
              <Icon
                as={Ionicons}
                name="arrow-back"
                size={"2xl"}
                color="light.300"
              />
            }
            onPress={() => navigation.navigate("Home")}
          ></IconButton>
          {photoURI ? (
            <Preview
              uri={photoURI}
              setURI={setPhotoURI}
              camera={cameraRef}
              prediction={prediction}
            />
          ) : (
            <>
              <Camera
                style={{ height: "100%", width: "100%", aspectRatio: 3 / 4 }}
                type={CameraType.back}
                ref={cameraRef}
                pictureSize="640x480"
                onCameraReady={() => (cameraReady.current = true)}
              ></Camera>
              <IconButton
                position={"absolute"}
                bottom="10"
                borderRadius="full"
                colorScheme={"light"}
                opacity={90}
                size={"24"}
                icon={
                  <Icon
                    as={FontAwesome}
                    name="circle"
                    color="light.300"
                    marginLeft={"2"}
                    size={"20"}
                  />
                }
                onPress={handleCapture}
              ></IconButton>
            </>
          )}
        </Center>
      )}
    </Box>
  );
}
