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
        <Text fontSize={"2xl"} color="light.100">
          Class:
        </Text>
        <Text fontSize={"2xl"} color="darkBlue.500" marginLeft={"2"}>
          {props.prediction ?? "Unknown"}
        </Text>
        <IconButton
          borderRadius="full"
          colorScheme={"light"}
          variant="ghost"
          marginLeft="auto"
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
