import { useState, useEffect } from "react";
// import { StyleSheet, Text, View, Button, Image } from "react-native";
import {
  Image,
  Button,
  Text,
  Center,
  Box,
  Spinner,
  Icon,
  IconButton,
} from "native-base";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import "@tensorflow/tfjs-backend-webgl";
import {
  bundleResourceIO,
  detectGLCapabilities,
  decodeJpeg,
} from "@tensorflow/tfjs-react-native";
import modelWeights from "./utils";
import { manipulateAsync } from "expo-image-manipulator";

const modelJSON = require("../assets/model/model.json");
const labels = require("../assets/model/labels.json");

export default function Media({ navigation }) {
  const [image, setImage] = useState(null);
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState(null);

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
    setPrediction(null);
    if (image !== null)
      (async () => {
        const tensor = await imageToTensor(image);
        await predict(tensor);
      })();
  }, [image]);

  const imageToTensor = async (image) => {
    console.log("preprocessing");
    const processedImage = await manipulateAsync(
      image,
      [{ resize: { width: 640, height: 640 } }],
      { base64: true }
    );
    const imgBuffer = tf.util.encodeString(processedImage.base64, "base64");
    const raw = new Float32Array(imgBuffer);
    const imageTensor = decodeJpeg(raw);
    return imageTensor;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.cancelled) {
      setImage(result.uri);
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
          {image ? (
            <Center width={"full"} height={"full"}>
              <Image
                source={{ uri: image }}
                width={"full"}
                height={"full"}
                resizeMode="contain"
                alt="Picked Image"
              />
              <Center
                marginY="auto"
                flexDir={"row"}
                width={"full"}
                height={"20"}
                paddingX="6"
                position={"absolute"}
                bottom="0"
                bgColor={"black"}
                opacity={60}
              >
                <Text fontSize={"3xl"} color="lightBlue.400">
                  {prediction ?? "Unknown"}
                </Text>
                <IconButton
                  borderRadius="full"
                  colorScheme={"light"}
                  variant="ghost"
                  position={"absolute"}
                  right="0"
                  marginRight="3"
                  icon={
                    <Icon
                      as={MaterialCommunityIcons}
                      name="folder-image"
                      color="light.100"
                      size={"3xl"}
                    />
                  }
                  onPress={pickImage}
                ></IconButton>
              </Center>
            </Center>
          ) : (
            <Button onPress={pickImage}> Pick Image</Button>
          )}
        </Center>
      )}
    </Box>
  );
}
