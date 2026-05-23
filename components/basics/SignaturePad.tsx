import type { SkPath } from "@shopify/react-native-skia"
import { Canvas, Path, Skia } from "@shopify/react-native-skia"
import { useEffect, useRef, useState } from "react"
import { View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { IconButton, useTheme } from "react-native-paper"

type SignaturePadProps = {
	value: string
	onChange: (value: string) => void
}

type PathEntry = { id: number; path: SkPath }

let nextId = 0

export function SignaturePad({ value, onChange }: SignaturePadProps) {
	const theme = useTheme()
	const [completedPaths, setCompletedPaths] = useState<PathEntry[]>([])
	const currentPathRef = useRef<SkPath | null>(null)
	const [, setTick] = useState(0)
	// Track the last value we serialized ourselves so we don't re-parse our own onChange calls
	const lastEmittedRef = useRef<string>("")

	useEffect(() => {
		// Skip if this value was just emitted by us (drawing/clearing)
		if (value === lastEmittedRef.current) return
		if (!value) {
			setCompletedPaths([])
			return
		}
		try {
			const svgStrings: string[] = JSON.parse(value)
			const loaded = svgStrings
				.map((s) => Skia.Path.MakeFromSVGString(s))
				.filter((p): p is SkPath => p !== null)
				.map((path) => ({ id: nextId++, path }))
			setCompletedPaths(loaded)
		} catch {
			// not valid JSON, ignore
		}
	}, [value])

	const gesture = Gesture.Pan()
		.runOnJS(true)
		.minDistance(0)
		.onStart(({ x, y }) => {
			const p = Skia.Path.Make()
			p.moveTo(x, y)
			currentPathRef.current = p
			setTick((n) => n + 1)
		})
		.onUpdate(({ x, y }) => {
			currentPathRef.current?.lineTo(x, y)
			setTick((n) => n + 1)
		})
		.onEnd(() => {
			const p = currentPathRef.current
			if (p) {
				const entry: PathEntry = { id: nextId++, path: p }
				const next = [...completedPaths, entry]
				setCompletedPaths(next)
				currentPathRef.current = null
				const serialized = JSON.stringify(
					next.map((e) => e.path.toSVGString()),
				)
				lastEmittedRef.current = serialized
				onChange(serialized)
			}
		})

	const handleClear = () => {
		setCompletedPaths([])
		currentPathRef.current = null
		lastEmittedRef.current = ""
		onChange("")
	}

	return (
		<View
			style={{
				borderWidth: 1,
				borderColor: theme.colors.outline,
				borderRadius: 4,
				overflow: "hidden",
			}}
		>
			<GestureDetector gesture={gesture}>
				<Canvas
					style={{
						height: 200,
						backgroundColor: "white",
					}}
				>
					{completedPaths.map((e) => (
						<Path
							key={e.id}
							path={e.path}
							strokeWidth={2}
							color="black"
							style="stroke"
							strokeJoin="round"
							strokeCap="round"
						/>
					))}
					{currentPathRef.current !== null && (
						<Path
							path={currentPathRef.current}
							strokeWidth={2}
							color="black"
							style="stroke"
							strokeJoin="round"
							strokeCap="round"
						/>
					)}
				</Canvas>
			</GestureDetector>
			<IconButton
				icon="eraser"
				size={18}
				mode="contained"
				style={{ position: "absolute", top: 4, right: 4, margin: 0 }}
				onPress={handleClear}
			/>
		</View>
	)
}
