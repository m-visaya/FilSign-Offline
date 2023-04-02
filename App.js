import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./views/Home";
import Live from "./views/Live";
import Capture from "./views/Capture";
import Media from "./views/Media";
import { NativeBaseProvider } from "native-base";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Live" component={Live} />
          <Stack.Screen name="Capture" component={Capture} />
          <Stack.Screen name="Media" component={Media} />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default App;
