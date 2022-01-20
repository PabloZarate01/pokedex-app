import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { api } from "../../utils/api";
import { pokemonTypes } from "../../utils/pokemonTypes";
import { capitalizeWord, formatID } from "../../utils/stringLib";

const PokemonList = () => {
  const navigation = useNavigation();
  const [pokemonList, setPokemonList] = useState([]);
  const [fetchingPokemonList, setFetchingPokemonList] = useState(true);
  const [nextRequest, setNextRequest] = useState("pokemon");
  const [PokemonListError, setPokemonListError] = useState(false);

  const [searchPokemon, setSearchPokemon] = useState("");
  const [searchingPokemon, setSearchingPokemon] = useState("");

  function  getPokemonsData(type) {
    setFetchingPokemonList(true);
    if (type == "loadFromSwipe") {
      setNextRequest("pokemon");
      setPokemonList([]);
      
    }
    api
      .get(nextRequest)
      .then(({ data }) => {
        let pokemons = data.results;
        let { next } = data;
        setNextRequest(next);
        let allPokemons = [];
        pokemons.forEach(async (pokemon, index) => {
          let { data } = await api.get(pokemon.url);
          allPokemons = [...allPokemons, data];
          if (index + 1 >= pokemons.length) {
            setPokemonList((prevState) => [...prevState, ...allPokemons]);
            setFetchingPokemonList(false);
          }
        });
      })
      .catch((err) => {
        console.log("Error Pokemon List", err);
        setPokemonListError(true);
        setFetchingPokemonList(false);
      });
  }

  const searchPokemonAction = () => {
    setSearchingPokemon(true);
    if (searchPokemon == null || searchPokemon == "") {
      Toast.show({
        type: "info",
        text1: "Ops!",
        text2: "Please write the name or id in the text field",
      });
      setSearchingPokemon(false);
      return;
    }
    api
      .get(`pokemon/${searchPokemon.toLowerCase()}`)
      .then(({ data }) => {
        setSearchingPokemon(false);
        navigation.navigate("pokemon", {
          screen: "pokemonProfile",
          params: { pokemon: data },
        });
      })
      .catch((err) => {
        Toast.show({
          type: "error",
          text1: "Sorry",
          text2: "We couldn't find the pokemon you were looking for",
        });
        setSearchingPokemon(false);
        console.error("Single Pokemon Error", err);
      });
  };

  useEffect(() => {
    getPokemonsData();
  }, []);

  const PokemonListCard = ({ item }) => {
    let loadingImage = false;
    let { color } = pokemonTypes[item.types[0].type.name];
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          navigation.navigate("pokemon", {
            screen: "pokemonProfile",
            params: { pokemon: item },
          });
        }}
      >
        <View
          style={{
            ...styles.pokemonCard,
            borderColor: color != null ? color : "#fff",
          }}
        >
          <View
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "row",
            }}
          >
            <View style={{ flex: 1, flexDirection: "column" }}>
              <View
                style={{
                  flex: 2,
                  justifyContent: "flex-end",
                  paddingLeft: 10,
                  //   backgroundColor: "red",
                }}
              >
                <Text
                  style={styles.pokemonName}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                >
                  {capitalizeWord(item?.name)}
                </Text>
                <Text style={styles.pokemonID}>{formatID(item.id)}</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: 10,
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  {item.types.map((type, index) => {
                    let { color } = pokemonTypes[type.type.name];
                    return (
                      <View
                        key={index}
                        style={{
                          borderRadius: 5,
                          padding: 5,
                          backgroundColor: color,
                          marginEnd: 5,
                        }}
                      >
                        <Text style={{ color: "#fff" }}>
                          {capitalizeWord(type.type.name)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            <View
              style={{
                borderBottomEndRadius: 20,
                borderTopEndRadius: 20,
                backgroundColor: "#F2F2F2",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {<ActivityIndicator size={"small"} animating={loadingImage} />}
              <Image
                onLoadStart={() => {
                  loadingImage = true;
                }}
                onLoadEnd={() => {
                  loadingImage = false;
                }}
                style={{
                  resizeMode: "contain",
                  width: 90,
                  height: 90,
                }}
                source={{
                  uri: item?.sprites?.other?.["official-artwork"]
                    ?.front_default,
                }}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };
  return (
    <ImageBackground
      style={{
        flex: 1,
      }}
      imageStyle={{ resizeMode: "center", opacity: 0.3 }}
      source={{
        uri: "https://upload.wikimedia.org/wikipedia/commons/5/51/Pokebola-pokeball-png-0.png",
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <View
              style={{
                // marginTop: 10,
                width: "100%",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <TextInput
                disabled={searchingPokemon}
                onChangeText={(text) => {
                  setSearchPokemon(text);
                }}
                value={searchPokemon}
                style={{
                  backgroundColor: "#fff",
                  width: "100%",
                  padding: 10,
                  borderWidth: 2,
                  borderRadius: 8,
                  borderColor: "#E6E6E6",
                }}
                placeholder={"Search by pokemon name or id"}
              />
              {searchPokemon != "" && (
                <TouchableOpacity
                  disabled={searchingPokemon}
                  onPress={() => {
                    setSearchPokemon("");
                  }}
                  style={{
                    position: "absolute",
                    right: 70,
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <Text style={{ color: "#333", fontWeight: "bold" }}>
                    {"X"}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                disabled={searchingPokemon}
                onPress={() => {
                  searchPokemonAction();
                }}
                style={{
                  position: "absolute",
                  right: 0,
                  alignItems: "center",
                  padding: 10,
                  borderWidth: 1,
                  borderColor: "#333",
                  backgroundColor: "#333",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {"Search"}
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              contentContainerStyle={{ paddingTop: 20 }}
              onEndReached={() => getPokemonsData("reachEnd")}
              refreshing={fetchingPokemonList}
              onRefresh={() => getPokemonsData("loadFromSwipe")}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              data={pokemonList}
              renderItem={PokemonListCard}
            ></FlatList>
            {pokemonList != null &&
              pokemonList.length > 0 &&
              fetchingPokemonList && <ActivityIndicator size={"large"} />}
            {PokemonListError && (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    paddingHorizontal: 10,
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#000",
                    textAlign: "center",
                  }}
                >
                  {
                    "An error occurred while querying the data, please try again later"
                  }
                </Text>
                <TouchableOpacity
                  onPress={getPokemonsData}
                  style={{
                    marginTop: 10,
                    backgroundColor: "#000",
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {"Reintentar"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  pokemonCard: {
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 20,
    height: 140,
    width: 340,
    zIndex: -1,
    borderWidth: 1.5,
    borderColor: "#d9d9d9",
  },
  pokemonName: {
    fontWeight: "bold",
    fontSize: 18,
  },
  pokemonID: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#5c5c5c",
  },
});
export default PokemonList;
