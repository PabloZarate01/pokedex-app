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

const PokemonProfile = ({
  transparentView = false,
  externalView = false,
  pokemonExternalData = null,
  ...props
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [currentPokemon, setCurrentPokemon] = useState({});
  const [pokemonAbilities, setPokemonAbilities] = useState([]);
  const [pokemonStats, setPokemonStats] = useState([]);
  const [mainColor, setMainColor] = useState("#333333");

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
    if (externalView) {
      if (!pokemonExternalData) return;
      else setCurrentPokemon(pokemonExternalData);
      return;
    }
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

  if (externalView == true && !pokemonExternalData) return <View></View>;
  if (!currentPokemon) return <ActivityIndicator />;
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: transparentView ? "#fff0" : "#fff" }}
      >
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
        <ScrollView>
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
