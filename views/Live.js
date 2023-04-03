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
import { Ionicons } from "@expo/vector-icons";

const TensorCamera = cameraWithTensors(Camera);
const modelJSON = require("../assets/model/model.json");
const labels = require("../assets/model/labels.json");

export default function Live({ navigation }) {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState("");

  const afID = useRef(null);

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
        afID.current = null;
        await loadModel();
      })();

    return () => {
      setPrediction("");
      cancelAnimationFrame(afID.current);
      afID.current = null;
      tf.disposeVariables();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (afID.current != null && afID.current !== 0) {
        cancelAnimationFrame(afID.current);
        afID.current = 0;
      }
    };
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

  const startPrediction = (images) => {
    try {
      console.log("starting prediction");
      const loop = () => {
        tf.tidy(() => {
          try {
            const nextImageTensor = images.next().value;
            setPrediction("");
            if (nextImageTensor) {
              const input = nextImageTensor.div(255.0).expandDims(0);
              model?.executeAsync(input).then((output) => {
                const scores = output[1];
                const classes = output[2];
                // const boxes_data = boxes.dataSync();
                const scores_data = scores.dataSync();
                const classes_data = classes.dataSync();
                if (scores_data[0] > 0) {
                  const class_label = labels[classes_data[0]];
                  setPrediction(class_label);
                }
                input.dispose();
              });
            }
            nextImageTensor.dispose();

            if (afID.current === 0) {
              return;
            }

            afID.current = requestAnimationFrame(loop);
          } catch (error) {
            console.log(error);
          } finally {
            tf.disposeVariables();
          }
        });
      };
      tf.disposeVariables();
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
          <TensorCamera
            style={{ height: "100%", width: "100%", aspectRatio: 3 / 4 }}
            type={CameraType.back}
            resizeDepth={3}
            resizeHeight={320}
            resizeWidth={320}
            onReady={startPrediction}
          ></TensorCamera>
          <Center
            marginY="auto"
            width={"full"}
            flexDir={"row"}
            height={"20"}
            paddingX="6"
            position={"absolute"}
            bottom="0"
            bgColor={"black"}
            opacity={60}
            zIndex={10}
          >
            <Text
              fontSize={"3xl"}
              fontWeight={"semibold"}
              color="lightBlue.400"
            >
              {prediction}
            </Text>
          </Center>
        </Center>
      )}
    </Box>
  );
}
