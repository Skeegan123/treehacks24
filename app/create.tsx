import { useContext, useEffect, useState } from "react";
import {
    Button,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { getLocation, getLocationName } from "@/app/functions/location";
import { ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { TextInput, Image } from "react-native";
import * as Location from "expo-location";
import { AsyncStorageContext } from "./_layout";
import { parse } from "date-fns";

interface Memory {
    id?: number;
    created_at: string;
    file_type: 'image' | 'video' | 'text' | 'audio';
    file_url: string;
    coordinates: string;
    user_id: number;
    title: string;
    description?: string;
}

export default function CreateScreen() {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [location, setLocation] = useState<Location.LocationObject>();
    const [locationName, setLocationName] = useState<string>();
    const [photo, setPhoto] = useState<string>();
    const [userId, setuserId] = useState<number>();
    const { uri } = useLocalSearchParams();

    const navigation = useNavigation();

    useEffect(() => {
        (async () => {
            const currentLocation = await getLocation(setLocation);
            const locationName = await getLocationName(
                setLocationName,
                currentLocation?.coords.latitude!,
                currentLocation?.coords.longitude!
            );
        })();
        const getuserId = async () => {
            try {
                const userId = await AsyncStorage.getItem("id");
                if (userId !== null) {
                    setuserId(parseInt(userId));
                }
            } catch (error) {
                console.error(error);
            }
        };

        getuserId();
    }, []);

    useEffect(() => {
        if (uri) {
            setPhoto(uri as string);
        }
    }, [uri]);

    const handleSave = async () => {
        if (!title || !photo || !location || !userId) return;
        try {
            const response = await fetch("/api/memory/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    created_at: new Date().toISOString(),
                    file_type: "image",
                    file_url: process.env.STORAGE_URL + photo,
                    coordinates: `POINT(${location?.coords.longitude} ${location?.coords.latitude})`,
                    user_id: userId,
                    title: title,
                    description: description,
                }),
            });
            const data = await response.json();
            console.log(data);
            navigation.navigate("index");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Button title="< Back" onPress={() => navigation.goBack()} />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Create a Memory</Text>
                <Text style={styles.title}>Location: {locationName}</Text>
                {photo && (
                    <Image
                        source={{ uri: (process.env.STORAGE_URL + photo) as string }}
                        style={styles.image}
                    />
                )}
                <View
                    style={styles.separator}
                    lightColor="#eee"
                    darkColor="rgba(255,255,255,0.1)"
                />
                <TextInput
                    style={styles.input}
                    onChangeText={setTitle}
                    value={title}
                    placeholder="Title"
                />

                <TextInput
                    style={styles.input}
                    onChangeText={setDescription}
                    value={description}
                    placeholder="Description"
                    multiline
                />
                <Button title="Save" onPress={handleSave} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 50,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
        // Add more styles for your header here
    },
    backButton: {
        position: "absolute",
        left: 10,
        // Add more styles for your back button here
    },
    container: {
        padding: 24,
        flex: 1,
    },
    titleContainer: {
        paddingLeft: 40,
        paddingTop: 40,
    },
    title: {
        marginTop: 18,
        fontSize: 21,
        fontWeight: "bold",
    },
    separator: {
        marginVertical: 24,
        height: 1,
    },
    locationTitle: {
        fontSize: 24,
        fontWeight: "bold",
        paddingLeft: 24,
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    image: {
        width: 200,
        height: 200,
    },
});
