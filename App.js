import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import MainScreens from "./src/Screens";
import Toast from "react-native-toast-message";

export default function App() {
  return (
    <NavigationContainer>
      <MainScreens />
      <Toast />
    </NavigationContainer>
  );
}
