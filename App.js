import { Camera, CameraType } from "expo-camera";
import { useState, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  cameraWithTensors,
  bundleResourceIO,
} from "@tensorflow/tfjs-react-native";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import "@tensorflow/tfjs-backend-webgl";

const TensorCamera = cameraWithTensors(Camera);
const modelJSON = require("./assets/model.json");
const modelWeight1 = require("./assets/group1-shard1of7.bin");
const modelWeight2 = require("./assets/group1-shard2of7.bin");
const modelWeight3 = require("./assets/group1-shard3of7.bin");
const modelWeight4 = require("./assets/group1-shard4of7.bin");
const modelWeight5 = require("./assets/group1-shard5of7.bin");
const modelWeight6 = require("./assets/group1-shard6of7.bin");
const modelWeight7 = require("./assets/group1-shard7of7.bin");
const labels = require("./assets/labels.json");

export default function App() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const model = useRef(null);
  const [prediction, setPrediction] = useState("");
  const interval = useRef(0);
  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    requestPermission();
  }

  const loadModel = async (images) => {
    try {
      await tf.ready();
      await tf.setBackend("rn-webgl");
      const loadedModel = await tf.loadGraphModel(
        bundleResourceIO(modelJSON, [
          modelWeight1,
          modelWeight2,
          modelWeight3,
          modelWeight4,
          modelWeight5,
          modelWeight6,
          modelWeight7,
        ])
      );
      model.current = loadedModel;
      console.log("model ready");

      startPrediction(images);
    } catch (error) {
      console.log(error);
    }
  };

  const startPrediction = (images) => {
    console.log("starting prediction");
    try {
      const loop = async () => {
        const nextImageTensor = await images.next().value;
        if (nextImageTensor && model.current && interval.current > 25) {
          const input = nextImageTensor.div(255.0).expandDims(0);
          const output = await model.current.executeAsync(input);
          console.log("Output:", !!output);

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
          interval.current = 0;
        }
        interval.current = interval.current + 1;
        tf.dispose([nextImageTensor]);
        requestAnimationFrame(loop);
      };
      loop();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCameraStream = (images) => {
    console.log("camera ready");

    loadModel(images);
  };

  const styles = StyleSheet.create({
    camera: {
      width: "100%",
      height: "90%",
    },
  });

  return (
    <View>
      <TensorCamera
        style={styles.camera}
        type={CameraType.back}
        autorender={true}
        resizeDepth={3}
        resizeHeight={640}
        resizeWidth={640}
        onReady={handleCameraStream}
      ></TensorCamera>
      <Text> Prediction: {prediction} </Text>
    </View>
  );
}
