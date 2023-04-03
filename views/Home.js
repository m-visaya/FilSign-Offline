import {
  Box,
  Fab,
  Heading,
  Icon,
  HStack,
  IconButton,
  Text,
  Image,
  Button,
  ScrollView,
} from "native-base";
import { FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
  const Illust1 = require("../assets/Home.gif");
  const Logo = require("../assets/logo.png");

  return (
    <Box style={{ flex: 1 }} bg="white" safeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HStack
          px="4"
          py="3"
          justifyContent="space-between"
          alignItems="center"
          w="100%"
        >
          <HStack alignItems="center">

          <Image source={Logo} resizeMethod="resize" alt="Filsign"></Image>

          </HStack>
          <HStack>
            <IconButton
              icon={<Icon as={MaterialIcons} name="more-vert" size="sm" />}
            />
          </HStack>
        </HStack>
        <Box style={{ flex: 1 }}>
          <Heading
            size={"3xl"}
            letterSpacing={"xl"}
            fontWeight={"normal"}
            marginX={5}
          >
            Learn{" "}
            <Text color={"darkBlue.700"} fontWeight={"bold"}>
              FSL
            </Text>{" "}
            {""}
            through
            <Text color={"darkBlue.700"} fontWeight={"bold"}>
              {" "}
              AI
            </Text>
          </Heading>
          <Image source={Illust1} alt="FSL Illustration" height={"56"}></Image>
          <Box marginY={10} marginX={4}>
            <Heading
              color={"darkBlue.700"}
              fontWeight={"medium"}
              fontSize={"xl"}
            >
              Classify FSL
            </Heading>
            <HStack justifyContent={"space-around"} paddingTop={"5"}>
              <Button
                height={"20"}
                width={"20"}
                colorScheme={"dark"}
                bg={"white"}
                borderRadius="2xl"
                shadow="3"
                onPress={() => navigation.navigate("Capture")}
              >
                <Icon
                  as={FontAwesome5}
                  name="camera-retro"
                  size="2xl"
                  alignSelf={"center"}
                  color={"teal.600"}
                />
                <Text
                  color={"darkBlue.700"}
                  fontSize={"2xs"}
                  textTransform={"uppercase"}
                >
                  Capture
                </Text>
              </Button>
              <Button
                height={"20"}
                width={"20"}
                colorScheme={"dark"}
                bg={"white"}
                borderRadius="2xl"
                shadow="3"
                onPress={() => navigation.navigate("Live")}
              >
                <Icon
                  as={Feather}
                  name="radio"
                  size="2xl"
                  color={"red.600"}
                  marginLeft={"0.5"}
                />
                <Text
                  color={"darkBlue.700"}
                  fontSize={"2xs"}
                  textTransform={"uppercase"}
                  textAlign={"center"}
                >
                  Live
                </Text>
              </Button>
              <Button
                height={"20"}
                width={"20"}
                colorScheme={"dark"}
                bg={"white"}
                borderRadius="2xl"
                shadow="3"
                onPress={() => navigation.navigate("Media")}
              >
                <Icon
                  as={FontAwesome5}
                  name="image"
                  size="2xl"
                  alignSelf={"center"}
                  color={"darkBlue.700"}
                />
                <Text
                  color={"darkBlue.700"}
                  fontSize={"2xs"}
                  textTransform={"uppercase"}
                >
                  Image
                </Text>
              </Button>
              <Button
                height={"20"}
                width={"20"}
                colorScheme={"dark"}
                bg={"white"}
                borderRadius="2xl"
                shadow="3"
              >
                <Icon
                  as={FontAwesome5}
                  name="american-sign-language-interpreting"
                  size="2xl"
                  alignSelf={"center"}
                  color={"yellow.500"}
                />
                <Text
                  color={"darkBlue.700"}
                  fontSize={"2xs"}
                  textTransform={"uppercase"}
                >
                  Soon
                </Text>
              </Button>
            </HStack>
          </Box>
          <Box marginX={4}>
            <Heading
              color={"darkBlue.700"}
              fontWeight={"medium"}
              fontSize={"xl"}
            >
              Sign Languages
            </Heading>
            <HStack flexWrap={"wrap"} paddingTop={"5"}>
              <Box width={"43%"} marginBottom={"5"} marginX="auto">
                <Image
                  resizeMode="cover"
                  height={"40"}
                  borderRadius={"2xl"}
                  source={{
                    uri: "https://images.pexels.com/photos/1366997/pexels-photo-1366997.jpeg?auto=compress&cs=tinysrgb",
                  }}
                  alt="Sign language"
                />
                <Text marginTop={"1"} fontWeight={"medium"}>
                  Sign Language n
                </Text>
              </Box>
              <Box width={"43%"} marginBottom={"5"} marginX="auto">
                <Image
                  resizeMode="cover"
                  height={"40"}
                  borderRadius={"2xl"}
                  source={{
                    uri: "https://images.pexels.com/photos/1366997/pexels-photo-1366997.jpeg?auto=compress&cs=tinysrgb",
                  }}
                  alt="Sign language"
                />
                <Text marginTop={"1"} fontWeight={"medium"}>
                  Sign Language n
                </Text>
              </Box>
              <Box width={"43%"} marginBottom={"5"} marginX="auto">
                <Image
                  resizeMode="cover"
                  height={"40"}
                  borderRadius={"2xl"}
                  source={{
                    uri: "https://images.pexels.com/photos/1366997/pexels-photo-1366997.jpeg?auto=compress&cs=tinysrgb",
                  }}
                  alt="Sign language"
                />
                <Text marginTop={"1"} fontWeight={"medium"}>
                  Sign Language n
                </Text>
              </Box>
              <Box width={"43%"} marginBottom={"5"} marginX="auto">
                <Image
                  resizeMode="cover"
                  height={"40"}
                  borderRadius={"2xl"}
                  source={{
                    uri: "https://images.pexels.com/photos/1366997/pexels-photo-1366997.jpeg?auto=compress&cs=tinysrgb",
                  }}
                  alt="Sign language"
                />
                <Text marginTop={"1"} fontWeight={"medium"}>
                  Sign Language n
                </Text>
              </Box>
            </HStack>
          </Box>

          {/* <Fab
            renderInPortal={false}
            shadow={0}
            size="lg"
            color={"black"}
            right={"45%"}
            colorScheme="darkBlue"
            borderRadius={"2xl"}
            icon={
              <Icon color="white" as={FontAwesome5} name="camera" size="2xl" />
            }
          /> */}
        </Box>
      </ScrollView>
    </Box>
  );
};

export default HomeScreen;
