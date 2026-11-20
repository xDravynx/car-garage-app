import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GarageScreen from "../screens/GarageScreen";
import AddCarScreen from "../screens/AddCarScreen";
import EditCarScreen from "../screens/EditCarScreen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator();

const garageTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bgMain,
    card: colors.bgSurface,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.accent,
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={garageTheme}>
      <Stack.Navigator
        initialRouteName="Garage"
        screenOptions={{
          headerStyle: { backgroundColor: colors.bgSurface },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen
          name="Garage"
          component={GarageScreen}
          options={{ title: "APEX // Garage" }}
        />
        <Stack.Screen
          name="AddCar"
          component={AddCarScreen}
          options={{ title: "Add Vehicle" }}
        />
        <Stack.Screen
          name="EditCar"
          component={EditCarScreen}
          options={{ title: "Edit Vehicle" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}