import { Center, Image, IconButton, Icon, Text } from "native-base";
import { Ionicons } from "@expo/vector-icons";

const Preview = (props) => {
  const captureAgain = () => {
    props.setURI(null);
  };

  return (
    <Center width={"full"} height={"full"}>
      <Image
        width={"full"}
        height={"full"}
        source={{ uri: props.uri }}
        alt="Image preview"
      ></Image>
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
          {props.prediction ?? "Unknown"}
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
              as={Ionicons}
              name="ios-camera-outline"
              color="light.100"
              size={"3xl"}
            />
          }
          onPress={captureAgain}
        ></IconButton>
      </Center>
    </Center>
  );
};

export default Preview;
