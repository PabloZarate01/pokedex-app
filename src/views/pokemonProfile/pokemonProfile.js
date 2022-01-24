import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { capitalizeWord, formatID } from "../../utils/stringLib";
import { pokemonTypes } from "../../utils/pokemonTypes";
import { api } from "../../utils/api";
import { ProgressBar } from "react-native-paper";
import Arrow from "../../../assets/arrow.png";
const PokemonProfile = ({ ...props }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [currentPokemon, setCurrentPokemon] = useState({});
  const [pokemonAbilities, setPokemonAbilities] = useState([]);
  const [pokemonStats, setPokemonStats] = useState([]);
  const [PokemonEvolution, setPokemonEvolution] = useState([]);
  const [mainColor, setMainColor] = useState("#333333");
  const [LoadingEvolution, setLoadingEvolution] = useState(true);
  // Recursive to extract data in chain :)
  async function getEvolutionData(evolves_to, data, index = 0) {
    if (index == 0 && evolves_to != null) {
      let evData = evolves_to.chain;
      let nextData = evData.evolves_to;
      delete evData.evolves_to;
      let pokemonData = await api.get("pokemon/" + evData.species.name);
      return await getEvolutionData(
        nextData,
        [{ ...evData, pokemon: pokemonData.data, order: index }],
        index + 1
      );
    }
    if (evolves_to != null && evolves_to.length > 0) {
      let evData = evolves_to[0];
      let nextData = evData.evolves_to;
      delete evData.evolves_to;
      let pokemonData = await api.get("pokemon/" + evData.species.name);

      return await getEvolutionData(
        nextData,
        [...data, { ...evData, pokemon: pokemonData.data, order: index }],
        index + 1
      );
    } else {
      return data;
    }
  }
  useEffect(() => {
    setPokemonAbilities([]);
    setPokemonStats([]);
    if (
      currentPokemon != null &&
      currentPokemon.abilities != null &&
      currentPokemon.abilities.length > 0
    ) {
      currentPokemon.abilities.forEach(async (ability) => {
        let { data } = await api.get(ability.ability.url);
        let englishName = data.names.find((name) => name.language.name == "en");
        data.englishName = englishName;
        data.abilityData = ability;
        setPokemonAbilities((prevData) => [...prevData, data]);
      });
    }
    if (
      currentPokemon != null &&
      currentPokemon.stats != null &&
      currentPokemon.stats.length > 0
    ) {
      currentPokemon.stats.forEach(async (stat) => {
        let { data } = await api.get(stat.stat.url);
        let englishStat = data.names.find((name) => name.language.name == "en");
        data.englishStat = englishStat;
        data.statData = stat;
        setPokemonStats((prevData) => [...prevData, data]);
      });
    }
  }, [currentPokemon]);
  // Evolution
  useEffect(() => {
    async function getEvolution() {
      setLoadingEvolution(true);
      setPokemonEvolution([]);
      if (currentPokemon != null) {
        let species = await api.get("pokemon-species/" + currentPokemon.id);
        let { data } = await api.get(species.data.evolution_chain.url);
        let chainExtractedData = await getEvolutionData(data);
        setLoadingEvolution(false);
        setPokemonEvolution(chainExtractedData);
      }
      return;
    }
    if (currentPokemon != null && currentPokemon.id) {
      getEvolution();
    }
  }, [currentPokemon]);

  useEffect(() => {
    setPokemonAbilities([]);
    if (
      currentPokemon != null &&
      currentPokemon.types != null &&
      currentPokemon.types.length > 0
    ) {
      let { color } = pokemonTypes[currentPokemon.types[0].type.name];
      setMainColor(color);
    }
  }, [currentPokemon]);

  useEffect(() => {
    let pokemon = route.params.pokemon;
    if (!pokemon) {
      Alert.alert("An error occurred while loading the data");
      Toast.show({
        type: "error",
        text1: "Sorry",
        text2: "An error occurred while loading the data",
      });
      navigation.goBack();
    }
    setCurrentPokemon(pokemon);
    navigation.setOptions({ title: capitalizeWord(pokemon.name) });
  }, []);

  if (!currentPokemon) return <ActivityIndicator />;
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <SafeAreaView style={{ flex: 1, width: "100%" }}>
        {/* Header Info */}
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            padding: 5,
            borderBottomColor: "",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Image
              style={{
                borderRadius: 15,
                backgroundColor: "#F2F2F2",
                resizeMode: "contain",
                width: 150,
                height: 150,
              }}
              source={{
                uri: currentPokemon?.sprites?.other?.["official-artwork"]
                  ?.front_default,
              }}
            />
          </View>
          <View style={{ alignItems: "flex-start", flex: 1, padding: 5 }}>
            <Text style={styles.nameTitle}>
              {capitalizeWord(currentPokemon?.name)}
            </Text>
            <Text style={styles.idText}>{formatID(currentPokemon?.id)}</Text>
            <Text
              style={{
                fontSize: 16,
                marginTop: 20,
                marginBottom: 5,
              }}
            >
              Type
            </Text>
            <View style={{ flexDirection: "row" }}>
              {currentPokemon != null &&
                currentPokemon.types?.length > 0 &&
                currentPokemon.types.map((type, index) => {
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
            width: "100%",
            height: 5,
            backgroundColor: mainColor,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            elevation: 5,
          }}
        ></View>
        {/* Header Info */}
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
          <View style={{}}>
            <View
              style={{
                paddingHorizontal: 5,
                marginTop: 15,
              }}
            >
              <View style={{ paddingHorizontal: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <PokemonDataValue
                    label="Height"
                    value={(currentPokemon?.height / 10).toFixed(1)}
                    subfix="m"
                  />
                  <PokemonDataValue
                    label="Base XP"
                    value={currentPokemon?.base_experience}
                    subfix=""
                  />
                  <PokemonDataValue
                    label="Weight"
                    value={(currentPokemon?.weight / 10).toFixed(2)}
                    subfix="kg"
                  />
                </View>
              </View>
            </View>
            <View
              style={{
                paddingHorizontal: 5,
                marginTop: 15,
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 22 }}>
                Abilities
              </Text>
              <View style={{ paddingHorizontal: 10, flexDirection: "row" }}>
                <RenderAbilities
                  mainColor={mainColor}
                  abilities={pokemonAbilities}
                />
              </View>
            </View>
            <View style={{ paddingHorizontal: 5, marginTop: 15 }}>
              <Text style={{ fontWeight: "bold", fontSize: 22 }}>Stats</Text>
              <View style={{ paddingHorizontal: 10 }}>
                <RenderStats mainColor={mainColor} stats={pokemonStats} />
              </View>
            </View>

            <View style={{ paddingHorizontal: 5, marginTop: 15 }}>
              <Text style={{ fontWeight: "bold", fontSize: 22 }}>
                Evolution
              </Text>
              {
                <View
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {LoadingEvolution && (
                    <ActivityIndicator size={"large"} color={mainColor} />
                  )}
                </View>
              }
              <View style={{ paddingHorizontal: 10 }}>
                <RenderEvolution
                  mainColor={mainColor}
                  pokemon={currentPokemon}
                  evolution={PokemonEvolution}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
const PokemonDataValue = ({ subfix = "", label = "", value = "" }) => {
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <Text style={{ fontWeight: "bold", fontSize: 16 }}> {label} </Text>
      <View
        style={{
          backgroundColor: "#E6EAF1",
          padding: 10,
          borderRadius: 5,
          marginTop: 5,
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
          }}
        >
          {value} {subfix}
        </Text>
      </View>
    </View>
  );
};
const RenderAbilities = ({ mainColor, abilities = [] }) => {
  if (abilities.length <= 0) return <View></View>;
  return abilities.map((ability, index) => {
    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: mainColor,
          flex: 1,
          marginHorizontal: 5,
          backgroundColor: "#E6EAF1",
          padding: 10,
          borderRadius: 5,
          marginTop: 5,
        }}
        key={index}
      >
        <Text
          style={{ fontWeight: "bold", paddingTop: 5, textAlign: "center" }}
        >
          {ability.englishName.name}
        </Text>
      </View>
    );
  });
};
const RenderStats = ({ stats = [], mainColor = "#333" }) => {
  if (stats.length <= 0) return <View></View>;
  return stats.map((stat, index) => {
    return (
      <View
        key={index}
        style={{
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <View style={{ flex: 3 }}>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={{ fontWeight: "bold", paddingTop: 5 }}
          >
            {stat.englishStat.name}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 10,
            borderRadius: 10,
            backgroundColor: "#E6EAF1",
            margin: 10,
          }}
        >
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={{
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {stat.statData?.base_stat}
          </Text>
        </View>
        <View
          style={{
            flex: 5,
            justifyContent: "center",
          }}
        >
          <ProgressBar
            style={{ height: 10 }}
            progress={stat.statData?.base_stat / 404}
            color={mainColor}
          />
        </View>
      </View>
    );
  });
};
const RenderEvolution = ({
  pokemon = {},
  evolution = [],
  mainColor = "#333",
}) => {
  if (evolution.length <= 0) return <View></View>;
  return evolution.map((evo, index) => {
    return (
      <View
        key={index}
        style={{
          justifyContent: "space-between",
          flexDirection: "column",
          paddingHorizontal: 10,
          borderRadius: 10,
          backgroundColor: "#E6EAF1",
          margin: 15,
        }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Image
              style={{
                borderRadius: 15,
                resizeMode: "contain",
                width: 110,
                height: 110,
              }}
              source={{
                uri: evo?.pokemon?.sprites?.other?.["official-artwork"]
                  ?.front_default,
              }}
            />
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: 10,
            }}
          >
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{ fontWeight: "bold", fontSize: 18, paddingTop: 5 }}
            >
              {capitalizeWord(evo?.pokemon?.name)}
            </Text>
            <Text style={styles.idText}>{formatID(evo?.pokemon?.id)}</Text>
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              {evo?.pokemon != null &&
                evo?.pokemon.types?.length > 0 &&
                evo?.pokemon.types.map((type, index) => {
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
        {evolution.length != index + 1 && (
          <Image
            style={{
              width: 20,
              height: 20,
              transform: [{ rotate: "90deg" }],
              position: "absolute",
              bottom: -25,
              alignSelf: "center",
              tintColor: mainColor,
            }}
            source={Arrow}
          />
        )}
      </View>
    );
  });
};
const styles = StyleSheet.create({
  nameTitle: {
    fontWeight: "bold",
    fontSize: 24,
    textAlign: "center",
  },
  idText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#5c5c5c",
  },
});
export default PokemonProfile;
