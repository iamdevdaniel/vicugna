import * as Location from "expo-location"
import { Alert, Linking } from "react-native"

type Coordinates = {
	latitude: number
	longitude: number
}

export async function requestCurrentCoordinates(): Promise<Coordinates | null> {
	try {
		if (!(await Location.hasServicesEnabledAsync())) {
			Alert.alert(
				"Ubicación desactivada",
				"Activa la ubicación del dispositivo e inténtalo nuevamente.",
			)
			return null
		}

		const permission = await Location.requestForegroundPermissionsAsync()
		if (!permission.granted) {
			if (permission.canAskAgain) {
				Alert.alert(
					"Permiso de ubicación",
					"Se necesita el permiso de ubicación para completar las coordenadas.",
				)
			} else {
				Alert.alert(
					"Permiso de ubicación",
					"Habilita el permiso de ubicación en la configuración del dispositivo.",
					[
						{ text: "Cancelar", style: "cancel" },
						{
							text: "Configuración",
							onPress: () => void Linking.openSettings(),
						},
					],
				)
			}
			return null
		}

		const location = await Location.getCurrentPositionAsync({
			accuracy: Location.Accuracy.High,
		})

		return {
			latitude: location.coords.latitude,
			longitude: location.coords.longitude,
		}
	} catch {
		Alert.alert(
			"No se pudo obtener la ubicación",
			"Comprueba la señal del dispositivo e inténtalo nuevamente.",
		)
		return null
	}
}
