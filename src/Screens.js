import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import PokemonList from "./views/pokemonList/pokemonList";
import PokemonProfile from "./views/pokemonProfile/pokemonProfile";
const MainScreens = () => {
  const MainNavigator = createStackNavigator();
  const PokedexList = createStackNavigator();
  const PokedexScreens = () => {
    return (
      <PokedexList.Navigator initialRouteName="pokemonList">
        <PokedexList.Screen
          name="pokemonList"
          options={{ title: "Pokedex" }}
          component={PokemonList}
        />
      </PokedexList.Navigator>
    );
  };
  const PokemonScreens = () => {
    return (
      <PokedexList.Navigator initialRouteName="pokemonProfile">
        <PokedexList.Screen
          name="pokemonProfile"
          options={{ title: "Pokemon" }}
          component={PokemonProfile}
        />
      </PokedexList.Navigator>
    );
  };

  return (
    <MainNavigator.Navigator>
      <MainNavigator.Screen
        name="pokemons"
        options={{ title: "Pokemons", headerShown: false }}
        component={PokedexScreens}
      />
      <MainNavigator.Screen
        screenOptions={{ headerShown: false }}
        name="pokemon"
        options={{ title: "Pokemon", headerShown: false }}
        component={PokemonScreens}
      />
    </MainNavigator.Navigator>
  );
};
export default MainScreens;
