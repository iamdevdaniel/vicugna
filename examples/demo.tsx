// import { useState } from "react"
// import {
// 	Alert,
// 	FlatList,
// 	Pressable,
// 	StyleSheet,
// 	Text,
// 	TextInput,
// 	View,
// } from "react-native"
// import { database } from "@/database"
// import type { Note } from "@/database/models/note"

// export default function Index() {
// 	const [text, setText] = useState("")
// 	const [notes, setNotes] = useState<Note[]>([])

// 	const saveNote = async () => {
// 		try {
// 			await database.write(async () => {
// 				const note = await database
// 					.get<Note>("notes")
// 					.create((note) => {
// 						note.text = text
// 					})
// 				Alert.alert("Saved!", `Note saved with ID: ${note.id}`)
// 			})
// 			setText("") // Clear input after saving
// 		} catch (error) {
// 			Alert.alert("Error", `Failed to save: ${error}`)
// 		}
// 	}

// 	const loadNotes = async () => {
// 		try {
// 			const allNotes = await database.get<Note>("notes").query().fetch()
// 			setNotes(allNotes)
// 			Alert.alert("Loaded!", `Found ${allNotes.length} notes`)
// 		} catch (error) {
// 			Alert.alert("Error", `Failed to load: ${error}`)
// 		}
// 	}

// 	const renderNote = ({ item }: { item: Note }) => (
// 		<View style={styles.noteItem}>
// 			<Text style={styles.noteText}>{item.text}</Text>
// 			<Text style={styles.noteId}>ID: {item.id}</Text>
// 		</View>
// 	)

// 	return (
// 		<View style={styles.container}>
// 			<Text style={styles.title}>WatermelonDB Test</Text>
// 			<TextInput
// 				style={styles.input}
// 				value={text}
// 				onChangeText={setText}
// 				placeholder="Type something..."
// 				multiline
// 			/>
// 			<View style={styles.buttonContainer}>
// 				<Pressable style={styles.button} onPress={saveNote}>
// 					<Text style={styles.buttonText}>Save</Text>
// 				</Pressable>
// 				<Pressable style={styles.button} onPress={loadNotes}>
// 					<Text style={styles.buttonText}>Load All</Text>
// 				</Pressable>
// 			</View>
// 			<Text style={styles.listTitle}>Notes ({notes.length}):</Text>
// 			<FlatList
// 				data={notes}
// 				renderItem={renderNote}
// 				keyExtractor={(item) => item.id}
// 				style={styles.list}
// 			/>
// 		</View>
// 	)
// }

// const styles = StyleSheet.create({
// 	container: {
// 		flex: 1,
// 		padding: 20,
// 		paddingTop: 60,
// 	},
// 	title: {
// 		fontSize: 24,
// 		fontWeight: "bold",
// 		textAlign: "center",
// 		marginBottom: 30,
// 	},
// 	input: {
// 		borderWidth: 1,
// 		borderColor: "#ccc",
// 		padding: 15,
// 		borderRadius: 8,
// 		fontSize: 16,
// 		minHeight: 100,
// 		textAlignVertical: "top",
// 		marginBottom: 20,
// 	},
// 	buttonContainer: {
// 		flexDirection: "row",
// 		justifyContent: "space-around",
// 		marginBottom: 20,
// 	},
// 	button: {
// 		backgroundColor: "#007AFF",
// 		paddingVertical: 12,
// 		paddingHorizontal: 30,
// 		borderRadius: 8,
// 	},
// 	buttonText: {
// 		color: "white",
// 		fontSize: 16,
// 		fontWeight: "bold",
// 	},
// 	listTitle: {
// 		fontSize: 18,
// 		fontWeight: "bold",
// 		marginBottom: 10,
// 	},
// 	list: {
// 		flex: 1,
// 	},
// 	noteItem: {
// 		backgroundColor: "#f5f5f5",
// 		padding: 15,
// 		marginBottom: 10,
// 		borderRadius: 8,
// 	},
// 	noteText: {
// 		fontSize: 16,
// 		marginBottom: 5,
// 	},
// 	noteId: {
// 		fontSize: 12,
// 		color: "#666",
// 	},
// })
