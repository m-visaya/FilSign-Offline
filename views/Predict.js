import { Camera, CameraType } from "expo-camera";
import { useState, useEffect } from "react";
import {
  cameraWithTensors,
  bundleResourceIO,
} from "@tensorflow/tfjs-react-native";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import "@tensorflow/tfjs-backend-webgl";
import modelWeights from "./utils";
import { Box, Spinner, Text, Center } from "native-base";

const TensorCamera = cameraWithTensors(Camera);
const modelJSON = require("../assets/model/model.json");
const labels = require("../assets/model/labels.json");

export default function Predict() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState("");

  let requestAnimationFrameId = 0;
  let frameCount = 0;
  let makePredictionsEveryNFrame = 100;

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

  useEffect(() => {
    return () => {
      cancelAnimationFrame(requestAnimationFrameId);
    };
  }, [requestAnimationFrameId]);

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
    console.log("output");
    tf.dispose([output]);
  };

  const startPrediction = async (images) => {
    console.log("starting prediction");
    try {
      const loop = async () => {
        if (frameCount % makePredictionsEveryNFrame === 0) {
          const nextImageTensor = images.next().value;
          const input = nextImageTensor.div(255.0).expandDims(0);
          const res = await predict(input);
          tf.dispose([nextImageTensor, input, images]);
        }
        frameCount += 1;
        frameCount = frameCount % makePredictionsEveryNFrame;
        requestAnimationFrameId = requestAnimationFrame(loop);

        return;

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
        // setPrediction(`None`);

        requestAnimationFrame(loop);
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
        <Center bg={"black"} height={"full"} safeArea>
          <TensorCamera
            style={{ height: "80%", width: "100%", aspectRatio: 3 / 4 }}
            type={CameraType.back}
            autorender={true}
            resizeDepth={3}
            resizeHeight={640}
            resizeWidth={640}
            onReady={startPrediction}
          ></TensorCamera>
          <Center marginY="auto">
            <Text color={"darkBlue.700"}> Prediction </Text>
            <Text color={"light.400"} fontSize="3xl">
              {prediction || "None"}
            </Text>
          </Center>
        </Center>
      )}
    </Box>
  );
}
