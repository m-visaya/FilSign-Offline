import { Camera, CameraType } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import {
  cameraWithTensors,
  bundleResourceIO,
  detectGLCapabilities,
} from "@tensorflow/tfjs-react-native";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import "@tensorflow/tfjs-backend-webgl";
import modelWeights from "./utils";
import { Box, Spinner, Text, Center, Icon, IconButton } from "native-base";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

const modelJSON = require("../assets/model/model.json");
const labels = require("../assets/model/labels.json");

export default function Capture({ navigation }) {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState("");
  const cameraRef = useRef(null);

  let requestAnimationFrameId = 0;

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

  const predict = async (input) => {
    const output = await model?.executeAsync(input);
    return output;
  };

  const imageToTensor = (image) => {
    const buffer = tf.util.encodeString(image.base64, 'base64');
    const decoded = tf.util.decodeString(buffer, 'binary');
    const imageTensor = tf.node.decodeImage(decoded);
    return imageTensor.expandDims(0);
  };

  const handleCapture = async () => {
    console.log("Capture");

    if (cameraRef) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      const tensor = imageToTensor(photo)
      // const activation = mobilenet.infer(imageToTensor(photo), "conv_preds");
      // const result = await classifier.predictClass(activation);

      // setResult(result.label);
      console.log(photo)
    }
  };

  const startPrediction = async (images, updatePreview, gl) => {
    try {
      console.log("starting prediction");
      await detectGLCapabilities(gl);
      const loop = async () => {
        try {
          const nextImageTensor = images.next().value;
          setPrediction(`None`);
          if (nextImageTensor) {
            const input = nextImageTensor.div(255.0).expandDims(0);
            const output = await predict(input);
            const [boxes, scores, classes] = output.slice(0, 3);
            // const boxes_data = boxes.dataSync();
            const scores_data = scores.dataSync();
            const classes_data = classes.dataSync();
            for (let i = 0; i < scores_data.length; i++) {
              if (scores_data[i] > 0) {
                const class_label = labels[classes_data[i]];
                const score = (scores_data[i] * 100).toFixed(1);
                console.log(class_label, score);
                setPrediction(`Class: ${class_label} Confidence: ${score}`);
              }
            }
            tf.dispose([input, output]);
          }
          updatePreview();
          gl.endFrameEXP();
          tf.dispose([nextImageTensor, images]);
          requestAnimationFrameId = requestAnimationFrame(loop);
        } catch (error) {
          console.log(error);
        }
      };
      loop();
    } catch (error) {
      console.log(error);
    }
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
          <IconButton
            borderRadius="full"
            colorScheme={"light"}
            variant="ghost"
            position={"absolute"}
            top={"8"}
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
          <Camera
            style={{ height: "80%", width: "100%", aspectRatio: 3 / 4 }}
            type={CameraType.back}
            ref={cameraRef}
          ></Camera>
          <Center marginY="auto">
            <IconButton
              borderRadius="full"
              colorScheme={"light"}
              // variant="clear"
              size={"20"}
              icon={
                <Icon
                  as={FontAwesome}
                  name="circle"
                  color="light.300"
                  size={"16"}
                />
              }
              onPress={handleCapture}
            ></IconButton>
            <Text color={"light.400"}>Capture</Text>
            {/* <Text color={"darkBlue.700"}> Prediction </Text>
            <Text color={"light.400"} fontSize="3xl">
              {prediction || "None"}
            </Text> */}
          </Center>
        </Center>
      )}
    </Box>
  );
}
